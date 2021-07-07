const csvWriter = require("csv-writer");
const fs = require("fs");

const brandsFilePath = "./data/brands.csv";

// Creates a central CSV file containing the brand name if file does not exist.
// Otherwise, appends the brand name.
function addBrandToFile(url, shortName, createCsvWriter) {
    let data = [], entry = {};
    let urlObj = new URL(url);

    // Initialise the entry to be added
    entry.brandName = urlObj.hostname.replace("www", '').replace("com", '').replace("sg", '').replace(/\./g, '').toUpperCase().trim();
    entry.shortName = shortName;
    data.push(entry);

    if (fs.existsSync(brandsFilePath)) {
        const csvAppender = csvWriter.createObjectCsvWriter({
            append: true,
            path: brandsFilePath,
            header: [
                {id: "brandName", title: "BRAND"},
                {id: "shortName", title: "SHORTNAME"}
            ]
        });
        csvAppender.writeRecords(data).then( () => {
            console.log("File exists. " + `Written "${entry.brandName}" to ${brandsFilePath}.`);
        });
    } else {
        const csvWriter = createCsvWriter({
            path: brandsFilePath,
            header: [
                {id: "brandName", title: "BRAND"},
                {id: "shortName", title: "SHORTNAME"}
            ]
        });
        csvWriter.writeRecords(data).then( () => {
            console.log("New file created. " + `Written "${entry.brandName}" to ${brandsFilePath}.`);
        });
    }
}

module.exports = addBrandToFile;