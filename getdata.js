const mySql = require("mysql");
const fs = require("fs");


// Connect to MySQL
const connection = mySql.createConnection({
    host: "localhost",
    user: "root",
    password: "mypassword"
});
connection.connect(function(err) {
    if (err) {
        return console.log("connect error: " + err.message);
    }
    readAndExecuteSql();
});

// Execute SQL statements
/**
 * This function reads each mySQL script, extracts the SQL statements and for each
 * statement calls a function to execute it. It then ends the connection to mySQL.
 * NOTE: code not working because of use of mySQL function/delimiter in `distance.sql`.
*/
function readAndExecuteSql() {
    let count = 0;
    const regex1 = /\/\*(\*(?!\/)|[^*])*\*\//; 
    const regex2 = /#.*/g;
    const keywordDelim = "DELIMITER";

    let handler = function(err, data) {
        count++;
        if (err) {
            return console.log("read error: " + err.message);
        }
        const dataStr = data.toString().replace(regex1, "").replace(regex2, "");
        let pos = dataStr.search(keywordDelim);
        if (pos != -1) {
            let functionStrEnd = dataStr.lastIndexOf(keywordDelim);
            executeMultiple(dataStr.substring(0, pos)); //substring() vs substr()
            executeIndividual(dataStr.substring(pos, functionStrEnd));
        } else {
            executeMultiple(dataStr);
        }
        if (count == 2) {
            endConnection();
        }
    };

    fs.readFile("mysql_scripts/setup.sql", handler);
    fs.readFile("mysql_scripts/distance.sql", handler);
    // fs.readFile("mysql_scripts/db.sql", handler);
}

function executeMultiple(sqlStr) {
    let sqlStatements = sqlStr.split(";");
    for (let sqlStatement of sqlStatements) {
        executeIndividual(sqlStatement);
    }
}

function executeIndividual(sqlStatement) {
    let toExecute = sqlStatement.trim();
    if (toExecute == "") {
        return;
    }
    connection.query(toExecute, function (err, results, fields) {
        if (err) {
            return console.error("query error: " + err.message);
        }
        console.log("executed: " + toExecute);
        console.log(results);
    });
}

function endConnection(err) {
    if (err) {
        return console.log("close error: " + err.message);
    }
    console.log("connection closed");
    connection.end();
};

// Retrieve all records as a 2D array

// Iterate the 2D array and console.log
