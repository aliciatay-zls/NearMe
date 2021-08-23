const config = require("../knexfile.js");
require('dotenv').config();
const database = process.env.DB_NAME;

const dbManager = {
  // This function creates and connects to the database by first connecting
  // to MySQL without selecting a database, then creating the database "locationsDB",
  // ending connection and re-connecting with database now selected.
  firstRun: function() {
    var firstConnection = {
      host : process.env.DB_HOST,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD
    };
    var knex = require('knex')({
      client: 'mysql2',
      connection: firstConnection
    });

    knex.raw("CREATE DATABASE ??", database).then(function () {
      console.log(`"${database}" successfully created.`);
      knex.destroy();
      knex(config[process.env.NODE_ENV]);
    });
  },

  // This function enables a connection to be made to the database.
  subsequentRuns: function() {
    return require("knex")(config[process.env.NODE_ENV]);
  },

  // This function drops and ends connection to the database.
  dropDb: function() {
    const knex = require("knex")(config[process.env.NODE_ENV]);
    knex.raw("DROP DATABASE IF EXISTS ??", database).then(function () {
      console.log(`"${database}" successfully dropped.`);
      knex.destroy();
    });
  },

  // This function connects, writes data, then ends connection to the database.
  writeOutletsToDb: async function(outletsToBeAdded, brandDetails) {
    const db = this.subsequentRuns();

    await db.transaction(async trx => {
      console.log("Inserting brand:", brandDetails);
      const ids = await db('brands')
        .insert(brandDetails, 'id')
        .transacting(trx);
      console.log('IDs', ids);

      outletsToBeAdded.forEach(outlet => outlet.BrandId = ids[0]);

      const inserts = await db('outlets')
        .insert(outletsToBeAdded)
        .transacting(trx);
      console.log(inserts.length + ' new outlets saved.');
    });
    db.destroy();
  },

  // This function writes the given keywords to the `brands` table under the given brand.
  updateKeywordsInDb: async function(keywords, shortName) {
    const db = this.subsequentRuns();

    await db.transaction(async trx => {
      console.log("Updating keywords for:", shortName);
      await db("brands")
        .where("ShortName", "=", shortName)
        .update("Keywords", keywords)
        .transacting(trx);
      const keywordsList = keywords.split(",");
      console.log(keywordsList.length, "keywords added:", keywordsList.toString());
    });
    db.destroy();
  },

  retrieveRelevantBrands: async function(searchWord) {
    const db = this.subsequentRuns();

    return await db.transaction(async trx => {
      console.log("Find IDs of brands for:", searchWord);
      const brands = await db('brands')
        .whereRaw("MATCH (BrandName,Keywords) AGAINST (? IN NATURAL LANGUAGE MODE)", searchWord)
        .select('brands.BrandId', 'brands.BrandName')
        .transacting(trx);
      return brands;
    });
  },

  retrieveRelevantOutlets: async function(hasNearbyOutlets, params) {
    const db = this.subsequentRuns();
    const rawQuery = this.buildRawQueryForOutlets(hasNearbyOutlets);

    return await db.transaction(async trx => {
      const outlets = await db.raw(rawQuery, params)
        .transacting(trx);
      return outlets;
    });
  },

  //@@author aliciatay-zls-reused
  //Reused with minor modifications from http://web.archive.org/web/20170126150533/https://developers.google.com/maps/articles/phpsqlsearch_v3#findnearsql
  // This function uses the Haversine Forumla to build an in-line MySQL query for
  // retrieving details of outlets of a searched brand, within a distance and in
  // increasing order. Used by `retrieveRelevantOutlets`.
  buildRawQueryForOutlets: function(hasNearbyOutlets) {
    const queryParts = [];
    queryParts.push(
      "SELECT o.OutletName, o.Latitude, o.Longitude, o.Postal, o.Contact, o.Closing, b.ShortName,",
      "( 6371 * acos( cos(radians(?)) * cos(radians(Latitude)) * cos(radians(Longitude) - radians(?)) + sin(radians(?)) * sin(radians(Latitude)) ) ) AS distance ",
      "FROM outlets o INNER JOIN brands b USING(BrandId)",
      "WHERE o.BrandId IN (?)",
      "HAVING distance <= ?",
      "ORDER BY distance ASC"
    );

    // Display only top five
    if (!hasNearbyOutlets) {
      queryParts.push("LIMIT 5");
    }

    return queryParts.join(" ");
  }

};

module.exports = dbManager;
