const https = require("https");
const jsdom = require("jsdom");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const url = "https://www.kfc.com.sg/Location/Search";

https.get(url, (response) => {
    const {statusCode} = response;
    const contentType = response.headers["content-type"];

    //check response header
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

    //collect data
    let rawData = "";
    response.on("data", (chunk) => {
        rawData += chunk;
    });

    //convert into DOM and start parsing
    response.on('end', () => {
        try {
            const dom = new jsdom.JSDOM(rawData);
            parseForLatLong(dom);
        } catch (e) {
            console.error(e.message);
        }
        getBrandName();
    });

}).on("error", (e) => {
    console.error(`Got error: ${e.message}`);
});

//generates a .csv file containing all outlets
function parseForLatLong(domObj) {

    //initialise CSV writer and array to hold all records (each record is an object)
    const csvWriter = createCsvWriter({
        path: "./data/data.csv",
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

    //scan DOM to collect the records/data
    //for each restaurant, get values of the relevant nodes to form an entry
    const allRestaurants = domObj.window.document.querySelectorAll("div.restaurantDetails");
    for (let restaurant of allRestaurants) {
        let entry = {};

        entry.name = restaurant.getAttribute("data-restaurantname").trim();

        let latitude = restaurant.getAttribute("data-latitude").trim();
        entry.lat = parseFloat(latitude);
        if (entry.lat == NaN) {
            entry.lat = 0.0;
        }

        let longitude = restaurant.getAttribute("data-longitude").trim();
        entry.long = parseFloat(longitude);
        if (entry.long == NaN) {
            entry.long = 0.0;
        }

        let postalCode = restaurant.getAttribute("data-address-pincode").trim();
        entry.postal = postalCode.replace(/[^0-9]/g, '');

        console.log(entry.postal);

        let contactNum = restaurant.getAttribute("data-phoneno").trim();
        entry.contact = contactNum.replace(/\s/g, '');

        entry.closing = restaurant.getAttribute("data-timing").trim();

        data.push(entry);
    }

    //write the collected data to a CSV file
    csvWriter.writeRecords(data).then( () => {
        console.log(`Written ${data.length} entries to "data.csv".`);
    });
}

//generates a .csv file containing the brand name
function getBrandName() {

    const csvWriter = createCsvWriter({
        path: "./data/brands.csv",
        header: [
            {id: "brandName", title: "BRAND"},
            {id: "shortName", title: "SHORTNAME"}
        ]
    });
    let data = [], entry = {};
    let urlObj = (new URL(url));
    entry.brandName = urlObj.hostname.replace("www", '').replace("com", '').replace("sg", '').replace(/\./g, '').toUpperCase().trim();
    entry.shortName = "kfc";
    data.push(entry);

    csvWriter.writeRecords(data).then( () => {
        console.log(`Written ${entry.brandName} to "brands.csv".`);
    });
}
