const KFCParser = require("./parser_kfc.js");
// const parseMcd = require("./parser_mcd.js");
// const parseNfp = require("./parser_nfp.js");

const parsers = [
    new KFCParser()
];

async function run() {
    for (const parser of parsers) {
        const outlets = await parser.fetchData();
        await parser.saveData(outlets);
    }
}

run();
