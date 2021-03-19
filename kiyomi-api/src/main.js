const express = require('express');

const app = express();
const api = require('./api/api')(express);
const proxy = require('./proxy/proxy')(express);

const port = parseInt(process.env.API_PORT);
const host = process.env.HOST;

app.use('/kiyomi', api());
app.use('/anime', proxy());

app.listen(port, host, () => {
    console.log(`Kiyomi API on http://localhost:${port}`);
});
