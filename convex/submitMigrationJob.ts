import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export default mutation(async ({ db }, 
  replicationId: string,
  migrationJobId: string,
  migrationJobIdType: string,
  type: string,
  isRollback: boolean,
  scheduledTime: number) => {

  const doc = await db.table("migration_jobs")
    .filter(q => q.and(
      q.eq(q.field("replicationId"), replicationId),
      q.eq(q.field("migrationJobId"), migrationJobId),
      q.or(q.eq(q.field("state"), "Running"), q.eq(q.field("state"), "Scheduled"))))
    .first()

  if (doc != null) {
    throw Error(`Can't schedule duplicate job while existing ${doc._id} is in ${doc.state} state`)
  }

  return db.insert("migration_jobs", {
    replicationId: replicationId,
    migrationJobId: migrationJobId,
    migrationJobIdType: migrationJobIdType,
    state: "Scheduled",
    type: type,
    isRollback: isRollback,
    scheduledTime: scheduledTime,
    startedAt: null,
    finishedAt: null
  });
});
