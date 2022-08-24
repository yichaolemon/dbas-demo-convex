import { mutation } from "./_generated/server";

export default mutation(async ({ db }, 
  replicationId: string,
  migrationJobId: number,
  isBucket: boolean,
  isRollback: boolean,
  scheduledTime: number,
  type: string) => {

  const doc = await db.table("migration_jobs")
    .filter(q => q.and(
      q.eq(q.field("replicationId"), replicationId),
      q.eq(q.field("migrationJobId"), migrationJobId),
      q.or(q.eq(q.field("state"), "Running"), q.eq(q.field("state"), "Scheduled"))))
    .first()

  if (doc != null) {
    throw Error(`Can't schedule duplicate job while existing ${doc._id} is in ${doc.state} state`)
  }

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
