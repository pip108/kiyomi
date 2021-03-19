const fs = require('fs/promises');
const axios = require('axios');

const mal_credentials = {
    basic_auth: {
        username: process.env.MAL_API_CLIENT_ID,
        password: process.env.MAL_API_CLIENT_SECRET
    },
    refresh_token: process.env.MAL_API_REFRESH_TOKEN
}

async function renewToken() {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', mal_credentials.refresh_token);

    const auth = mal_credentials.basic_auth;
    try {
        const res = await axios.post('https://myanimelist.net/v1/oauth2/token', params, { auth });
        return res.data;
    } catch (e) {
        console.log(e.toString());
    }
}

async function checkFile() {
    try {
        const jsonString = await fs.readFile('token.json');
        const token = JSON.parse(jsonString);
        return token;
    } catch {
        return null;
    }
}

function expiresSoon(token) {
    return Math.abs(token.expires_in - Date.now() / 1000) > 2592000;
}

let token = null;
module.exports = async function getToken() {
    if (!token) {
        token = await checkFile();
    }
    if (!token || expiresSoon(token)) {
        token = await renewToken(mal_credentials);
    }
    return token.access_token;
}