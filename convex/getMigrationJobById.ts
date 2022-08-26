import { query } from "./_generated/server";
import { Document, Id  } from "./_generated/dataModel";


export default query(async ({ db }, id: Id<"migration_jobs">): Promise<Document<"migration_jobs">> => {
  const doc = await db.get(id)
  if (doc === null) {
    throw Error(`No job with id ${id.toString} exists!`);
  }
  return doc;
});
