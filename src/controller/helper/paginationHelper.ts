import { Request } from "express";
import { ParsedQs } from "qs";
import qs from "qs";

const DEFAULT_PG_SIZE = 20;
const STARTING_PG = 1;

export const getPaginationParams = (pageObject: any): [number, number, number] => {
  let pageNumber = STARTING_PG;
  let pageSize = DEFAULT_PG_SIZE;
  if (pageObject) {
    pageNumber = parseInt(pageObject.number) || 1;
    pageSize =  parseInt(pageObject.size) || DEFAULT_PG_SIZE;
  }
  const skipSize = pageSize * (pageNumber-1);

  return [pageNumber, skipSize, pageSize];
};

export const getPaginationLinks = (req: Request, pageNumber: number, pageSize: number): {[columnName: string]: string | null} => {

  const next = getStringifyLink(req.query, pageNumber + 1, pageSize);
  const prev = getStringifyLink(req.query, pageNumber - 1, pageSize);
  const first = getStringifyLink(req.query, STARTING_PG, pageSize);
  
  const resourcePath = req.originalUrl.split("?")[0] + "?";
  const rootPath = req.protocol + "://" + req.get("host");
  return {
    self: rootPath + req.originalUrl,
    first: rootPath + resourcePath + first,
    prev: pageNumber == 1 ? null : rootPath + resourcePath + prev,
    next: rootPath + resourcePath + next,
  };
};

const getStringifyLink = (query:any, pageNumber: number, pageSize: number): string => {
  const pageObject:ParsedQs = { number: pageNumber.toString(), size: pageSize.toString() };
  delete query.page;
  query.page = pageObject;
  return qs.stringify(query, { encode: false });
};
