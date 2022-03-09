import { HandleError } from "../decorator/errorDecorator";
import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { PendingShops, ManualAuditStatus } from "../entities/PendingShops";
import { Users } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { RequestValidator } from "../validator/requestValidator";
import { createPendingShopSchema, updatePendingShopSchema } from "../validator/schemas";
import { ResourceNotFoundError } from "../error/notfoundError";
import { getOrderByConditions } from "./helper/orderByHelper";
import {
  getPaginationLinks,
  getPaginationParams,
} from "./helper/paginationHelper";

const DEFAULT_SORT_BY: OrderByCondition = { "PendingShops.createdtime": "DESC" };

export class PendingShopController {
  @HandleError("createPendingShop")
  static async createPendingShop(req: Request, res: Response): Promise<void> {
    const pendingShopData = req.body.data;
    const userId = req.body.userId;
    const validator = new RequestValidator(createPendingShopSchema);
    validator.validate(pendingShopData);
    const pendingShopRepo = getRepository(PendingShops);

    const userRepo = getRepository(Users);
    const user = await userRepo.findOne({ id: userId });

    pendingShopData.owner = user;
    const createdPendingShop = await pendingShopRepo.save(pendingShopData);

    if (user) {
      user.shopApplied = true;
      await getRepository(Users).save(user);
    }

    res.send({
      data: createdPendingShop,
    });
  }

  @HandleError("getPendingShops")
  static async getPendingShops(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(sorts, DEFAULT_SORT_BY);
    const repo = getRepository(PendingShops);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );

    // Sort shops by followersCount
    const pendingShopsQuery = repo
      .createQueryBuilder("PendingShops")
      .where("PendingShops.manualAuditStatus = :manualAuditStatus", { manualAuditStatus: ManualAuditStatus.PENDING })
      .orderBy(orderBy)
      .skip(skipSize)
      .take(pageSize);

    const pendingShops: PendingShops[] = await pendingShopsQuery.getMany();

    res.send({
      data: pendingShops,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("updatePendingShop")
  static async updatePendingShop(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const pendingShopId = req.params.id;
    const pendingShopData = req.body.data;

    const validator = new RequestValidator(updatePendingShopSchema);
    validator.validate(pendingShopData);

    pendingShopData.id = pendingShopId;

    const pendingShopRepo = await getRepository(PendingShops);
    const result = await pendingShopRepo.save(pendingShopData);

    res.send({
      data: result,
    });
  }
}