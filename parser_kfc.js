const https = require("https");
const jsdom = require("jsdom");
const db = require("./db-config.js");


// Global variables specific to KFC
const url = "https://www.kfc.com.sg/Location/Search";


// Requests the page, checks the response header and collects raw html
// before converting it into a DOM to be parsed.
https
.get(url, (response) => {
    const {statusCode} = response;
    const contentType = response.headers["content-type"];

    let error;
    if (statusCode != 200) {
        error = new Error("Request failed.\n" + `Status code: ${statusCode}`);
    } else if (!/^text\/html/.test(contentType)) {
        error = new Error("Expected: html.\n" + `Actual: ${contentType}`);
    }
    if (error) {
        console.error(error.message);
        response.resume();
        return;
    }

    let rawData = "";
    response.on("data", (chunk) => {
        rawData += chunk;
    });

    response.on('end', () => {
        try {
            const dom = new jsdom.JSDOM(rawData);
            parseForLatLong(dom, writeToDb);
        } catch (e) {
            console.error(e.message);
        }
    })
})
.on("error", (e) => {
    console.error(`Got error: ${e.message}`);
});


// Parses the DOM object for the outlet details, then writes the
// collected data into locationsDB.
function parseForLatLong(domObj, callback) {

    const data = [];

    const allRestaurants = domObj.window.document.querySelectorAll("div.restaurantDetails");
    for (let restaurant of allRestaurants) {
        let entry = {};

        let name = restaurant.getAttribute("data-restaurantname").trim();
        if (name.length == 0) {
            console.log("Entry removed. Outlet name unknown.");
            continue;
        }
        entry.OutletName = name;

        let latitude = restaurant.getAttribute("data-latitude").trim();
        latitude = parseFloat(latitude);
        if (isNaN(latitude)) {
            console.log(`Entry for ${entry.name} removed. Latitude unknown/invalid.`);
            continue;
        }
        entry.Latitude = latitude;

        let longitude = restaurant.getAttribute("data-longitude").trim();
        longitude = parseFloat(longitude);
        if (isNaN(longitude)) {
            console.log(`Entry for ${entry.name} removed. Longitude unknown/invalid.`);
            continue;
        }
        entry.Longitude = longitude;

        let postalCode = restaurant.getAttribute("data-address-pincode").trim();
        entry.Postal = postalCode.replace(/[^0-9]/g, '');

        let contactNum = restaurant.getAttribute("data-phoneno").trim();
        entry.Contact = contactNum.replace(/\s/g, '');

        entry.Closing = restaurant.getAttribute("data-timing").trim();

        data.push(entry);
    }

    callback(data);
}


// Writes data to db, displays the data in the db and ends connection to db.
function writeToDb(kfcOutlets) {
    db('outlets')
    .insert(kfcOutlets)
    .then(function() {
        db('outlets')
        .select('*')
        .then(function(rows) {
            console.log(rows);
        })
    })
    .catch((error) => console.error(error))
    .finally (() => {
        db.destroy();
    });
}
