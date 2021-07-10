// Start a NodeJS web app


// Pass in currentLatitude and currentLongitude as HTTP GET:
// GET http://localhost:3000/outlets?currentLatitude=1.3104680812609208&currentLongitude=103.86246226812166
// Use currentLatitude and currentLongitude in the SQL statement
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('html')); //dir name

const db = require("./db-config.js");

// Create a new Route http://nearme.aliciatay.com/outlets
// Return the 2D array outlets as JSON
app.get('/outlets', (req, res) => {
    const results = {
        outlets: [],
        currentLocation: {
            latitude: parseFloat(req.query.currentLatitude),
            longitude: parseFloat(req.query.currentLongitude)
        }
    };

    let selectedBrandId = null;

    //retrieves the brand name for the results that will follow
    if (req.query.brand.length > 0) {
        db('brands')
        .where('ShortName', req.query.brand)
        .select('BrandId', 'BrandName')
        .then(function(rows) {
            if (rows.length == 0) {
                console.log("Could not find brand in DB.");
                res.send(results);
                return;
            }
            selectedBrandId = rows[0]['BrandId'];
            results.sectionTitle = rows[0]['BrandName'];
    
            //retrieves details of outlets sorted by increasing distance from user's current position
            //then sends everything as JSON
            const part1 = "SELECT o.OutletId, o.OutletName, o.Latitude, o.Longitude, o.Postal, o.Contact, o.Closing, b.BrandId, b.BrandName, ";
            const part2 = "DISTANCE(?, ?, Latitude, Longitude, 'KM' ) AS distance FROM outlets o INNER JOIN brands b USING(BrandId) ";
            const part3 = "WHERE o.BrandId = ? "
            const part4 = "ORDER BY distance ASC"
            const fullQuery = part1 + part2 + part3 + part4;
    
            db.raw(fullQuery, [results.currentLocation.latitude, results.currentLocation.longitude, selectedBrandId])
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
                // .finally(() => db.destroy());
        });
    }

    if (req.query.category.length > 0) {
        // To be added
    }
});

app.listen(port, () => {
  console.log(`NearMe app listening on port ${port}!`)
});
