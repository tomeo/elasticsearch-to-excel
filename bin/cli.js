#!/usr/bin/env node
const program = require('../index')
const fs = require('fs');

require('yargs')
  .scriptName("e2xlsx")
  .usage('$0 <cmd> [args]')
  .command('xlsx [file]', 'returns the provided json file as xlsx', (yargs) => {
    yargs.positional('file', {
      type: 'string',
      default: './input.json',
      describe: 'turn the input.json file to xlsx'
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      default: 'output.xlsx',
      description: 'output file'
    })
  }, async argv => {

    const input = await fs.promises.readFile(argv.file);
    console.log(`xlsx called with ${argv.file} output=${argv.output}`)
    program.toFile(JSON.parse(input.toString()), argv.output);

    console.log(`File writen ${argv.output}`);
  })
  .command('query [file]', 'run the provided query from [file]', (yargs) => {
    yargs.positional('file', {
      type: 'string',
      default: './query.json',
      describe: 'run the query in [file]'
    })
    .option('url', {
      alias: 'u',
      type: 'string',
      default: 'localhost',
      description: 'elasticsearch url'
    })
    .option('port', {
      alias: 'p',
      type: 'string',
      default: '9200',
      description: 'elasticsearch port'
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      default: 'output.xlsx',
      description: 'output file'
    })
    .option('index', {
      alias: 'i',
      type: 'string',
      description: 'elasticsearch index'
    })
    .demandOption(['index'], 'The elasticsearch index must be provided')
  }, async argv => {
    const url = `http://${argv.url}:${argv.port}`;

    console.log(`Fetching data at: ${url} ...`);

    const msg = await program.query({ url, index: argv.index, output: argv.output, queryFile: argv.file });

    console.log(`query done! ${msg}`)
  })
  .argv