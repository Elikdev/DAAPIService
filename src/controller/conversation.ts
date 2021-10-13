import { Request, Response } from "express";
import { getRepository, OrderByCondition } from "typeorm";
import { HandleError } from "../decorator/errorDecorator";
import { Items, ListingStatus, AuditStatus } from "../entities/Items";
import { Users } from "../entities/Users";
import { Conversations } from "../entities/Conversations";
import { BadRequestError } from "../error/badRequestError";
import { ResourceNotFoundError } from "../error/notfoundError";
import { logger } from "../logging/logger";
import { RequestValidator } from "../validator/requestValidator";
import {
  updateConversationSchema,
  createConversationSchema,
} from "../validator/schemas";
import { getOrderByConditions } from "./helper/orderByHelper";
import {
  getPaginationLinks,
  getPaginationParams,
} from "./helper/paginationHelper";
import { sendPush } from "./helper/umengPushHelper";

const DEFAULT_SORT_BY: OrderByCondition = { "conversation.updatedAt": "DESC" };

export class ConversationsController {
  @HandleError("getConversations")
  static async getConversations(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const userId = req.body.userId;
    const conversationRepo = getRepository(Conversations);
    const [pageNumber, skipSize, pageSize] = getPaginationParams(
      req.query.page,
    );
    logger.debug("OrderBy: " + JSON.stringify(orderBy));

    const user = await Users.findOne({ id: userId });
    if (!user) {
      throw new ResourceNotFoundError("User doesn't exist.");
    }
    const conversations = await conversationRepo
      .createQueryBuilder("conversation")
      .where("conversation.senderId = :senderId", { senderId: userId })
      .orWhere("conversation.receiverId = :receiverId", { receiverId: userId })
      .andWhere("conversation.isSuspended = :isSuspended", {
        isSuspended: false,
      })
      .leftJoinAndSelect("conversation.sender", "sender")
      .leftJoinAndSelect("conversation.receiver", "receiver")
      .leftJoinAndSelect("conversation.item", "item")
      .orderBy(orderBy)
      .skip(skipSize)
      .take(pageSize)
      .getMany();

    res.send({
      data: conversations,
      links: getPaginationLinks(req, pageNumber, pageSize),
    });
  }

  @HandleError("createConversations")
  static async createConversations(req: Request, res: Response): Promise<void> {
    const sorts = req.query.sort;
    const orderBy = getOrderByConditions(null, DEFAULT_SORT_BY);
    const userId = req.body.userId;
    const conversationRepo = getRepository(Conversations);
    const conversationData = req.body.data;
    const validator = new RequestValidator(createConversationSchema);
    validator.validate(conversationData);

    const conversations = await conversationRepo
      .createQueryBuilder("conversation")
      .where("conversation.senderId = :senderId", {
        senderId: conversationData.senderId,
      })
      .andWhere("conversation.receiverId = :receiverId", {
        receiverId: conversationData.receiverId,
      })
      .andWhere("conversation.itemId = :itemId", {
        itemId: conversationData.itemId,
      })
      .leftJoinAndSelect("conversation.sender", "sender")
      .leftJoinAndSelect("conversation.receiver", "receiver")
      .leftJoinAndSelect("conversation.item", "item")
      .getOne();

    if (conversations) {
      res.send({
        data: conversations,
      });
    } else {
      if (Number(userId) != Number(conversationData.senderId)) {
        throw new BadRequestError("You can't create conversations for others");
      }

      const sender = await Users.findOne({ id: conversationData.senderId });
      const receiver = await Users.findOne({ id: conversationData.receiverId });
      const item = await Items.findOne({ id: conversationData.itemId });
      if (sender && receiver && item) {
        conversationData.sender = sender;
        conversationData.receiver = receiver;
        conversationData.item = item;
        const savedConversation = await conversationRepo.save(conversationData);
        res.send({
          data: savedConversation,
        });
      } else {
        throw new ResourceNotFoundError(
          "One of conversation properties not found .",
        );
      }
    }
  }

  @HandleError("updateConversations")
  static async updateConversations(req: Request, res: Response): Promise<void> {
    const userId = req.body.userId;
    const conversationData = req.body.data;
    const validator = new RequestValidator(updateConversationSchema);
    validator.validate(conversationData);

    const conversationId = req.params.id;
    const conversationRepo = getRepository(Conversations);

    const conversation = await conversationRepo.findOne({ id: conversationId });

    logger.debug(`updating ${JSON.stringify(conversation)}`);

    if (!conversation) {
      throw new ResourceNotFoundError("Conversation not found.");
    }

    sendPush(
      conversation.sender.username + "给你发了一条消息!",
      "",
      "",
      conversation.receiver.deviceToken,
    );

    const result = await conversationRepo
      .createQueryBuilder()
      .update(Conversations, conversationData)
      .where("id = :id", { id: conversationId })
      .returning("*")
      .updateEntity(true)
      .execute()
      .then((response) => response.raw[0]);

    res.send({
      data: result,
    });
  }
}
