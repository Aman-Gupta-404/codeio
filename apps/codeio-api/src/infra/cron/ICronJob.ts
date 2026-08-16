export interface ICronJob {
  name: string;
  execute(): Promise<void>;
}
