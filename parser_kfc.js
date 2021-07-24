const https = require("https");
const jsdom = require("jsdom");
const dbManager = require("./db_manager.js");


// Global variables specific to KFC
const url = "https://www.kfc.com.sg/Location/Search";
const urlObj = new URL(url);
var fullName = urlObj.hostname.replace("www", '').replace("com", '').replace("sg", '').replace(/\./g, '').trim();
fullName = fullName.toUpperCase();
const shortName = "kfc";
const brandDetails = [
    {brandName: fullName,
    shortName: shortName}
];

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
            parseForLatLong(dom);
        } catch (e) {
            console.error(e.message);
        }
    })
})
.on("error", (e) => {
    console.error(`Got error: ${e.message}`);
});


// Parses the DOM object for the outlet details for KFC,
// then writes the collected data into locationsDB.
function parseForLatLong(domObj) {
    const data = [];
    const brandName = brandDetails[0].brandName.concat(" ");

    const allOutlets = domObj.window.document.querySelectorAll("div.restaurantDetails");
    for (let outlet of allOutlets) {
        let entry = {};

        let name = outlet.getAttribute("data-restaurantname").trim();
        if (name.length == 0) {
            console.log("Entry removed. Outlet name unknown.");
            continue;
        }
        entry.OutletName = brandName.concat(name);

        let latitude = outlet.getAttribute("data-latitude").trim();
        latitude = parseFloat(latitude);
        if (isNaN(latitude)) {
            console.log(`Entry for "${entry.OutletName}" removed. Latitude unknown/invalid.`);
            continue;
        }
        entry.Latitude = latitude;

        let longitude = outlet.getAttribute("data-longitude").trim();
        longitude = parseFloat(longitude);
        if (isNaN(longitude)) {
            console.log(`Entry for "${entry.OutletName}" removed. Longitude unknown/invalid.`);
            continue;
        }
        entry.Longitude = longitude;

        let postalCode = outlet.getAttribute("data-address-pincode").trim();
        entry.Postal = postalCode.replace(/[^0-9]/g, '');

        let contactNum = outlet.getAttribute("data-phoneno").trim();
        entry.Contact = contactNum.replace(/\s/g, '');

        entry.Closing = outlet.getAttribute("data-timing").trim();

        data.push(entry);
    }

    dbManager.writeOutletsToDb(data, brandDetails);
}
