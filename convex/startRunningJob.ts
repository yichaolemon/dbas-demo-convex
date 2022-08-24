import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

export default mutation(async ({ db }, id: Id<"migration_jobs">) => {
    const doc = await db.get(id);
    if (doc == null) {
        throw Error(`Job ${id} does not exist`);
    }
    if (doc?.state == "Scheduled") {
        db.patch(id, {
            startedAt: new Date().getTime(),
            finishedAt: null,
            state: "Running",
        });
    } else {
        throw Error(`Job ${id} is in ${doc?.state} state, illegal state transition to Running`);
    }
});
