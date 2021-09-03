// Start a NodeJS web app
require('dotenv').config();

// Pass in currentLatitude and currentLongitude as HTTP GET:
// GET http://localhost:3000/outlets?currentLatitude=1.3104680812609208&currentLongitude=103.86246226812166
// Use currentLatitude and currentLongitude in the SQL statement
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('html')); //dir name

const dbManager = require("./database/db_manager.js");

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

  // This part onwards queries the DB and responds with outlets found within user's
  // selected radius of distance, in increasing order.
  // If none were found, queries again to respond with the top five nearest outlets.
  if (req.query.searchWord.length > 0) {
    const brands = await dbManager.retrieveRelevantBrands(req.query.searchWord);

    if (brands.length === 0) {
      results.messageToUser = "Could not find any brands for this keyword in DB.";
      res.send(results);
      return;
    }

    console.log("Brands", brands);
    brands.forEach( brand => {
      selectedBrands.push(brand['BrandId']);
    })
  }

  let hasNearbyOutlets = true;
  const queryParams = [];
  queryParams.push(
    results.currentLocation.latitude,
    results.currentLocation.longitude,
    results.currentLocation.latitude,
    selectedBrands,
    results.distanceRadius
  );

  let outlets = await dbManager.retrieveRelevantOutlets(hasNearbyOutlets, queryParams);

  if (outlets[0].length === 0) {
    hasNearbyOutlets = false;
    results.messageToUser = `
      Could not find outlets within ${results.distanceRadius} km from your location.<br>
      Here are the top 5 nearest to you instead.
    `;

    // Replace parameter for HAVING clause
    queryParams.pop();
    queryParams.push(defaultDistanceRadius);

    // Query DB again
    outlets = await dbManager.retrieveRelevantOutlets(hasNearbyOutlets, queryParams);
  }

  outlets[0].forEach((outlet) => {
    results.outlets.push({
      name: outlet['OutletName'],
      brandShortName: outlet['ShortName'],
      distance: outlet['distance'].toPrecision(3),
      location: {
        latitude: outlet['Latitude'],
        longitude: outlet['Longitude']
      },
      postal: outlet['Postal'],
      contact: outlet['Contact'],
      closing: outlet['Closing'],
    });
  });

  res.send(results);
});

app.listen(port, () => {
  console.log(`NearMe app listening on port ${port}!`);
});
