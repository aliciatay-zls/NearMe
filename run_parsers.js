const parseKfc = require("./parser_kfc.js");
const parseMcd = require("./parser_mcd.js");
const parseNfp = require("./parser_nfp.js");

// To-do: maybe wrap these in a function too, call before run().
const parsers = [];
parsers.push(parseKfc, parseMcd, parseNfp);

// Problem: BrandId still inserted in wrong order (whichever finishes first).
// dbManager.writeOutletsToDb() in each parser? Wrong use of promises?
async function run() {
    for (const parser of parsers) {
        await parser();
    }
}

run();
