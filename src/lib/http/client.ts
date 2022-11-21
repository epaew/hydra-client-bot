import { ClientError, HTTPError, ServerError } from "./errors.ts";

class Client {
  #baseURL: string | undefined;

  constructor(baseURL?: string) {
    this.#baseURL = baseURL;
  }

  get(path: string, options: RequestInit = {}) {
    const method = "GET";

    return this.request(path, { ...options, method });
  }

  post(path: string, data: any, options: RequestInit = {}) {
    const method = "POST";
    const body = data;

    return this.request(path, { ...options, method, body });
  }

  async request(path: string, options: RequestInit) {
    const request = new Request(new URL(path, this.#baseURL), options);
    const response = await fetch(request);

    if (!response.ok) {
      await this.#throwHTTPError(response);
    }

    return response;
  }

  async #throwHTTPError(response: Response) {
    const { url, status, headers } = response;
    const body = await response.text();

    switch (Math.floor(status / 100)) {
      case 4:
        throw new ClientError({ url, status, headers, body });
      case 5:
        throw new ServerError({ url, status, headers, body });
      default:
        throw new HTTPError({ url, status, headers, body });
    }
  }
}

export { Client };
