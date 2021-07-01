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
        sectionTitle: 'BRAND',
        outlets: [],
        currentLocation: {
            latitude: parseFloat(req.query.currentLatitude),
            longitude: parseFloat(req.query.currentLongitude)
        }
    };

    //retrieves the brand name for the results that will follow
    knex('brands')
    .where('BrandId', 1)
    .select('BrandName')
    .then(function(rows) {
        results.sectionTitle = rows[0]['BrandName'];
    });

    //retrieves details of outlets sorted by increasing distance from user's current position
    //then sends everything as JSON
    const part1 = "SELECT o.OutletId, o.OutletName, o.Latitude, o.Longitude, o.Postal, o.Contact, o.Closing, b.BrandId, b.BrandName, ";
    const part2 = "DISTANCE(?, ?, Latitude, Longitude, 'KM' ) AS distance FROM outlets o INNER JOIN brands b USING(BrandId) ORDER BY distance ASC";
    const fullQuery = part1.concat(part2);

    knex.raw(fullQuery, [results.currentLocation.latitude, results.currentLocation.longitude])
        .then(function(rows) {
            rows[0].forEach((row) => {
                results.outlets.push({ 
                    name: row['OutletName'], 
                    distance: row['distance'], 
                    postal: row['Postal'], 
                    contact: row['Contact'], 
                    closing: row['Closing']
                });
            });
            res.send(results);
        })
        .catch((error) => console.error(error));
        // .finally(() => knex.destroy());
});

app.use(express.urlencoded({
    extended: true
  }));
  
  app.use(express.json());
  
  app.post('/outlets', (req, res) => {
    res.send(req.body.searchWord); //sends back the word that was searched
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});
