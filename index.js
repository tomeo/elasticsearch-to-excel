const XLSX = require('xlsx');
const fs = require('fs');
const axios = require('axios');

const request = (url, body) => {
  return axios({
    method: 'post',
    url,
    data: body,
    headers: {
      'Content-type': 'application/json'
    }
  }).then(response => response.data).catch(error => { 
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
      console.error(error.response.status);
    } else if (error.request) {
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
    }

    return Promise.reject(error);
  })
}

const scroll = (url, hits, total, current, next) => {
  return total === current ? next.then(() => hits) : next.then(response => {
    const nextHits = response.hits.hits

    return scroll(url, hits.concat(nextHits), total, current + nextHits.length, request(`${url}/_search/scroll`, {
      scroll_id: response._scroll_id,
      scroll: '30s'
    }))
  })
}

const fetch = (url, index, query) => 
  request(`${url}/${index}/_search?scroll=1m`, query).then(data => scroll(url, [], data.hits.total, 0, Promise.resolve(data)))

const toFile = (jsonData, output) => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(jsonData));
  XLSX.writeFile(workbook, output);
}

const query = async ({ url, index, queryFile, output }) => {
  const file = await fs.promises.readFile(queryFile);
  const data = await fetch(url, index, JSON.parse(file.toString()));
  toFile(data.map(i => i._source), output);
  return `File successfully created at ${output}!`
};

module.exports = {
  query,
  toFile
};