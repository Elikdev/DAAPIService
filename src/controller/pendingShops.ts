import { HandleError } from "../decorator/errorDecorator";
import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { PendingShops, ShopManualAuditStatus } from "../entities/PendingShops";
import { Shops } from "../entities/Shops";
import { UserRole, Users, ManualAuditStatus } from "../entities/Users";
import { BadRequestError } from "../error/badRequestError";
import { RequestValidator } from "../validator/requestValidator";
import {
  createPendingShopSchema,
  updatePendingShopSchema,
} from "../validator/schemas";
import { ResourceNotFoundError } from "../error/notfoundError";
import { getOrderByConditions } from "./helper/orderByHelper";
import {
  getPaginationLinks,
  getPaginationParams,
} from "./helper/paginationHelper";

const DEFAULT_SORT_BY: OrderByCondition = {
  "pendingShops.createdtime": "DESC",
};

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

    if (!user) {
      throw new ResourceNotFoundError("User doesn't exist.");
    }

    pendingShopData.owner = user;
    const createdPendingShop = await pendingShopRepo.save(pendingShopData);

    user.shopApplied = true;
    await getRepository(Users).save(user);

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

    const pendingShopsQuery = repo
      .createQueryBuilder("pendingShops")
      .where("pendingShops.manualAuditStatus = :manualAuditStatus", {
        manualAuditStatus: ShopManualAuditStatus.PENDING,
      })
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
    const pendingShopId = req.params.id;
    const pendingShopData = req.body.data;

    const validator = new RequestValidator(updatePendingShopSchema);
    validator.validate(pendingShopData);

    pendingShopData.id = pendingShopId;

    const pendingShopRepo = await getRepository(PendingShops);
    const result = await pendingShopRepo.save(pendingShopData);

    if (pendingShopData.manualAuditStatus === ShopManualAuditStatus.PASS) {
      // create shop
      const pendingShop = await pendingShopRepo
        .createQueryBuilder("pendingShops")
        .where("pendingShops.id = :id", { id: pendingShopId })
        .leftJoinAndSelect("pendingShops.owner", "users")
        .getOne();
      if (!pendingShop) {
        throw new ResourceNotFoundError("PendingShop doesn't exist.");
      }

      const user = pendingShop.owner;
      user.role = UserRole.SELLER;
      user.manualAuditStatus = ManualAuditStatus.PASS;
      await getRepository(Users).save(user);

      const shopData: any = {
        name: pendingShop.name,
        introduction: "小红书： " + pendingShop.redbookName + " | " + pendingShop.introduction,
        logoUrl: user.avatarUrl,
        location: pendingShop.location,
      };
      shopData.owner = user;
      await getRepository(Shops).save(shopData);
    }

    res.send({
      data: result,
    });
  }
}
