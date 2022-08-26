import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  migration_jobs: defineTable({
    replicationId: s.string(),
    migrationJobId: s.string(),
    migrationJobIdType: s.string(),
    state: s.string(),
    type: s.string(),
    isRollback: s.boolean(),
    scheduledTime: s.number(),
    startedAt: s.union(s.number(), s.null()),
    finishedAt: s.union(s.number(), s.null()),
  }),
});
