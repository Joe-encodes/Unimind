const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'data.json');

const readData = () => {
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };
