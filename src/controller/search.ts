import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { getOrderByConditions } from "./helper/orderByHelper";
import { ResourceNotFoundError } from "../error/notfoundError";
import { BadRequestError } from "../error/badRequestError";
import {
  getPaginationLinks,
  getPaginationParams,
} from "./helper/paginationHelper";
const algoliasearch = require("algoliasearch");

// By default latest orders first
const DEFAULT_SORT_BY: OrderByCondition = { "orders.createdtime": "DESC" };

const client = algoliasearch("NUW4UGCBN5", "b3d50a0c9f8ed7b4a9d44ca93b10cf26");
const productIndex = client.initIndex("retopia_prod_products");
const shopIndex = client.initIndex("retopia_prod_shops");
const itemSugIndex = client.initIndex(
  "retopia_prod_products_query_suggestions",
);

export class SearchController {
  @HandleError("search")
  static async search(req: Request, res: Response): Promise<void> {
    const query = req.query.query;
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );

    type AlgoliaHits = {
      hits: AlgoliaHit[];
    };

    type AlgoliaHit = {
      identifier: string;
      cpi_visibility: string;
      title: string;
      published: string;
    };

    const filters = [
      "status:new",
      "shop.isSuspended: false",
      ["auditStatus:pending", "auditStatus:pass"],
    ];

    const content: AlgoliaHits = await productIndex.search(query, {
      hitsPerPage: pageSize,
      page: pageNumber,
      offset: skipSize,
      length: pageSize,
      facetFilters: filters,
    });

    res.send({
      content: content,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("querySuggestion")
  static async querySuggestion(req: Request, res: Response): Promise<void> {
    const query = req.query.query;
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );

    type AlgoliaHits = {
      hits: AlgoliaHit[];
    };

    type AlgoliaHit = {
      identifier: string;
      cpi_visibility: string;
      title: string;
      published: string;
    };

    const filters = ["isSuspended:false"];

    const shopSug: AlgoliaHits = await shopIndex.search(query, {
      hitsPerPage: pageSize,
      page: pageNumber,
      offset: skipSize,
      length: pageSize,
      facetFilters: filters,
    });

    const itemSug: AlgoliaHits = await itemSugIndex.search(query, {
      hitsPerPage: pageSize,
      page: pageNumber,
      offset: skipSize,
      length: pageSize,
    });

    res.send({
      shopSug: shopSug,
      itemSug: itemSug,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }
}
