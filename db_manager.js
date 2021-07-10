const db = require("./db-config.js");


// Writes data to db, displays the data in the db and ends connection to db.
function writeToDb(outletsToBeAdded) {
    db('outlets')
    .insert(outletsToBeAdded)
    .then(function() {
        db('outlets')
        .select('*')
        .then(function(rows) {
            console.log(rows);
        })
    })
    .catch((error) => console.error(error))
    .finally (() => {
        db.destroy();
    });
}

module.exports = writeToDb;
