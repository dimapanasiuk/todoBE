"use strict";
const fs = require('fs');
const path = require('path');
const getQuery = (myPath) => {
    const queryPath = path.join(__dirname, myPath);
    const query = fs.readFileSync(queryPath, 'utf8');
    return query;
};
module.exports = getQuery;
