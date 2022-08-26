import { query } from "./_generated/server";
import { Document } from "./_generated/dataModel";
import { OrderedQuery } from "convex/server";

// Running < Scheduled < Completed < Failed < Cancelled
const compState = (a: string, b: string): number => {
  if (a == b) {
    return 0;
  }
  if (a == "Running") {
    return -1;
  }
  if (a == "Scheduled") {
    return b != "Running" ? -1: 1;
  }
  if (a == "Completed") {
    return b == "Failed" ? -1 : 1;
  }
  if (a == "Failed") {
    return 1;
  }
  return 0;
}

export default query(async ({ db }, replicationId: string|null, migrationJobId: string|null): Promise<Document<"migration_jobs">[]> => {
  let queryBuilder: any = db.table("migration_jobs")
  if (replicationId !== null && replicationId !== "ALL" && replicationId.length > 0) {
    queryBuilder = queryBuilder.filter((q: any) => q.eq(q.field("replicationId"), replicationId))
  }
  if (migrationJobId !== null && migrationJobId !== "ALL" && migrationJobId.length > 0) {
    queryBuilder = queryBuilder.filter((q: any) => q.eq(q.field("migrationJobId"), migrationJobId))
  }
  const docs = await queryBuilder.collect()
  
  docs.sort((a: Document<"migration_jobs">, b: Document<"migration_jobs">): number => {
    const l1 = compState(a.state, b.state)
    if (l1 != 0) {
      return l1;
    }
    if (a.state == "Running") {
      return (a.startedAt??0) - (b.startedAt??0)
    }
    if (a.state == "Completed" || a.state == "Failed") {
      return (a.finishedAt??0) - (b.finishedAt??0)
    }
    return (a.scheduledTime??0) - (b.scheduledTime??0)
  });
  
  return docs;
});
