import { BodyInit, HeadersInit, Response } from "node-fetch";
import { HttpCall } from "./httpCall";

export class ServiceCall {

  static post(url: string, body: any, headers: HeadersInit): Promise<Response> {
    const call = new HttpCall(url, "POST", headers, body);

    try {
      const response = call.invoke();
      return response;
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  static patch(url: string, body: any, headers: HeadersInit): Promise<Response> {
    const call = new HttpCall(url, "PATCH", headers, body);

    try {
      const response = call.invoke();
      return response;
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async get(url: string, headers: HeadersInit): Promise<Response> {
    const call = new HttpCall(url, "GET", headers, null);

    try {
      const response = call.invoke();
      return response;
    }
    catch (error) {
      console.error(error);
      throw error;
    }
  }
}
