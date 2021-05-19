import { OrderByCondition } from "typeorm";

export const getOrderByConditions = (sorts: unknown, defaultOrder:OrderByCondition): OrderByCondition => {
  const condition:OrderByCondition = {};
  if (!sorts) {
    return defaultOrder;
  }

  if (typeof sorts == "string") {
    sorts.split(",").forEach(sort => {
      const sortTuple = processSort(sort);
      if (sortTuple) {
        condition[sortTuple[0]] = sortTuple[1];
      }
    });
  }
  return condition;
};

const processSort = (sort: string): [string, ("ASC" | "DESC")] | null => {
  if (!sort) {
    return null;
  }
  if (sort.startsWith("-")) {
    return [sort.slice(1), "DESC"];
  } else {
    return [sort, "ASC"];
  }
};
