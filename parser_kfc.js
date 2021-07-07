const https = require("https");
const jsdom = require("jsdom");
const csvWriter = require("csv-writer");
const brandsManager = require("./brands_manager.js");

// Declare CSV writer
const createCsvWriter = csvWriter.createObjectCsvWriter;

// Global variables specific to KFC
const url = "https://www.kfc.com.sg/Location/Search";
const dataFilePath = "./data/outlets_kfc.csv";

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
            parseForLatLong(dom);
        } catch (e) {
            console.error(e.message);
        }
        brandsManager(url, "kfc", createCsvWriter);
    });

}).on("error", (e) => {
    console.error(`Got error: ${e.message}`);
});

// Creates a unique CSV file containing all outlets.
function parseForLatLong(domObj) {
    
    // Initialise CSV writer and array to hold all records (each record is an object)
    const csvWriter = createCsvWriter({
        path: dataFilePath,
        header: [
            {id: "name", title: "NAME"},
            {id: "lat", title: "LAT"},
            {id: "long", title: "LONG"},
            {id: "postal", title: "POSTAL"},
            {id: "contact", title: "CONTACT"},
            {id: "closing", title: "CLOSING"}
        ]
    });
    const data = [];

    // Scan DOM to collect the records/data
    // For each outlet, get values of the relevant nodes to form an entry
    const allRestaurants = domObj.window.document.querySelectorAll("div.restaurantDetails");
    for (let restaurant of allRestaurants) {
        let entry = {};

        let name = restaurant.getAttribute("data-restaurantname").trim();
        if (name.length == 0) {
            console.log("Entry removed. Outlet name unknown.");
            continue;
        }
        entry.name = name;

        let latitude = restaurant.getAttribute("data-latitude").trim();
        latitude = parseFloat(latitude);
        if (isNaN(latitude)) {
            console.log(`Entry for ${entry.name} removed. Latitude unknown/invalid.`);
            continue;
        }
        entry.lat = latitude;

        let longitude = restaurant.getAttribute("data-longitude").trim();
        longitude = parseFloat(longitude);
        if (isNaN(longitude)) {
            console.log(`Entry for ${entry.name} removed. Longitude unknown/invalid.`);
            continue;
        }
        entry.long = longitude;

        let postalCode = restaurant.getAttribute("data-address-pincode").trim();
        entry.postal = postalCode.replace(/[^0-9]/g, '');

        let contactNum = restaurant.getAttribute("data-phoneno").trim();
        entry.contact = contactNum.replace(/\s/g, '');

        entry.closing = restaurant.getAttribute("data-timing").trim();

        data.push(entry);
    }

    // Write the collected data to unique CSV file
    csvWriter.writeRecords(data).then( () => {
        console.log(`Written ${data.length} entries to ${dataFilePath}.`);
    });
}
