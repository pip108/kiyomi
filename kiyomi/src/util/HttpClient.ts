export class HttpClient2
{
    public async post(url: string, data: any) {
        const config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
    }

    public async get(url: string) {
        const config = {
            method: 'GET'
        };
        return this.request(url, config);
    }

    private async request(url: string, config: RequestInit) {
        const response = await fetch(url, config);
        switch (response.status)
        {
            case 503:
                const retryAfter = response.headers.get('Retry-After');
                if (retryAfter) {
                    return new Promise((resolve, _) => {
                        setTimeout(async () => { 
                            resolve(await this.request(url, config));
                        }, parseInt(retryAfter))
                    });
                }
            break;
            default:
                break;
        }
        return response;
    }

}