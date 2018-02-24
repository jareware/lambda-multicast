import { stringify } from 'querystring';
import { ProxyResponse, filterHeaders } from './proxy';

export interface Headers {
  [header: string]: string;
}

export interface IncomingRequest {
  requestId: string;
  requestMethod: string;
  requestPath: string;
  requestHeaders: Headers;
  requestBody: object | string;
}

export interface LambdaResponse {
  statusCode: number;
  body?: string;
  isBase64Encoded?: boolean;
  headers?: Headers;
}

export interface LambdaHandlers {
  handler: (
    event: any,
    context: any,
    callback: (error: Error | null, response: LambdaResponse) => void,
  ) => void;
}

// Note: This assumes a request pipeline of CloudFront -> API Gateway -> Lambda
export function normalizeIncomingRequest(event: any): IncomingRequest {
  const query = stringify(event.queryStringParameters);
  return {
    requestId: event.requestContext.requestId,
    requestMethod: event.httpMethod,
    requestPath: event.path + (query ? `?${query}` : ''),
    requestHeaders: event.headers || {},
    requestBody: event.body,
  };
}

export function responseToLambda(primary: ProxyResponse): LambdaResponse {
  return {
    statusCode: primary.status,
    body: primary.data,
    isBase64Encoded: false,
    headers: filterHeaders(primary.headers, ['content-type']),
  };
}
