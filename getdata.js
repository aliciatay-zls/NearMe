require('dotenv').config();

const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      database : process.env.DB_NAME,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD
    }
  });

// Retrieve all records as a 2D array
// Iterate the 2D array and console.log
knex.raw("SELECT *, DISTANCE(?, ?, Latitude, Longitude, 'KM' ) AS distance FROM outlets ORDER BY distance ASC", [1.3104680812609208, 103.86246226812166])
  .then(function(rows) {
    let results = []; 
    rows[0].forEach((row) => {
        results.push({ name: row['OutletName'], distance: row['distance']});
    });
    console.log(results);
  })
  .catch((error) => console.error(error))
  .finally(() => knex.destroy());
  