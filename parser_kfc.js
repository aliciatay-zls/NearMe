const https = require("https");
const jsdom = require("jsdom");
const mysql = require("mysql");
require('dotenv').config();

// Global variables specific to KFC
const url = "https://www.kfc.com.sg/Location/Search";

// Main logic of the code
https.get(url, (response) => {
    const {statusCode} = response;
    const contentType = response.headers["content-type"];

    // Check response header
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

    // Collect data
    let rawData = "";
    response.on("data", (chunk) => {
        rawData += chunk;
    });

    // Convert into DOM and start parsing
    response.on('end', () => {
        try {
            const dom = new jsdom.JSDOM(rawData);
            parseForLatLong(dom, writeToDb);
        } catch (e) {
            console.error(e.message);
        }
        // brandsManager(url, "kfc", createCsvWriter);
    });

}).on("error", (e) => {
    console.error(`Got error: ${e.message}`);
});

// 
function parseForLatLong(domObj, callback) {

    // Initialise array to hold all records
    const data = [];

    // Scan DOM to collect the records/data
    // For each outlet, get values of the relevant nodes to form an entry
    const allRestaurants = domObj.window.document.querySelectorAll("div.restaurantDetails");
    for (let restaurant of allRestaurants) {
        let entry = [];

        let name = restaurant.getAttribute("data-restaurantname").trim();
        if (name.length == 0) {
            console.log("Entry removed. Outlet name unknown.");
            continue;
        }
        entry.push(name);

        let latitude = restaurant.getAttribute("data-latitude").trim();
        latitude = parseFloat(latitude);
        if (isNaN(latitude)) {
            console.log(`Entry for ${entry.name} removed. Latitude unknown/invalid.`);
            continue;
        }
        entry.push(latitude);

        let longitude = restaurant.getAttribute("data-longitude").trim();
        longitude = parseFloat(longitude);
        if (isNaN(longitude)) {
            console.log(`Entry for ${entry.name} removed. Longitude unknown/invalid.`);
            continue;
        }
        entry.push(longitude);

        let postalCode = restaurant.getAttribute("data-address-pincode").trim();
        entry.push(postalCode.replace(/[^0-9]/g, ''));

        let contactNum = restaurant.getAttribute("data-phoneno").trim();
        entry.push(contactNum.replace(/\s/g, ''));

        entry.push(restaurant.getAttribute("data-timing").trim());

        data.push(entry);
    }

    callback(data);
}

function writeToDb(data) {
    var connection = mysql.createConnection({
        host : process.env.DB_HOST,
        database : process.env.DB_NAME,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD
    });

    connection.connect(function(err) {
        if (err) throw err;
        const insertQuery = "INSERT INTO outlets (OutletName, Latitude, Longitude, Postal, Contact, Closing) VALUES ?";
        connection.query(insertQuery, [data], function(err, results) {
            if (err) throw err;
            console.log(results); //to-fix in the morning (not inserting values correctly)
        });
    }, endConnectionToDb);
}

function endConnectionToDb() {
    connection.end();
}
