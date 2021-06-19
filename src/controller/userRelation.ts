import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { ResourceNotFoundError } from "../error/notfoundError";
import { Users } from "../entities/Users";
import { UserRelations } from "../entities/UserRelations";
import { Items } from "../entities/Items";
import { logger } from "../logging/logger";
import { ListingStatus } from "../entities/Items";

export class UserRelationController {

  @HandleError("follow")
  static async follow(req: Request, res: Response, next: NextFunction): Promise<void> {
    const followerId = req.body.userId;
    const followeeId = parseInt(req.params.id);

    if (followerId == followeeId) {
      res.send({
        message: "Users can not follow themselves."
      });
      return next();
    }

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
      res.send({
        message: "UserRelationEntry already exists.",
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




  @HandleError("unfollow")
  static async unfollow(req: Request, res: Response, next: NextFunction): Promise<void> {
    const followerId = req.body.userId;
    const followeeId = parseInt(req.params.id);

    if (followerId == followeeId) {
      res.send({
        message: "Users can not unfollow themselves."
      });
      return next();
    }

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
    if (!userRelationEntry) {
      res.send({
        message: "UserRelationEntry does not exist."
      });
      return next();
    }

    const result = await userRelationRepo.remove(userRelationEntry);
    res.send({
      message: "UserRelationEntry deleted.",
      data: result
    });
  }

  @HandleError("isFollowed")
  static async isFollowed(req: Request, res: Response, next: NextFunction): Promise<void> {
    const followerId = req.body.userId;
    const followeeId = parseInt(req.params.id);

    if (followerId == followeeId) {
      res.send({
        message: "Users can not follow themselves.",
        data: false
      });
      return next();
    }
    
    const userRelationEntry = await getRepository(UserRelations)
      .createQueryBuilder("userRelations")
      .leftJoinAndSelect("userRelations.follower", "follower")
      .leftJoinAndSelect("userRelations.followee", "followee")
      .where("follower.id = :followerId", {followerId: followerId})
      .andWhere("followee.id = :followeeId", {followeeId: followeeId})
      .getOne();
      
    const isFollowed = userRelationEntry != null;
    res.send({
      data: isFollowed
    });

  }

  @HandleError("getUserFollowings")
  static async getUserFollowings(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const userFollowings = await getRepository(Users)
      .createQueryBuilder("users")
      .leftJoinAndSelect("users.followings", "followings")
      .leftJoinAndSelect("followings.followee", "followee")
      .leftJoinAndSelect("followee.shops", "shops")
      .leftJoinAndSelect("shops.items", "items")
      .andWhere("items.status = :new", { new: ListingStatus.NEW })
      .where("users.id = :id", { id: userId })
      .select([
        "users.id",
        "followings", 
        "followee.id", 
        "followee.username", 
        "followee.followersCount", 
        "followee.avatarUrl",
        "shops.id", 
        "shops.rating", 
        "shops.name", 
        "shops.introduction", 
        "shops.logoUrl", 
        "items.id",
        "items.imageUrls",
      ])
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
      .leftJoinAndSelect("follower.shops", "shops")
      .leftJoinAndSelect("shops.items", "items")
      .andWhere("items.status = :new", { new: ListingStatus.NEW })
      .where("users.id = :id", { id: userId })
      .select([
        "users.id",
        "followers", 
        "follower.id", 
        "follower.username", 
        "follower.followersCount", 
        "follower.avatarUrl", 
        "shops.id", 
        "shops.rating", 
        "shops.name", 
        "shops.introduction", 
        "shops.logoUrl", 
        "items.id",
        "items.imageUrls",
      ])
      .getOne();

    res.send({
      data: userFollowers
    });
  }   
}