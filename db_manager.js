const config = require("./knexfile.js");

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
            client: 'mysql',
            connection: firstConnection
        });
        
        // Create the database
        // End connection and re-connect with database selected
        knex.raw('CREATE DATABASE locationsDB').then(function () {
            knex.destroy();
            require('dotenv').config();
            knex(config.development);
        });
    },

    // This function enables a connection to be made to the database.
    subsequentRuns: function() {
        const knex = require("knex");
        require('dotenv').config();
        return knex(config.development);
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
        })
        db.destroy();
    }
};

module.exports = dbManager;
