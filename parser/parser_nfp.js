const Parser = require("./parser.js");

class NfpParser extends Parser {
  static get defaultURL() {
    return "https://public-api.omni.fairprice.com.sg/stores";
  }

  static get defaultBrandDetails() {
    return {
      BrandName: "Fairprice",
      ShortName: "nfp",
      Keywords: "ntuc, fp, fair price, fairprice, supermarket, market, groceries, grocery store, amenities"
    }
  }

  static get defaultSampleFilePath() {
    return super.defaultSampleFilePath.concat("/nfp.json");
  }

  constructor() {
    super(NfpParser.defaultURL, NfpParser.defaultBrandDetails, NfpParser.defaultSampleFilePath);
  }

  getRows(rawJson) {
    let allOutlets = null;
    if (this.isDevMode) {
      try {
        allOutlets = JSON.parse(rawJson);
        allOutlets = allOutlets["data"]["fpstores"];
      } catch (err) {
        throw Error("Failed to convert file contents string into json:", err.message);
      }
    } else {
      allOutlets = rawJson["data"]["fpstores"];
    }

    const data = [];
    for (let outlet of allOutlets) {
      try {
        data.push(this.parseRow(outlet));
      } catch (err) {
        console.error(err.message);
        continue;
      }
    }
    return data;
  }

  getOutletName(outletObj) {
    let name = outletObj["name"].trim();
    if (name.length == 0) {
      throw Error(`Entry for outlet ID ${outletObj["id"]} removed. Outlet name unknown.`);
    }
    return `${this.brandDetails.BrandName} ${name}`;
  }

  getLatitude(outletObj) {
    let latitude = parseFloat(outletObj["lat"]);
    if (isNaN(latitude)) {
      throw Error(`Entry for "${this.getOutletName(outletObj)}" removed. Latitude unknown/invalid.`);
    }
    return latitude;
  }

  getLongitude(outletObj) {
    let longitude = parseFloat(outletObj["long"]);
    if (isNaN(longitude)) {
      throw Error(`Entry for "${this.getOutletName(outletObj)}" removed. Longitude unknown/invalid.`);
    }
    return longitude;
  }

  getPostal(outletObj) {
    let postalCode = outletObj["postalCode"].trim();
    return postalCode.replace(/[^0-9]/g, '');
  }

  getContact(outletObj) {
    let contactNum = outletObj["phone"].trim();
    return contactNum.replace(/\s|(\+65)/g, '');
  }

  getClosing(outletObj) {
    let opening = outletObj["fromTime"].trim(), closing = outletObj["toTime"].trim();
    if (opening.length == 0 && closing.length == 0) {
      return "Opening hours unavailable.";
    } else if (opening.length == 0) {
      return `Closes ${closing}`;
    } else if (closing.length == 0) {
      return `Opens ${opening}`;
    } else {
      return `${opening} - ${closing}`;
    }
  }
}

module.exports = NfpParser;
