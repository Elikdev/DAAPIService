import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus, AuditStatus } from "../entities/Items";
import { Users } from "../entities/Users";
import { Shops } from "../entities/Shops";
import { Reviews } from "../entities/Reviews";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createReviewSchema } from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import {
  getPaginationLinks,
  getPaginationParams,
} from "./helper/paginationHelper";

const DEFAULT_SORT_BY: OrderByCondition = { "review.createdAt": "DESC" };

export class ReviewsController {
  @HandleError("getShopReviews")
  static async getShopReviews(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const userId = req.body.userId;
    const shopId = req.params.shopId;
    const reviewRepo = getRepository(Reviews);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    const user = await Users.findOne({ id: userId });
    if (!user) {
      throw new ResourceNotFoundError("User doesn't exist.");
    }
    const reviews = await reviewRepo
      .createQueryBuilder("review")
      .where("review.shopId = :shopId", { shopId: shopId })
      .leftJoin("review.reviewer", "reviewer")
      .andWhere("review.isSuspended = :isSuspended", {
        isSuspended: false,
      })
      .select(["review", "reviewer.avatarUrl", "reviewer.username"])
      .orderBy(orderBy)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    res.send({
      data: reviews,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("getShopReviewsCount")
  static async getShopReviewsCount(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const shopId = req.params.shopId;
    const reviewRepo = getRepository(Reviews);
    const reviewCount = await reviewRepo
      .createQueryBuilder("review")
      .where("review.shopId = :shopId", { shopId: shopId })
      .andWhere("review.isSuspended = :isSuspended", {
        isSuspended: false,
      })

      .getCount();

    res.send({
      count: reviewCount,
    });
  }

  @HandleError("createReviews")
  static async createReviews(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const userId = req.body.userId;
    const reviewsRepo = getRepository(Reviews);
    const reviewsData = req.body.data;
    const validator = new RequestValidator(createReviewSchema);
    validator.validate(reviewsData);
    const reviewer = await Users.findOne({ id: reviewsData.reviewerId });
    const shop = await Shops.findOne({ id: reviewsData.shopId });
    const items = await Items.findByIds(reviewsData.itemIds);
    if (reviewer && shop && items) {
      reviewsData.items = items;
      reviewsData.reviewer = reviewer;
      reviewsData.shop = shop;
      const savedReview = await reviewsRepo.save(reviewsData);
      res.send({
        data: savedReview,
      });
    } else {
      throw new ResourceNotFoundError("One of reviews properties not found .");
    }
  }
}
