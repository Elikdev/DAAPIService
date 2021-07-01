import { scheduleJob } from "node-schedule";
import { autoCancelOrders, autoCompleteOrders } from "../controller/helper/orderUpdater";
import { logger } from "../logging/logger";

// Function for scheduling timed jobs
export const createScheduledJobs = ():void => {
  scheduleFunction("0 * * * */1", autoCompleteOrders);
  scheduleFunction("*/30 * * * *", autoCancelOrders);
};

const scheduleFunction = (crontab:string, func:() => Promise<void>): void => {

  scheduleJob(crontab, async () => {
    try {
      logger.info("Running timed job...");
      await func();
    } catch (ex) {
      logger.error("Got error running scheduled jobs:", ex);
    }
  });
};