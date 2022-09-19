
import { useQuery, useMutation } from "../../convex/_generated/react";
import { useEffect, useState } from "react";
import { Id, Document } from "../../convex/_generated/dataModel";

const SearchResult = ({jobUuid}: {jobUuid: string}) => {
  const migrationJobById = useQuery('getMigrationJobById', new Id("migration_jobs", jobUuid));
  return (
    <textarea value={JSON.stringify(migrationJobById, null, 4)} />
  )
}

export const SearchMigrationJob = () => {
  const [jobUuid, setJobUuid] = useState("");
  const [searchedJobUuid, setSearchedJobUuid] = useState("");

  return (
    <div>
      <p>
      <h3 style={{color: "#72bcd4"}}>Search your migration jobs:</h3>
      uuid: <input type="text" placeholder="UUID of a job to search" value={jobUuid} onChange={(e) => setJobUuid(e.target.value)}></input>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={() => setSearchedJobUuid(jobUuid)}>Search!</button>
      {searchedJobUuid ? <SearchResult jobUuid={searchedJobUuid}/> : null}
      </p>
    </div>
  )
};