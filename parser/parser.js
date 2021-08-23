const axios = require('axios').default;
const dbManager = require("../database/db_manager.js");
const fs = require("fs");

class Parser {
  constructor(url = "", brandDetails = {}, sampleFilePath = "") {
    this.url = url;
    this.brandDetails = brandDetails;
    this.isDevMode = false;
    this.sampleFilePath = sampleFilePath;
  }

  /**
   * @param {boolean} arg
   */
  set newIsDevMode(arg) {
    this.isDevMode = arg;
  }

  static get defaultSampleFilePath() {
    return "sample";
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
    let data = [];
    if (this.isDevMode) {
      try {
        let fileContents = fs.readFileSync(this.sampleFilePath, "utf8");
        data = this.getRows(fileContents);
      } catch (err) {
        throw Error("Failed to read sample data:", err.message);
      }
    } else {
      try {
        const response = await axios.get(this.url);
        data = this.getRows(response.data);
      } catch (err) {
        throw Error("Failed to get data from url:", err.message);
      }
    }

    if (data.length == 0) {
      throw Error("No data fetched.");
    }
    return data;
  }

  async saveData(outlets) {
    try {
      if (outlets.length == 0) {
        console.log("No records found.");
      } else {
        await dbManager.writeOutletsToDb(outlets, this.brandDetails);
      }
    } catch (err) {
      throw Error("Failed to save data:", err.message);
    }
  }
}

module.exports = Parser;
