const https = require("https");
const dbManager = require("./db_manager.js");


// Generates the brand name and its short form for parsing.
function getBrandDetails(url, shortName) {
    return new Promise((resolve, reject) => {
        try{
            const urlObj = new URL(url);
            var fullName = urlObj.hostname.replace("www", '').replace("com", '').replace("sg", '').replace("public-api.omni", '').replace(/\./g, '').trim();
            fullName = fullName.charAt(0).toUpperCase().concat(fullName.slice(1));
            const successObj = {
                msg: "Success",
                data: [
                {brandName: fullName,
                shortName: shortName}
                ]
            };
            resolve(successObj);
        } catch(err) {
            const failureObj = {
                msg: err.message
            };
            reject(failureObj);
        }
    });
}


// Requests the page, checks the response header and gets a JSON object to be parsed.
function getData(url, brandDetails) {
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
                parseForLatLong(jsonObj, brandDetails);
            } catch (e) {
                console.error(e.message);
            }
        })
    })
    .on("error", (e) => {
        console.error(`Got error: ${e.message}`);
    });
}


// Parses the JSON object for the outlet details of Fairprice,
// then writes the collected data into locationsDB.
function parseForLatLong(jsonObj, brandDetails) {
    const data = [];
    const brandName = brandDetails[0].brandName.concat(" ");

    for (let outlet of jsonObj["data"]["fpstores"]) {
        let entry = {};

        let name = outlet["name"].trim();
        if (name.length == 0) {
            console.log(`Entry for outlet ID ${outlet["id"]} removed. Outlet name unknown.`);
            continue;
        }
        entry.OutletName = brandName.concat(name);

        let latitude = parseFloat(outlet["lat"]);
        if (isNaN(latitude)) {
            console.log(`Entry for ${entry.OutletName} removed. Latitude unknown/invalid.`);
            continue;
        }
        entry.Latitude = latitude;

        let longitude = parseFloat(outlet["long"]);
        if (isNaN(longitude)) {
            console.log(`Entry for ${entry.OutletName} removed. Longitude unknown/invalid.`);
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


// Runner function.
function parseNfp() {
    const url = "https://public-api.omni.fairprice.com.sg/stores";
    const shortName = "nfp";
    getBrandDetails(url, shortName)
    .then((results) => getData(url, results.data))
    .catch((failureObj) => console.error("Error:", failureObj.msg))
    .finally(() => console.log("parsed Fairprice"));
}

module.exports = parseNfp;
