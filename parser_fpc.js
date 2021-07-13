const https = require("https");
const dbManager = require("./db_manager.js");


// Global variables specific to Fairprice
const url = "https://public-api.omni.fairprice.com.sg/stores";
const shortName = "nfp";
const urlObj = new URL(url);
const brandDetails = [
    {brandName: urlObj.hostname.replace("www", '').replace("com", '').replace("sg", '').replace("public-api.omni", '').replace(/\./g, '').toUpperCase().trim(),
    shortName: shortName}
];

https
.get(url, (response) => {
    const {statusCode} = response;
    const contentType = response.headers["content-type"];

    let error;
    if (statusCode != 200) {
        error = new Error("Request failed.\n" + `Status code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
        error = new Error("Expected: json.\n" + `Actual: ${contentType}`);
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
            const jsonObj = JSON.parse(rawData);
            parseForLatLong(jsonObj);
        } catch (e) {
            console.error(e.message);
        }
    })
})
.on("error", (e) => {
    console.error(`Got error: ${e.message}`);
});

function parseForLatLong(jsonObj) {
    const data = [];

    for (let outlet of jsonObj["data"]["fpstores"]) {
        let entry = {};

        let name = outlet["name"].trim();
        if (name.length == 0) {
            console.log(`Entry for outlet ID ${outlet["id"]} removed. Outlet name unknown.`);
            continue;
        }
        entry.OutletName = name;

        let latitude = parseFloat(outlet["lat"]);
        if (isNaN(latitude)) {
            console.log(`Entry for ${entry.name} removed. Latitude unknown/invalid.`);
            continue;
        }
        entry.Latitude = latitude;

        let longitude = parseFloat(outlet["long"]);
        if (isNaN(longitude)) {
            console.log(`Entry for ${entry.name} removed. Longitude unknown/invalid.`);
            continue;
        }
        entry.Longitude = longitude;

        let postalCode = outlet["postalCode"].trim();
        entry.Postal = postalCode.replace(/[^0-9]/g, '');

        let contactNum = outlet["phone"].trim();
        entry.Contact = contactNum.replace(/\s|(\+65)/g, '');

        let opening = outlet["fromTime"].trim(), closing = outlet["toTime"].trim();
        if (opening.length == 0 && closing.length == 0) {
            entry.Closing = "Opening hours unavailable.";
        } else if (opening.length == 0) {
            entry.Closing = "Closes " + closing;
        } else if (closing.length == 0) {
            entry.Closing = "Opens " + opening;
        } else {
            entry.Closing = opening + " - " + closing;
        }

        data.push(entry);
    }

    dbManager.writeOutletsToDb(data, brandDetails);
}