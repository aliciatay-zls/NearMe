const fetch = require("node-fetch");
const csvWriter = require("csv-writer");
const brandsManager = require("./brands_manager.js");

// Declare CSV writer
const createCsvWriter = csvWriter.createObjectCsvWriter;

// Global variables specific to McDonald's
const url = "https://www.mcdonalds.com.sg/wp/wp-admin/admin-ajax.php?action=store_locator_locations";
const dataFilePath = "./data/outlets_mcd.csv";

// Main logic of the code
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
.then(res => res.json()) //get the response as json
.then(jsonObj => parseForLatLong(jsonObj))
.then(brandsManager(url, "mcd", createCsvWriter));

// Creates a unique CSV file containing all outlets
function parseForLatLong(allOutlets) {

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

    // Scan json to collect the records/data
    // For each outlet, get values of the relevant keys to form an entry
    for (outlet of allOutlets) {
        let entry = {};

        let name = outlet["name"].trim();
        if (name.length == 0) {
            console.log("Entry removed. Outlet name unknown.");
            continue;
        }
        entry.name = name;

        let latitude = parseFloat(outlet["lat"].trim());
        if (isNaN(latitude)) {
            console.log(`Entry for ${entry.name} removed. Latitude unknown/invalid.`);
            continue;
        }
        entry.lat = latitude;

        let longitude = parseFloat(outlet["long"].trim());
        if (isNaN(longitude)) {
            console.log(`Entry for ${entry.name} removed. Longitude unknown/invalid.`);
            continue;
        }
        entry.long = longitude;

        let postalCode = outlet["zip"].trim();
        entry.postal = postalCode.replace(/[^0-9]/g, '');

        let contactNum = outlet["phone"].trim();
        entry.contact = contactNum.replace(/\s/g, '');

        let closingText = outlet["op_hours"].replace(/(<([^>]+)>)/ig, '').trim();
        closingText = closingText.replace(/<--|-->/ig, '');
        closingText = closingText.replace(/, |,/ig, '/'); //order matters
        let closingHtml = closingText.replace(/\r\n|\r|\n/g, '<br>');
        if (closingHtml.length == 0) {
            entry.closing = "Opening hours unavailable.";
        } else {
            entry.closing = closingHtml;
        }

        data.push(entry);
    };

    // Write the collected data to a unique CSV file
    csvWriter.writeRecords(data).then( () => {
        console.log(`Written ${data.length} entries to ${dataFilePath}.`);
    });
}
