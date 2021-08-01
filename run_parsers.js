const KFCParser = require("./parser_kfc.js");
const McdParser = require("./parser_mcd.js");
const NfpParser = require("./parser_nfp.js");

const parsers = [
  new KFCParser(),
  new McdParser(),
  new NfpParser()
];

async function run() {
  for (const parser of parsers) {
    const outlets = await parser.fetchData();
    await parser.saveData(outlets);
  }
}

run();
