import fetch, { BodyInit, HeadersInit, Response } from "node-fetch";
import { logger } from "../logging/logger";

export class HttpCall {
  url: string
  method: string
  headers: HeadersInit
  requestBody: BodyInit

  constructor(url: string, method: string, headers:HeadersInit, requestBody:any) {
    this.url = url;
    this.method = method;
    this.headers = headers;
    this.requestBody = JSON.stringify(requestBody);
  }

  async invoke(): Promise<Response> {
    logger.debug(
      "----------------httpRequestStart----------------" + "\n" 
      + this.method + " - " + this.url + "\n"
      + "Sending http request with body:" + "\n"
      + JSON.stringify(this.requestBody) + "\n"
      + "----------------httpRequestEnd----------------" + "\n");
    
    let response = null;
    if (this.requestBody) {
      response = await fetch(this.url, {
        method: this.method,
        headers: this.headers,
        body: JSON.stringify(this.requestBody)
      });
    } else {
      response = await fetch(this.url, {
        method: this.method,
        headers: this.headers
      });
    }

    return response;
  }
}