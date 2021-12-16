import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus } from "../entities/Items";
import { Events } from "../entities/Events";
import { EventUserStatus, InviteStatus } from "../entities/EventUserStatus";

import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { Users } from "../entities/Users";

export class EventUserStatusController {
  @HandleError("getEventUserStatus")
  static async getEventUserStatus(req: Request, res: Response): Promise<void> {
    const name = req.params.eventName;
    const userId = req.params.userId;

    const eventUserStatusRepo = await getRepository(EventUserStatus);
    const eventUserStatus = await eventUserStatusRepo
      .createQueryBuilder("eventUserStatus")
      .where("eventUserStatus.eventName = :name", { name: name })
      .andWhere("eventUserStatus.participantId = :userId", { userId: userId })
      .getOne();

    if (!eventUserStatus) {
      res.send({
        data: {
          inviteStatus: InviteStatus.NOT_INVITED,
        },
      });
    }

    res.send({
      data: eventUserStatus,
    });
  }

  @HandleError("updateEventUserStatus")
  static async updateEventUserStatus(
    req: Request,
    res: Response,
  ): Promise<void> {
    const userId = req.params.userId;
    const eventName = req.params.eventName;
    const inviteStatus = req.params.inviteStatus;
    const eventUserStatusRepo = await getRepository(EventUserStatus);
    const user = await getRepository(Users).findOne({ id: parseInt(userId) });

    const eventUserStatusData: any = {};
    let eventUserStatusEntity;
    const eventUserStatus = await eventUserStatusRepo
      .createQueryBuilder("eventUserStatus")
      .where("eventUserStatus.eventName = :name", { name: eventName })
      .andWhere("eventUserStatus.participantId = :userId", { userId: userId })
      .getOne();
    if (eventUserStatus) {
      eventUserStatus.inviteStatus = inviteStatus;
      eventUserStatusEntity = await eventUserStatusRepo.save(eventUserStatus);
    } else {
      eventUserStatusData.eventName = eventName;
      eventUserStatusData.inviteStatus = inviteStatus;
      eventUserStatusData.participant = user;
      eventUserStatusData.inviteCode = (Math.random() + 1)
        .toString(36)
        .substring(8)
        .toUpperCase();
      eventUserStatusEntity = await eventUserStatusRepo.save(
        eventUserStatusData,
      );
    }

    res.send({
      data: eventUserStatusEntity,
    });
  }

  @HandleError("verifyInviteCode")
  static async verifyInviteCode(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId;
    const eventName = req.params.eventName;
    const inviteCode = req.params.inviteCode;
    const eventUserStatusRepo = await getRepository(EventUserStatus);
    const response = {
      valid: false,
    };

    const eventUserStatus = await eventUserStatusRepo
      .createQueryBuilder("eventUserStatus")
      .where("eventUserStatus.eventName = :name", { name: eventName })
      .andWhere("eventUserStatus.inviteCode = :inviteCode", {
        inviteCode: inviteCode,
      })
      .getOne();

    if (
      eventUserStatus &&
      eventUserStatus.inviteStatus === InviteStatus.INVITED
    ) {
      response.valid = true;
    }

    res.send({
      data: response,
    });
  }
}
