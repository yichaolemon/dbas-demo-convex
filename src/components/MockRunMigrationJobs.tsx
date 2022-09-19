import { useQuery, useMutation } from "../../convex/_generated/react";
import { useEffect, useState } from "react";
import { Id, Document } from "../../convex/_generated/dataModel";

export const MockRunMigrationJobs = () => {
  const [jobUuid, setJobUuid] = useState("");
  const startRunningJob = useMutation("startRunningJob");
  const finishRunningJob = useMutation("finishRunningJob");

  return (
    <div>
      <h3 style={{color: "#72bcd4"}}>Mock run your job: (Testing only!!!)</h3>
      <p>Click on one of the buttons at a time:</p>
      <p>uuid: <input type="text" placeholder="UUID of a job to mock" value={jobUuid} onChange={(e) => setJobUuid(e.target.value)}></input>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={() => startRunningJob(new Id("migration_jobs", jobUuid))}>Start Running Job!</button>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={() => finishRunningJob(new Id("migration_jobs", jobUuid), "Succeeded")}>Complete a Running Job!</button>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={() => finishRunningJob(new Id("migration_jobs", jobUuid), "Failed")}>Fail a Running Job!</button>
      </p>
    </div>
  );
};
