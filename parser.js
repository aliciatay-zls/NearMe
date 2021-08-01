const axios = require('axios').default;
const dbManager = require("./db_manager.js");

class Parser {
    constructor(url = "", brandDetails = {}, isDevMode = false) {
        this.url = url;
        this.brandDetails = brandDetails;
        this.isDevMode = isDevMode;
    }

    getRows(rawData) {
        throw Error('Please implement the getRows method');
    }

    parseRow(rowObj) {
        return {
            OutletName: this.getOutletName(rowObj),
            Latitude: this.getLatitude(rowObj),
            Longitude: this.getLongitude(rowObj),
            Postal: this.getPostal(rowObj),
            Contact: this.getContact(rowObj),
            Closing: this.getClosing(rowObj),
        }
    }

    getOutletName(rowObj) {
        throw Error('Please implement the getOutLetName method');
    }

    getLatitude(rowObj) {
        throw Error('Please implement the getLatitude method');
    }

    getLongitude(rowObj) {
        throw Error('Please implement the getLongitude method');
    }

    getPostal(rowObj) {
        throw Error('Please implement the getPostal method');
    }
    
    getContact(rowObj) {
        throw Error('Please implement the getContact method');
    }

    getClosing(rowObj) {
        throw Error('Please implement the getClosing method');
    }

    async fetchData() {
        try {
            let data = [];
            if (this.isDevMode === true) {
                // TODO: FS read
                data = this.getRows(fileContents);
            } else {
                const response = await axios.get(this.url);
                data = this.getRows(response.data);
            }

            if (data.length == 0) {
                throw Error("No data fetched.");
            }
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    async saveData(outlets) {
        try {
            if (outlets.length == 0) {
                console.log("No records found.");
            } else {
                await dbManager.writeOutletsToDb(outlets, this.brandDetails);
            }
        } catch (error) {
            console.error(error);
        }

    }
}

module.exports = Parser;
