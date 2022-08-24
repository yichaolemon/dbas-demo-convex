import { defineSchema, defineTable, s } from "convex/schema";

export default defineSchema({
  migration_jobs: defineTable({
    isBucket: s.boolean(),
    isRollback: s.boolean(),
    migrationJobId: s.number(),
    replicationId: s.string(),
    scheduledTime: s.number(),
    startedAt: s.union(s.number(), s.null()),
    finishedAt: s.union(s.number(), s.null()),
    state: s.string(),
    type: s.string(),
  }),
});
