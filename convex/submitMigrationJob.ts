import { mutation } from "./_generated/server";

export default mutation(async ({ db }, 
    replicationId: string, 
    migrationJobId: number, 
    isBucket: boolean,
    isRollback: boolean,
    scheduledTime: number,
    type: string) => {

    db.insert("migration_jobs", {
      replicationId,
      migrationJobId,
      isBucket,
      isRollback,
      scheduledTime,
      startedAt: null,
      finishedAt: null,
      state: "Scheduled",
      type
    });
});
