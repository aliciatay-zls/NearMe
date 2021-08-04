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
  const results = {
    outlets: [],
    distanceRadius: 10**9,
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
    // Retrieves the IDs of the brands relevant to the user's search
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

    // Builds and sends a query to the DB, retrieving and sending back outlets within the
    // user's selected radius of distance and in increasing order of distance.
    // If none were found, builds and queries again to send back the top five nearest outlets.
    const queryParts = [];
    queryParts.push(
      "SELECT o.OutletName, o.Latitude, o.Longitude, o.Postal, o.Contact, o.Closing, b.ShortName, DISTANCE(?, ?, Latitude, Longitude, 'KM' ) AS distance",
      "FROM outlets o INNER JOIN brands b USING(BrandId)",
      "WHERE o.BrandId IN (?) AND DISTANCE(?, ?, Latitude, Longitude, 'KM' ) <= ?",
      "ORDER BY distance ASC"
    );
    const queryParams = [];
    queryParams.push(
      results.currentLocation.latitude,
      results.currentLocation.longitude,
      selectedBrands,
      results.currentLocation.latitude,
      results.currentLocation.longitude,
      results.distanceRadius
    );

    let outlets = await db.raw(queryParts.join(" "), queryParams)
      .transacting(trx);
        
    if (outlets[0].length === 0) {
      results.messageToUser = `Could not find outlets within ${results.distanceRadius}km from your location.`;

      // Remove second part of WHERE clause and corresponding parameters
      queryParts[2] = "WHERE o.BrandId IN (?)";
      queryParts.push("LIMIT 5");
      queryParams.pop();
      queryParams.pop();
      queryParams.pop();

      // Query DB again
      outlets = await db.raw(queryParts.join(" "), queryParams)
        .transacting(trx);
          
      results.messageToUser.concat("<br>Here are the top 5 nearest to you instead."); //assume any brand/category that exists in DB will always have outlets
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
