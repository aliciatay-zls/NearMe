const db = require("./db-config.js");

// Writes data to db, displays the data in the table and ends connection to db.
const dbManager = {
    writeOutletsToDb: async function(outletsToBeAdded, brandDetails) {
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
    },
};

module.exports = dbManager;
