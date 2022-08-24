import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

export default mutation(async ({ db }, id: Id<"migration_jobs">, failed: boolean) => {
    const toState = failed ? "Failed" : "Completed";
    const doc = await db.get(id)
    if (doc == null) {
        throw Error(`Job ${id} does not exist`);
    }
    if (doc?.state == "Running") {
        db.patch(id, {
            finishedAt: new Date().getTime(),
            state: toState,
        });
    } else {
        throw Error(`Job ${id} is in ${doc?.state} state, illegal state transition to ${toState}`);
    }
});
