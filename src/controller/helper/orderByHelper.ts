import { OrderByCondition } from "typeorm";

export const getOrderByConditions = (
  sorts: unknown,
  defaultOrder: OrderByCondition,
  sortPrefix?: string,
): OrderByCondition => {
  const condition: OrderByCondition = {};
  // add prefix for joining tables with same column names
  const prefix = sortPrefix || "";
  if (!sorts) {
    return defaultOrder;
  }

  if (typeof sorts == "string") {
    sorts.split(",").forEach((sort) => {
      const sortTuple = processSort(sort);
      if (sortTuple) {
        condition[prefix + sortTuple[0]] = sortTuple[1];
      }
    });
  }
  return condition;
};

const processSort = (sort: string): [string, "ASC" | "DESC"] | null => {
  if (!sort) {
    return null;
  }
  if (sort.startsWith("-")) {
    return [sort.slice(1), "DESC"];
  } else {
    return [sort, "ASC"];
  }
};
