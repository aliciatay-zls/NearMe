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
        distanceRadius: 10**9,
        currentLocation: {
            latitude: parseFloat(req.query.currentLatitude),
            longitude: parseFloat(req.query.currentLongitude)
        },
        messageToUser: ""
    };

     //TO-DO: ADD CHECKS WHEN PARAMS ALL EMPTY
     
    let selectedBrands = [];

    await db.transaction(async trx => {
        // Retrieves the IDs of the brands relevant to the user's search
        if (req.query.brand.length > 0) {
            console.log("Find Brand ID for:", req.query.brand);
            const brand = await db('brands')
                .where('ShortName', req.query.brand)
                .select('BrandId', 'BrandName')
                .transacting(trx);

            if (brand.length === 0) {
                results.messageToUser = "Could not find this brand in DB.";
                res.send(results);
                return;
            }

            console.log('Brand', brand);
            results.sectionTitle = brand[0]['BrandName'];
            selectedBrands.push(brand[0]['BrandId']);
        } else if (req.query.category.length > 0) {
            console.log("Find IDs of brands for:", req.query.category);
            const brands = await db('brand_categories')
                .innerJoin('brands', 'brands.BrandId', '=', 'brand_categories.BrandId')
                .innerJoin('categories', 'categories.CategoryId', '=', 'brand_categories.CategoryId')
                .where('categories.CodeName', req.query.category)
                .select('brands.BrandId', 'brands.BrandName', 'categories.CategoryName')
                .transacting(trx);

            if (brands.length === 0) {
                results.messageToUser = "Could not find any brands for this category in DB.";
                res.send(results);
                return;
            }

            console.log('Brands', brands);
            results.sectionTitle = brands[0]['CategoryName'];
            brands.forEach( brand => {
                selectedBrands.push(brand['BrandId']);
            })
        }

        // Retrieves and sends the outlets found, if any, in increasing order of distance
        // and within the specified radius of distance, from the DB
        if (isNaN(parseFloat(req.query.radius))) {
            results.messageToUser = "No distance limit selected. Displaying all outlets found."
        } else {
            results.distanceRadius = parseFloat(req.query.radius);
        };

        const queryParts = [];
        queryParts.push("SELECT o.OutletName, o.Latitude, o.Longitude, o.Postal, o.Contact, o.Closing, b.ShortName, DISTANCE(?, ?, Latitude, Longitude, 'KM' ) AS distance");
        queryParts.push("FROM outlets o INNER JOIN brands b USING(BrandId)");
        queryParts.push("WHERE o.BrandId IN (?) AND DISTANCE(?, ?, Latitude, Longitude, 'KM' ) < ?");
        queryParts.push("ORDER BY distance ASC");

        const queryParams = [];
        queryParams.push(results.currentLocation.latitude);
        queryParams.push(results.currentLocation.longitude);
        queryParams.push(selectedBrands);
        queryParams.push(results.currentLocation.latitude);
        queryParams.push(results.currentLocation.longitude);
        queryParams.push(results.distanceRadius);

        let outlets = await db.raw(queryParts.join(" "), queryParams)
            .transacting(trx);
            
        if (outlets[0].length === 0) {
            results.messageToUser = `Could not find outlets within ${results.distanceRadius}km from your location.`;

            queryParts[2] = "WHERE o.BrandId IN (?)";
            queryParts.push("LIMIT 5");

            queryParams.pop();
            queryParams.pop();
            queryParams.pop();

            outlets = await db.raw(queryParts.join(" "), queryParams)
                .transacting(trx);
                
            results.messageToUser += "<br>Here are the top 5 nearest to you instead."; //assume any brand/category that exists in DB will always have outlets
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
});

app.listen(port, () => {
  console.log(`NearMe app listening on port ${port}!`)
});
