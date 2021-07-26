import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { getOrderByConditions } from "./helper/orderByHelper";
import { ResourceNotFoundError } from "../error/notfoundError";
import { BadRequestError } from "../error/badRequestError";
import { getPaginationLinks, getPaginationParams } from "./helper/paginationHelper";
const algoliasearch = require("algoliasearch");

// By default latest orders first
const DEFAULT_SORT_BY:OrderByCondition = { "orders.createdtime":"DESC" };


const client = algoliasearch("NUW4UGCBN5", "b3d50a0c9f8ed7b4a9d44ca93b10cf26");
const index = client.initIndex("retopia_prod_products");
export class SearchController {



  @HandleError("search")
  static async search(req: Request, res: Response): Promise<void> {
    const query = req.query.query;
    const [pageNumber, skipSize, pageSize] = getPaginationParams(req.query.page);

    type AlgoliaHits = {
      hits: AlgoliaHit[];
    };

    type AlgoliaHit = {
      identifier: string;
      cpi_visibility: string;
      title: string;
      published: string;
    };


    const filters = ["status:new"];

    const content: AlgoliaHits = await index.search(query, {
      hitsPerPage: pageSize,
      page: pageNumber,
      offset: skipSize,
      length: pageSize,
      facetFilters: filters
    });

    res.send({
      content: content,
      links: getPaginationLinks(req, pageNumber, pageSize)
    });
  }

}
