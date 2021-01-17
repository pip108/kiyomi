export class Http {

   public readonly post = async (url: string, data: any) => {
      const config = {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(data)
      };
      const response = await fetch(url, config);
      if (response.status > 399) {
         this.throwHttpError(config.method, url, response);
      }
      if (response.status !== 204) {
         return response.json();
      }
   }

   public readonly put = async (url: string, data: any) => {
      const config = {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(data)
      };
      const response = await fetch(url, config);
      if (response.status > 399) {
         this.throwHttpError(config.method, url, response);
      }
      if (response.status !== 204) {
         return response.json();
      }
   }

   public async get(url: string) {
      const config = {
         method: 'GET'
      };
      const response = await fetch(url, config);
      if (response.status > 399) {
         if (response.status === 404) {
            return null;
         }
         this.throwHttpError(config.method, url, response);
      }
      const data = await response.json();
      return data;
   }

   public async delete(url: string) {
      const config = {
         method: 'DELETE'
      };
      const response = await fetch(url, config);
      if (response.status > 399) {
         this.throwHttpError(config.method, url, response);
      }
   }

   private throwHttpError(method: string, url: string, response: Response) {
      throw new Error(`${method} ${url}: HTTP ${response.status} ${response.statusText}`)
   }
}

export const HttpClient = new Http();
