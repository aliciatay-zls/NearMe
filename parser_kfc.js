const fetch = require("node-fetch");
const jsdom = require("jsdom");
const dbManager = require("./db_manager.js");


// Generates the brand name and its short form for parsing.
function getBrandDetails(url, shortName) {
    return new Promise((resolve, reject) => {
        try{
            const urlObj = new URL(url);
            var fullName = urlObj.hostname.replace("www", '').replace("com", '').replace("sg", '').replace(/\./g, '').trim();
            fullName = fullName.toUpperCase();
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


// Requests the page, checks the response header and collects raw html
// before converting it into a DOM to be parsed.
function getData(url, brandDetails) {
    return fetch(url, {
    "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "en-US,en;q=0.9,de;q=0.8",
        "cache-control": "max-age=0",
        "sec-ch-ua": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"92\"",
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "_gcl_au=1.1.973224319.1623480306; _ga=GA1.3.261762845.1623480306; __qca=P0-746513972-1623480306139; KFCSG.A.SID=3fsr5fonvrdjgjguutyhk4oo; KFCSG.ReMe=False; KFCSG.IMS=False; KFCSG.A.SID_n=3fsr5fonvrdjgjguutyhk4oo; _gid=GA1.3.1667014086.1627623594; _gat_UA-9403339-2=1; AWSALB=VfYsv8Xp6yv8CljvrqozCBRpksr+gZmqMUbM6To4pv9AQV4bP2cqK9YBXv/Ppyv/plLhSehswM+uwA1EM6GLcckSHZVW9vGXUaibMP6PjXfrqX8jwI1Af9B4fq7v; AWSALBCORS=VfYsv8Xp6yv8CljvrqozCBRpksr+gZmqMUbM6To4pv9AQV4bP2cqK9YBXv/Ppyv/plLhSehswM+uwA1EM6GLcckSHZVW9vGXUaibMP6PjXfrqX8jwI1Af9B4fq7v"
    },
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors"
    })
    .then(res => res.text())
    .then(rawHtml => {
        try {
            const dom = new jsdom.JSDOM(rawHtml);
            return parseForLatLong(dom, brandDetails);
        } catch (err) {
            console.error(err.message);
        }
    });
}


// Parses the DOM object for the outlet details for KFC,
// then writes the collected data into locationsDB.
function parseForLatLong(domObj, brandDetails) {
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
    return Promise.resolve({
        outlets: data, 
        brand: brandDetails
    });
}


// Runner function.
function parseKfc() {
    const url = "https://www.kfc.com.sg/Location/Search";
    const shortName = "kfc";
    const keywordsList = "kfc, restaurant, fried chicken, finger lickin good, chicken, fast food";
    getBrandDetails(url, shortName)
    .then((results) => getData(url, results.data))
    .then(async (results) => {
        await dbManager.writeOutletsToDb(results.outlets, results.brand);
        await dbManager.updateKeywordsInDb(keywordsList, shortName);
        return Promise.resolve("Parsed KFC");
    })
    .catch((err) => console.error("Error:", err.message));
}

module.exports = parseKfc;
