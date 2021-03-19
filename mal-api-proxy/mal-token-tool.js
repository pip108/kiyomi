const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

class MALTokenTool {

    token = { access_token: null };

    constructor(mal_basic_auth, refresh_token) {
        this.mal_basic_auth = mal_basic_auth;
        this.token.refresh_token = refresh_token;
        this.loading = new Promise(async (resolve, reject) => {
            try {
                await this.getToken();
                resolve();
            } catch(e) {
                reject('MALTokenTool failed to start');
            }
        });
    }

    async getToken() {
        if (!this.token.access_token) {
            try {
                const jsonStr = await fs.readFile('token.json');
                this.token = JSON.parse(jsonStr);
            } catch {
                this.token = await this.getNewToken();
                this.persistToken();
            }
        }

        // Refresh token if it's only good for a day longer
        if (Date.now() - this.token.timestamp < 86400000) {
            this.token = await this.newToken();
            this.persistToken();
        }
        return this.token.access_token;
    }
    
    async getNewToken() {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', this.token.refresh_token);
        try {
            const response = await axios.post(
                `https://myanimelist.net/v1/oauth2/token`,
                params, { auth: this.mal_basic_auth });

            return response.data;
        } catch (e) {
            console.log(e.toString());
        }
    }

    async persistToken() {
        try {
            this.token.expires = Date.now() / 1000 + this.token.expires_in;
            await fs.writeFile('./token.json', JSON.stringify(this.token));
        } catch (e) {
            console.log(`Failed to write ${path.join(__dirname, 'token.json')}`, e);
        }
    }
}

let malTokenTool = null;

module.exports = function(mal_basic_auth, refresh_token, ready_callback) {
    if (!malTokenTool) {
        malTokenTool = new MALTokenTool(mal_basic_auth, refresh_token)
    }
    malTokenTool.loading.then(() => ready_callback());
    return malTokenTool;
}