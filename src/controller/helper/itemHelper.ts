import { Items, ListingStatus } from "../../entities/Items";
import { BadRequestError } from "../../error/badRequestError";

export const verifyItemToBuy = (item: Items): void => {
  if (item.status != ListingStatus.NEW) {
    throw new BadRequestError(
      `item ${item.id} with status=${item.status} is not valid`,
    );
  }
};