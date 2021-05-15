import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { ResourceNotFoundError } from "../error/notfoundError";
import { Users } from "../entities/Users";
import { UserRelations } from "../entities/UserRelations";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";

export class UserRelationController {

  @HandleError("createFollow")
  static async createFollow(req: Request, res: Response, next: NextFunction): Promise<void> {
    const followerId = req.body.userId;
    const followeeId = parseInt(req.params.id);

    const userRepo = getRepository(Users);
    const follower = await userRepo.findOne({id: followerId});
    if (!follower) {
      throw new ResourceNotFoundError("Follower is not found.");
    }

    const followee = await userRepo.findOne({id: followeeId});
    if (!followee) {
      throw new ResourceNotFoundError("Followee is not found.");
    }

    const userRelationRepo = getRepository(UserRelations);
    const userRelationEntry = await userRelationRepo.findOne({ follower: follower, followee: followee });
    if (userRelationEntry) {
      logger.info("UserRelationEntry already exists.");
      res.send({
        data: userRelationEntry
      });
      return next();
    }

    const newUserRelation = new UserRelations();
    newUserRelation.follower = follower;
    newUserRelation.followee = followee;

    const result = await userRelationRepo.save(newUserRelation);
    logger.info("UserRelationEntry created.");
    res.send({
      data: result
    });
  }

  @HandleError("getUserFollowings")
  static async getUserFollowings(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const userFollowings = await getRepository(Users)
      .createQueryBuilder("users")
      .leftJoinAndSelect("users.followings", "followings")
      .leftJoinAndSelect("followings.followee", "followee")
      .where("users.id = :id", { id: userId })
      .getOne();

    res.send({
      data: userFollowings
    });
  }

  @HandleError("getUserFollowers")
  static async getUserFollowers(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const userFollowers = await getRepository(Users)
      .createQueryBuilder("users")
      .leftJoinAndSelect("users.followers", "followers")
      .leftJoinAndSelect("followers.follower", "follower")
      .where("users.id = :id", { id: userId })
      .getOne();

    res.send({
      data: userFollowers
    });
  }   
}