const parseKfc = require("./parser_kfc.js");
const parseMcd = require("./parser_mcd.js");
const parseNfp = require("./parser_nfp.js");

// To-do: maybe wrap these in a function too, call before run().
const parsers = [];
parsers.push(parseKfc, parseMcd, parseNfp);

// To-do: not working, try again tomorrow.
// Problem: BrandId inserted in wrong order (backwards - Fairprice, Mcd, Kfc).
// dbManager.writeOutletsToDb() in each parser? Async-await here not working?
async function run() {
    for (const parser of parsers) {
        await parser();
    }
}

run();
