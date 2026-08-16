import { CronScheduler } from "./CronScheduler";
import { CleanupJob } from "./jobs/CleanupJob";

const scheduler = CronScheduler.getInstance();

scheduler.register(
  new CleanupJob(),
  // "* * * * *", // every min
  "*/10 * * * *", // every 5 mins
);

export default scheduler;
