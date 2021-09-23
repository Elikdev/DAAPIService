import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus, AuditStatus } from "../entities/Items";
import { Users } from "../entities/Users";
import { Shops } from "../entities/Shops";
import { ItemComments } from "../entities/ItemComments";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import { createItemCommentSchema } from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import {
  getPaginationLinks,
  getPaginationParams,
} from "./helper/paginationHelper";

const DEFAULT_SORT_BY: OrderByCondition = { "itemComments.createdAt": "DESC" };

export class itemCommentController {
  @HandleError("getItemComments")
  static async getItemComments(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const itemId = req.params.itemId;
    const itemCommentsRepo = getRepository(ItemComments);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    const itemComments = await itemCommentsRepo
      .createQueryBuilder("itemComments")
      .where("itemComments.itemId = :itemId", { itemId: itemId })
      .andWhere("itemComments.isSuspended = :isSuspended", {
        isSuspended: false,
      })
      .leftJoin("itemComments.commenter", "commenter")
      .select([
        "itemComments",
        "commenter.id",
        "commenter.username",
        "commenter.avatarUrl",
      ])
      .orderBy(orderBy)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    res.send({
      data: itemComments,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("createItemComment")
  static async createItemComment(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const userId = req.body.userId;
    const itemCommentsRepo = getRepository(ItemComments);
    const itemCommentData = req.body.data;
    const validator = new RequestValidator(createItemCommentSchema);
    validator.validate(itemCommentData);

    const commenter = await Users.findOne({ id: itemCommentData.commenterId });
    const item = await Items.findOne({ id: itemCommentData.itemId });
    if (commenter && item) {
      itemCommentData.commenter = commenter;
      itemCommentData.item = item;
      const savedItemComment = await itemCommentsRepo.save(itemCommentData);
      delete savedItemComment.commenter;
      res.send({
        data: savedItemComment,
      });
    } else {
      throw new ResourceNotFoundError(
        "One of itemComments properties not found .",
      );
    }
  }
}
