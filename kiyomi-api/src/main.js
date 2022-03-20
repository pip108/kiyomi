const express = require('express');

const app = express();
const api = require('./api/api')(express);
const proxy = require('./proxy/proxy')(express);

const port = parseInt(process.env.PORT || 3001);

async function init() {
    app.use('/kiyomi', api());
    app.use('/anime', await proxy());
    app.listen(port, () => {
        console.log(`Kiyomi API on http://localhost:${port}`);
    });
}

init();
