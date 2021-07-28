const fetch = require("node-fetch");
const dbManager = require("./db_manager.js");


// Generates the brand name and its short form for parsing.
function getBrandDetails(url, shortName) {
    return new Promise((resolve, reject) => {
        try{
            const urlObj = new URL(url);
            var fullName = urlObj.hostname.replace("www", '').replace("com", '').replace("sg", '').replace(/\./g, '').trim();
            fullName = fullName.charAt(0).toUpperCase().concat(fullName.slice(1));
            var temp = [fullName.slice(0,8), fullName.slice(8)];
            temp.splice(1, 0, "\u2019");
            fullName = temp.join('');
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


// Requests the JSON object to be parsed.
function getData(url, brandDetails) {
    fetch(url, {
    "headers": {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en-US,en;q=0.9,de;q=0.8",
        "content-type": "application/json",
        "sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Google Chrome\";v=\"91\", \"Chromium\";v=\"91\"",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "cookie": "PHPSESSID=83c7094d8b521fbf681ffbc675fda00c; _gcl_au=1.1.180086750.1625450966; __utma=268858861.664024032.1625450969.1625450969.1625450969.1; __utmc=268858861; __utmz=268858861.1625450969.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmt=1; __utmb=268858861.7.10.1625450969"
    },
    "referrer": "https://www.mcdonalds.com.sg/locate-us/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "[]",
    "method": "POST",
    "mode": "cors"
    })
    .then(res => res.json())
    .then(jsonObj => parseForLatLong(jsonObj, brandDetails));
}


// Parses the JSON object for the outlet details for McDonald's,
// then writes the collected data into locationsDB.
function parseForLatLong(allOutlets, brandDetails) {
    const data = [];

    for (let outlet of allOutlets) {
        let entry = {};

        let name = outlet["name"].trim();
        if (name.length == 0) {
            console.log("Entry removed. Outlet name unknown.");
            continue;
        }
        entry.OutletName = name;

        let latitude = parseFloat(outlet["lat"].trim());
        if (isNaN(latitude)) {
            console.log(`Entry for "${entry.OutletName}" removed. Latitude unknown/invalid.`);
            continue;
        }
        entry.Latitude = latitude;

        let longitude = parseFloat(outlet["long"].trim());
        if (isNaN(longitude)) {
            console.log(`Entry for "${entry.OutletName}" removed. Longitude unknown/invalid.`);
            continue;
        }
        entry.Longitude = longitude;

        let postalCode = outlet["zip"].trim();
        entry.Postal = postalCode.replace(/[^0-9]/g, '');

        let contactNum = outlet["phone"].trim();
        entry.Contact = contactNum.replace(/\s/g, '');

        let closingText = outlet["op_hours"].replace(/(<([^>]+)>)/ig, '').trim();
        closingText = closingText.replace(/<--|-->/ig, '');
        closingText = closingText.replace(/, |,/ig, '/'); //order matters
        let closingHtml = closingText.replace(/\r\n|\r|\n/g, '<br>');
        if (closingHtml.length == 0) {
            entry.Closing = "Opening hours unavailable.";
        } else {
            entry.Closing = closingHtml;
        }

        data.push(entry);
    }

    dbManager.writeOutletsToDb(data, brandDetails);
}


// Runner function.
function parseMcd() {
    const url = "https://www.mcdonalds.com.sg/wp/wp-admin/admin-ajax.php?action=store_locator_locations";
    const shortName = "mcd";
    getBrandDetails(url, shortName)
    .then((results) => getData(url, results.data))
    .catch((failureObj) => console.error("Error:", failureObj.msg))
    .finally(() => console.log("parsed McDonald's"));
}

module.exports = parseMcd;
