const Parser = require("./parser.js");
const jsdom = require("jsdom");

class KFCParser extends Parser {
  static get defaultURL() {
    return "https://www.kfc.com.sg/Location/Search";
  }

  static get defaultBrandDetails() {
    return {
      BrandName: "KFC",
      ShortName: "kfc",
      Keywords: "kfc, kentucky, fast food, restaurant, fried chicken, wings, coleslaw, fries, fried food, finger lickin good"
    }
  }

  static get defaultSampleFilePath() {
    return super.defaultSampleFilePath.concat("/kfc.html");
  }

  constructor() {
    super(KFCParser.defaultURL, KFCParser.defaultBrandDetails, KFCParser.defaultSampleFilePath);
  }

  getRows(rawHtml) {
    try {
      const dom = new jsdom.JSDOM(rawHtml);
      const allOutlets = dom.window.document.querySelectorAll("div.restaurantDetails");
      
      const data = [];
      for (let outlet of allOutlets) {
        data.push(this.parseRow(outlet));
      }

      return data;
    } catch (err) {
      throw Error("Failed to get rows:", err.message);
    }
  }  

  // All these functions are not async because they do not use any async calls
  getOutletName(outletNode) {
    let name = outletNode.getAttribute("data-restaurantname").trim();
    if (name.length == 0) {
      throw Error("Entry removed. Outlet name unknown.");
    }
    return `${this.brandDetails.BrandName} ${name}`;
  }

  getLatitude(outletNode) {
    let latitude = outletNode.getAttribute("data-latitude").trim();
    latitude = parseFloat(latitude);
    if (isNaN(latitude)) {
      throw Error(`Entry for "${this.getOutletName(outletNode)}" removed. Latitude unknown/invalid.`);
    }
    return latitude;
  }

  getLongitude(outletNode) {
    let longitude = outletNode.getAttribute("data-longitude").trim();
    longitude = parseFloat(longitude);
    if (isNaN(longitude)) {
      throw Error(`Entry for "${this.getOutletName(outletNode)}" removed. Longitude unknown/invalid.`);
    }
    return longitude;
  }

  getPostal(outletNode) {
    let postalCode = outletNode.getAttribute("data-address-pincode").trim();
    return postalCode.replace(/[^0-9]/g, '');
  }

  getContact(outletNode) {
    let contactNum = outletNode.getAttribute("data-phoneno").trim();
    return contactNum.replace(/\s/g, '');
  }

  getClosing(outletNode) {
    return outletNode.getAttribute("data-timing").trim();
  }
}

module.exports = KFCParser;
