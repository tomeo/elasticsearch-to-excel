const XLSX = require('xlsx');
const json = require('./input.json');

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
  workbook,
  XLSX.utils.json_to_sheet(json.hits.hits.map(hit => hit._source)));
XLSX.writeFile(workbook, 'output.xlsb');