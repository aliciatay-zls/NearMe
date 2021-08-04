const KFCParser = require("./parser_kfc.js");
const McdParser = require("./parser_mcd.js");
const NfpParser = require("./parser_nfp.js");

const parsers = [
  new KFCParser(),
  new McdParser(),
  new NfpParser()
];

async function runInDevMode() {
  console.log("Running all parsers in dev mode...");
  for (const parser of parsers) {
    parser.newIsDevMode = true;
    const outlets = await parser.fetchData();
    await parser.saveData(outlets);
  }
}

async function run() {
  console.log("Running all parsers...");
  for (const parser of parsers) {
    const outlets = await parser.fetchData();
    await parser.saveData(outlets);
  }
}

function main() {
  if (process.argv.length > 2) {
    if (process.argv[2] !== "dev") {
      throw Error(`Argument "${process.argv[2]}" not recognised. 
      Use "-- dev" or "dev" to  run parsers in dev mode, 
      or leave empty to run in normal mode.`);
    }
    runInDevMode();
  } else {
    run();
  }
}

main();
