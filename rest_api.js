// Start a NodeJS web app


// Pass in currentLatitude and currentLongitude as HTTP GET:
// GET http://localhost:3000/outlets?currentLatitude=1.3104680812609208&currentLongitude=103.86246226812166
// Use currentLatitude and currentLongitude in the SQL statement
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('html')); //dir name

const db = require("./db_manager.js").subsequentRuns();

// Create a new Route http://nearme.aliciatay.com/outlets
// Return the 2D array outlets as JSON
app.get('/outlets', async (req, res) => {
  const defaultDistanceRadius = 10**9;
  const results = {
    outlets: [],
    distanceRadius: defaultDistanceRadius,
    currentLocation: {},
    messageToUser: ""
  };

  try {
    results.currentLocation.latitude = parseFloat(req.query.currentLatitude);
    results.currentLocation.longitude = parseFloat(req.query.currentLongitude);
  } catch (err) {
    console.log("Server managed to receive request even though lat, long was invalid.");
    return;
  } 

  if (!isNaN(parseFloat(req.query.radius))) {
    results.distanceRadius = parseFloat(req.query.radius);
  }
    
  let selectedBrands = [];

  await db.transaction(async trx => {
    // This part retrieves the IDs of the brands relevant to the user's search
    if (req.query.searchWord.length > 0) {
      console.log("Find IDs of brands for:", req.query.searchWord);
      const brands = await db('brands')
        .whereRaw("MATCH (BrandName,Keywords) AGAINST (? IN NATURAL LANGUAGE MODE)", [req.query.searchWord])
        .select('brands.BrandId', 'brands.BrandName')
        .transacting(trx);

      if (brands.length === 0) {
        results.messageToUser = "Could not find any brands for this keyword in DB.";
        res.send(results);
        return;
      }

      console.log('Brands', brands);
      brands.forEach( brand => {
        selectedBrands.push(brand['BrandId']);
      })
    }

    // This part builds and sends a query to the DB, retrieving and sending back outlets within the
    // user's selected radius of distance and in increasing order of distance.
    // If none were found, builds and queries again to send back the top five nearest outlets.
    const queryParts = [];
    const queryParams = [];

    //@@author aliciatay-zls-reused
    //Reused with minor modifications from http://web.archive.org/web/20170126150533/https://developers.google.com/maps/articles/phpsqlsearch_v3#findnearsql
    queryParts.push(
      "SELECT o.OutletName, o.Latitude, o.Longitude, o.Postal, o.Contact, o.Closing, b.ShortName,",
      "( 6371 * acos( cos(radians(?)) * cos(radians(Latitude)) * cos(radians(Longitude) - radians(?)) + sin(radians(?)) * sin(radians(Latitude)) ) ) AS distance ",
      "FROM outlets o INNER JOIN brands b USING(BrandId)",
      "WHERE o.BrandId IN (?)",
      "HAVING distance <= ?",
      "ORDER BY distance ASC"
    );
    queryParams.push(
      results.currentLocation.latitude,
      results.currentLocation.longitude,
      results.currentLocation.latitude,
      selectedBrands,
      results.distanceRadius
    );

    let outlets = await db.raw(queryParts.join(" "), queryParams)
      .transacting(trx);
        
    if (outlets[0].length === 0) {
      results.messageToUser = `
        Could not find outlets within ${results.distanceRadius} km from your location.
        Here are the top 5 nearest to you instead.
      `;

      // Replace parameter for HAVING clause
      queryParts.push("LIMIT 5");
      queryParams.pop();
      queryParams.push(defaultDistanceRadius);

      // Query DB again
      outlets = await db.raw(queryParts.join(" "), queryParams)
        .transacting(trx);
          
      results.messageToUser.concat(""); //assume any brand/category that exists in DB will always have outlets
    }

    outlets[0].forEach((outlet) => {
      results.outlets.push({ 
        name: outlet['OutletName'], 
        brandShortName: outlet['ShortName'],
        distance: outlet['distance'].toPrecision(3), 
        postal: outlet['Postal'], 
        contact: outlet['Contact'], 
        closing: outlet['Closing']
      });
    });

    res.send(results);
  })
});

app.listen(port, () => {
  console.log(`NearMe app listening on port ${port}!`);
});
