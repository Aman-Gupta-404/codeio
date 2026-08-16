import cron, { ScheduledTask } from "node-cron";
import { ICronJob } from "./ICronJob";

interface JobConfig {
  job: ICronJob;
  schedule: string;
}

export class CronScheduler {
  private static instance: CronScheduler;

  private readonly jobs: JobConfig[] = [];
  private readonly tasks: ScheduledTask[] = [];

  private constructor() {}

  static getInstance(): CronScheduler {
    if (!CronScheduler.instance) {
      CronScheduler.instance = new CronScheduler();
    }

    return CronScheduler.instance;
  }

  register(job: ICronJob, schedule: string) {
    this.jobs.push({ job, schedule });
  }

  start() {
    for (const { job, schedule } of this.jobs) {
      let isRunning = false;

      const task = cron.schedule(
        schedule,
        async () => {
          if (isRunning) {
            console.log(`[CRON] ${job.name} skipped (already running)`);
            return;
          }

          isRunning = true;

          const start = Date.now();

          try {
            console.log(`[CRON] Starting ${job.name}`);

            await job.execute();

            console.log(
              `[CRON] Finished ${job.name} (${Date.now() - start}ms)`,
            );
          } catch (error) {
            console.error(`[CRON] ${job.name} failed`, error);
          } finally {
            isRunning = false;
          }
        },
        {
          timezone: "Asia/Kolkata",
        },
      );

      this.tasks.push(task);

      console.log(`[CRON] Registered ${job.name} (${schedule})`);
    }
  }
}
