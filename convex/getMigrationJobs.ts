import { query } from "./_generated/server";
import { Document } from "./_generated/dataModel";

// Running < Scheduled < Completed < Failed
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

export default query(async ({ db }): Promise<Document<"migration_jobs">[]> => {
  const result = await db.table("migration_jobs")
    .collect();
  
  result.sort((a, b) => {
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
  
  return result;
});
