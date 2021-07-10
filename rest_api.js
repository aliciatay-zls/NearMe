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
app.get('/outlets', async (req, res) => {
    const results = {
        outlets: [],
        currentLocation: {
            latitude: parseFloat(req.query.currentLatitude),
            longitude: parseFloat(req.query.currentLongitude)
        }
    };

    let selectedBrands = null;

    //retrieves the brand name for the results that will follow
    if (req.query.brand.length > 0) {
        await db.transaction(async trx => {
            console.log("Find Brand ID for:", req.query.brand)

            const brands = await db('brands')
                .where('ShortName', req.query.brand)
                .select('BrandId', 'BrandName')
                .transacting(trx);

            if (brands.length === 0) {
                console.log("Could not find brand in DB.");
                res.send(results);
                return;
            }
      
            console.log('Brands', brands)
            selectedBrands = [ brands[0]['BrandId'] ];
            results.sectionTitle = brands[0]['BrandName'];

            const queryParts = [];
            queryParts.push("SELECT o.OutletName, o.Latitude, o.Longitude, o.Postal, o.Contact, o.Closing, b.ShortName, DISTANCE(?, ?, Latitude, Longitude, 'KM' ) AS distance");
            queryParts.push("FROM outlets o INNER JOIN brands b USING(BrandId)");
            queryParts.push("WHERE o.BrandId IN (?)");
            queryParts.push("ORDER BY distance ASC");

            const queryParams = [results.currentLocation.latitude, results.currentLocation.longitude, selectedBrands];

            const outlets = await db.raw(queryParts.join(" "), queryParams)
                .transacting(trx);
                
            if (outlets[0].length === 0) {
                console.log("Could not find outlets in DB.");
                res.send(results);
                return;
            }

            outlets[0].forEach((outlet) => {
                results.outlets.push({ 
                    name: outlet['OutletName'], 
                    brandShortName: outlet['ShortName'],
                    distance: outlet['distance'], 
                    postal: outlet['Postal'], 
                    contact: outlet['Contact'], 
                    closing: outlet['Closing']
                });
            });
            res.send(results);
        })
    }

    if (req.query.category.length > 0) {
        // To be added
    }
});

app.listen(port, () => {
  console.log(`NearMe app listening on port ${port}!`)
});
