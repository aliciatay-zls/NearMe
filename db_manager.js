const config = require("./knexfile.js");
require('dotenv').config();
const database = process.env.DB_NAME;

const dbManager = {
    // This function creates and connects to the database.
    firstRun: function() {
        // Connect without selecting a database
        var firstConnection = {
            host : process.env.DB_HOST,
            user : process.env.DB_USER,
            password : process.env.DB_PASSWORD
        };
        var knex = require('knex')({
            client: 'mysql2',
            connection: firstConnection
        });

        // Create the database
        // End connection and re-connect with database selected
        knex.raw("CREATE DATABASE ??", database).then(function () {
            console.log(`"${database}" successfully created.`);
            knex.destroy();
            knex(config.development);
        });
    },

    // This function enables a connection to be made to the database.
    subsequentRuns: function() {
        return knex = require("knex")(config.development);
    },

    // This function connects, writes data, then ends connection to the database.
    writeOutletsToDb: async function(outletsToBeAdded, brandDetails) {
        const db = this.subsequentRuns();
        await db.transaction(async trx => {
            console.log("Inserting brand:", brandDetails)
            const ids = await db('brands')
                .insert(brandDetails, 'id')
                .transacting(trx)

            console.log('IDs', ids)
            outletsToBeAdded.forEach(outlet => outlet.BrandId = ids[0])
            const inserts = await db('outlets')
                .insert(outletsToBeAdded)
                .transacting(trx)

          console.log(inserts.length + ' new outlets saved.')
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

    // This function drops and ends connection to the database.
    drop: function() {
        const knex = require("knex")(config.development);
        knex.raw("DROP DATABASE IF EXISTS ??", database).then(function () {
            console.log(`"${database}" successfully dropped.`);
            knex.destroy();
        });
    }
};

module.exports = dbManager;
