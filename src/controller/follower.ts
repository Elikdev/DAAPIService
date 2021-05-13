import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Followers } from "../entities/Followers";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";

export class FollowerController {

  @HandleError("createFollow")
  static async createFollow(req: Request, res: Response): Promise<void> {
    const followerId = req.body.userId;
    const followeeId = parseInt(req.params.id);

    const followerRepo = getRepository(Followers);
    const followerEntry = await followerRepo.findOne({ followerId: followerId, followeeId: followeeId });

    if (followerEntry) {
      logger.warning("followerEntry already exists.");
    }

    const newFollower = new Followers();
    newFollower.followerId = followerId;
    newFollower.followeeId = followeeId;

    const result = await followerRepo.save(newFollower);
    logger.info("followerEntry created.");
    res.send({
      data: result
    });
  }
}