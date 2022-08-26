import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { migrationJobStates } from "../src/constants";

export default mutation(async ({ db }, id: Id<"migration_jobs">, state: string) => {
  if (!(["Succeeded", "Failed", "Cancelled"]).includes(state)) {
    throw Error(`${state} is not terminal`)
  }

  const doc = await db.get(id)
  if (doc == null) {
    throw Error(`Job ${id} does not exist`);
  }
  if (!migrationJobStates.get(doc.state)?.includes(state)) {
    throw Error(`Job ${id} is in ${doc.state} state, illegal state transition to ${state}`);
  }

  db.patch(id, {
    finishedAt: new Date().getTime(),
    state: state,
  });
});
