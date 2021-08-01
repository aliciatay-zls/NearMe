const Parser = require("./parser");

class McdParser extends Parser {
  static get defaultURL() {
    return "https://www.mcdonalds.com.sg/wp/wp-admin/admin-ajax.php?action=store_locator_locations";
  }

  static get defaultBrandDetails() {
    return {
      BrandName: "McDonald\u2019s",
      ShortName: "mcd",
      Keywords: "mcd, restaurant, mcdonald's, mcdonalds, macdonalds, hamburger, i'm loving it, burger, cheeseburger, fast food"
    }
  }

  constructor() {
    super(McdParser.defaultURL, McdParser.defaultBrandDetails);
  }

  getRows(allOutlets) {
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
      throw Error("Entry removed. Outlet name unknown.");
    }
    return name;
  }

  getLatitude(outletObj) {
    let latitude = parseFloat(outletObj["lat"].trim());
    if (isNaN(latitude)) {
      throw Error(`Entry for "${this.getOutletName(outletObj)}" removed. Latitude unknown/invalid.`);
    }
    return latitude;
  }

  getLongitude(outletObj) {
    let longitude = parseFloat(outletObj["long"].trim());
    if (isNaN(longitude)) {
      throw Error(`Entry for "${this.getOutletName(outletObj)}" removed. Longitude unknown/invalid.`);
    }
    return longitude;
  }

  getPostal(outletObj) {
    let postalCode = outletObj["zip"].trim();
    return postalCode.replace(/[^0-9]/g, '');
  }

  getContact(outletObj) {
    let contactNum = outletObj["phone"].trim();
    return contactNum.replace(/\s|(\+65)/g, '');
  }

  getClosing(outletObj) {
    let closingText = outletObj["op_hours"].replace(/(<([^>]+)>)/ig, '').trim();
    closingText = closingText.replace(/<--|-->/ig, '');
    closingText = closingText.replace(/, |,/ig, '/'); //order matters
    let closingHtml = closingText.replace(/\r\n|\r|\n/g, '<br>');
    if (closingHtml.length == 0) {
      return "Opening hours unavailable.";
    } else {
      return closingHtml;
    }
  }
}

module.exports = McdParser;
