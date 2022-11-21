interface HTTPErrorConstructorProps {
  url: string;
  status: number;
  headers: Headers;
  body: string;
}

class HTTPError extends Error {
  readonly url: string;
  readonly status: number;
  readonly headers: Headers;
  readonly body: string;

  constructor({ url, status, headers, body }: HTTPErrorConstructorProps) {
    super(`Status: ${status} was returned from URL: ${url}`);

    this.url = url;
    this.status = status;
    this.headers = headers;
    this.body = body;
  }
}

class ClientError extends HTTPError {}
class ServerError extends HTTPError {}

export { ClientError, HTTPError, ServerError };
