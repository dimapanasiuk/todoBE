const fs = require('fs');
const path = require('path');

const getQuery = (myPath: string) => {
  const queryPath = path.join(__dirname, myPath);
  const query = fs.readFileSync(queryPath, 'utf8');
  return query;
}
    
module.exports = getQuery;