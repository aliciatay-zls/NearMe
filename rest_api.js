// Start a NodeJS web app


// Pass in currentLatitude and currentLongitude as HTTP GET:
// GET http://localhost:3000/outlets?currentLatitude=1.3104680812609208&currentLongitude=103.86246226812166
// Use currentLatitude and currentLongitude in the SQL statement
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('html')); //dir name

const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      database : process.env.DB_NAME,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD
    }
  });

// Create a new Route http://localhost:3000/outlets
// Return the 2D array outlets as JSON
app.get('/outlets', (req, res) => {
    const results = {
        outlets: [],
        currentLocation: {
            latitude: parseFloat(req.query.currentLatitude),
            longitude: parseFloat(req.query.currentLongitude)
        }
    };

    knex.raw("SELECT *, DISTANCE(?, ?, Latitude, Longitude, 'KM' ) AS distance FROM outlets ORDER BY distance ASC", [parseFloat(req.query.currentLatitude), parseFloat(req.query.currentLongitude)])
        .then(function(rows) {
            rows[0].forEach((row) => {
                results.outlets.push({ name: row['OutletName'], distance: row['distance'], postal: row['Postal'], contact: row['Contact'], closing: row['Closing']});
            });
            res.send(results)
        })
        .catch((error) => console.error(error))
        // .finally(() => knex.destroy());
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});
