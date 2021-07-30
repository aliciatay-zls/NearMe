const fetch = require("node-fetch");
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
    return fetch("https://public-api.omni.fairprice.com.sg/stores", {
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
          "cookie": "visid_incap_197681=fvTVyk2WTcWzkjChexv8ryhXxGAAAAAAQUIPAAAAAAASatd7CMHKB1tr5j4PSExO; _gcl_au=1.1.836759756.1623480106; ins_fairprice_userid=1623480110044b312c1e447.b0b233a1; ins_fairprice_listing_catalog=en_US%3AMDA0; visid_incap_2096998=Y1Kp5UPTRtulE4n3TpkiMQaCyWAAAAAAQUIPAAAAAAAgUB7r3JafnSYhFz4kWG/u; ins-storage-version=4; auth_token=; _ga_DEWMQW7L3M=GS1.1.1626149366.1.0.1626149368.0; _ga=GA1.3.2079080817.1623480106; _ga_J1DDCJKLXQ=GS1.1.1626168508.14.0.1626168508.0; incap_ses_1234_2096998=selpAWp7oA8n5a7Y1QwgEUrxA2EAAAAAonspX+3zBHnvgVmbvYs3zg=="
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
    })
    .then(res => res.text())
    .then(rawHtml => {
        try {
            const jsonObj = JSON.parse(rawHtml);
            return parseForLatLong(jsonObj, brandDetails);
        } catch (err) {
            console.error(err.message);
        }
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
    return Promise.resolve({
        outlets: data, 
        brand: brandDetails
    });
}


// Runner function.
function parseNfp() {
    const url = "https://public-api.omni.fairprice.com.sg/stores";
    const shortName = "nfp";
    const keywordsList = "ntuc, supermarket, market, fp, fair price, groceries, grocery, fairprice, amenities";
    getBrandDetails(url, shortName)
    .then((results) => getData(url, results.data))
    .then(async (results) => {
        await dbManager.writeOutletsToDb(results.outlets, results.brand);
        await dbManager.updateKeywordsInDb(keywordsList, shortName);
        return Promise.resolve("Parsed Fairprice");
    })
    .catch((err) => console.error("Error:", err.message));
}

module.exports = parseNfp;
