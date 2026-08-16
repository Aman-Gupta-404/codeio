import { ICronJob } from "../ICronJob";
import * as projectServices from "../../../modules/projects/projects.public";

export class CleanupJob implements ICronJob {
  name = "Cleanup Job";

  async execute(): Promise<void> {
    console.log("==== starting Clean up Job ====");

    // fetch the pods that had last updated 10 mins prior
    await projectServices.stopInactiveWorkspaces();
  }
}
