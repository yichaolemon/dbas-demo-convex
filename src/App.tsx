import { useQuery, useMutation } from "../convex/_generated/react";
import { useEffect, useState } from "react";
import { replicationInfo } from "./constants";
import startRunningJob from "../convex/startRunningJob";
import { Id, Document } from "../convex/_generated/dataModel";
import React from 'react'
import Select from 'react-select'


const SubmitMigration = () => {
  const submitMigrationJob = useMutation("submitMigrationJob");
  const [submittedJobUuid, setSubmittedJobUuid] = useState("");

  const [replicationId, setReplicationId] = useState(replicationInfo[0].id);
  const [isRollback, setIsRollback] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");

  const selectedInfo = replicationInfo.filter((info) => info.id === replicationId)[0];
  const [migrationJobId, setMigrationJobId] = useState(selectedInfo.migration_job_ids[0]);

  async function submitSelectedJob() {
    let time = +scheduledTime;
    if (scheduledTime.length === 0) {
      time = new Date().getTime();
    }
    let id = await submitMigrationJob(replicationId, migrationJobId, selectedInfo.migrationUnit,
      selectedInfo.type, isRollback, time);

    setSubmittedJobUuid(id.toString());
  }

  return (
    <div>
      <h3 style={{color: "#72bcd4"}}>Submit your migration jobs:</h3>
      <p><strong>Logical DB</strong>: {selectedInfo.localDbName}</p>
      <p><strong>Source Host</strong>: {selectedInfo.sourceId} <strong>Target Host</strong>: {selectedInfo.targetId}</p>
      <p><strong>Migration Type</strong>: {selectedInfo.type} <strong>Unit</strong>: {selectedInfo.migrationUnit}</p>
      <p>
        <strong>Replication Id:&nbsp;</strong>
        <Select
          defaultValue={{value: replicationId, label: replicationId}}
          options={replicationInfo.map((info) => {
            return { value: info.id, label: info.id }
          })}
          onChange={(newValue, _) => {
            if (newValue === null) {
              return
            }
            setMigrationJobId(replicationInfo.filter((info) => info.id === newValue.value)[0].migration_job_ids[0])
            setReplicationId(newValue.value)
          }}
        />
      </p>
      <p>
        <strong>Migration job id:&nbsp;</strong>
        <Select
          // defaultValue={{value: migrationJobId, label: migrationJobId}}
          value={{value: migrationJobId, label: migrationJobId}}
          options={selectedInfo.migration_job_ids.map((id) => {
            return {value: id, label: id}
          })}
          onChange={(newValue, _) => {
            if (newValue === null) {
              return
            }
            setMigrationJobId(newValue.value)
          }}
        />
      </p>
      <p><strong>Rollback: </strong><input type="checkbox" checked={isRollback} onChange={(e) => setIsRollback(e.target.checked)} /></p>
      <p>Scheduled time (millis since epoch) <input type="text" placeholder="leave blank to run now" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} /></p>
      <button onClick={submitSelectedJob}>Submit Job!</button><p>Job just submitted: <text style={{color: "red"}}>{submittedJobUuid}</text></p>
    </div>
  );
};

const SearchResult = ({jobUuid}: {jobUuid: string}) => {
  const migrationJobById = useQuery('getMigrationJobById', new Id("migration_jobs", jobUuid));
  return (
    <textarea value={JSON.stringify(migrationJobById, null, 4)} />
  )
}

const SearchMigrationJobs = () => {
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
}

const ListMigrationJobs = () => {
  const submitMigrationJob = useMutation("submitMigrationJob");
  const finishRunningJob = useMutation("finishRunningJob");

  const [replicationId, setReplicationId] = useState("ALL");
  const selectedInfo = (replicationId === "ALL") ? null : replicationInfo.filter((info) => info.id === replicationId)[0];
  const [migrationJobId, setMigrationJobId] = useState("ALL");

  const allScheduledJobs = useQuery('getMigrationJobs', replicationId, migrationJobId);

  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const jobToRunningInMinutes = (startedAt: number|null, finishedAt: number|null): string => {
    if (startedAt == null) {
      return ""
    }
    const later = finishedAt == null ? currentTime : finishedAt
    const date = new Date(later - startedAt)
    return date.toISOString().substring(11, 19)
  }

  useEffect(() => {
    setTimeout(() => {
      setCurrentTime(new Date().getTime());
    }, 1000)
  }, [currentTime]);

  const styleState = (state: string) => {
    switch (state) {
      case "Cancelled":
      case "Scheduled": return { background: "#8f9c99" }
      case "Failed": return { background: "#d4442a" }
      case "Succeeded": return { background: "#30b027" }
      case "Running": return { background: "#85c0de" }
      default: {}
    }
  }

  if (!allScheduledJobs) {
    return null;
  }

  const getButtons = (job: Document<"migration_jobs">) => {
    switch (job.state) {
      case "Running": {
        return <div></div>
      }
      case "Failed": {
        return <div>
          <button onClick={() =>
            submitMigrationJob(job.replicationId, job.migrationJobId, job.migrationJobIdType, job.type,
              job.isRollback, new Date().getTime())}
          >Resubmit</button>
        </div>
      }
      case "Scheduled": {
        return <div>
          <button onClick={() =>
            finishRunningJob(job._id, "Cancelled")}>Cancel</button>
        </div>
      }
      default: {
        return <div></div>
      }
    }
  }

  return (
    <div>
      <h3 style={{color: "#72bcd4"}}>All jobs:</h3>
      <p>
        <strong>Replication Id:&nbsp;</strong>
        <Select
          value={{value: replicationId, label: replicationId}}
          options={[{ value: "ALL", label: "ALL" }]
            .concat(replicationInfo.map((info) => {
              return { value: info.id, label: info.id }
            }))}
          onChange={(newValue, _) => {
            if (newValue === null) {
              return
            }
            setReplicationId(newValue.value)
            setMigrationJobId("ALL")
          }}
        />
      </p>
      <p>
        <strong>Migration job id:&nbsp;</strong>
        <Select
          // defaultValue={{value: migrationJobId, label: migrationJobId}}
          value={{value: migrationJobId, label: migrationJobId}}
          options={
            (selectedInfo === null) ? [] :
              [{ value: "ALL", label: "ALL" }].concat(
                selectedInfo.migration_job_ids.map((id) => {
                  return { value: id, label: id }
                }))}
          onChange={(newValue, _) => {
            if (newValue === null) {
              return
            }
            setMigrationJobId(newValue.value)
          }}
        />
      </p>
      <table>
        <thead>
        <tr>
          <th>ID</th>
          <th>Type</th>
          <th>Ready At</th>
          <th>Started At</th>
          <th>Finished At</th>
          <th>State</th>
          <th>Action</th>
        </tr>
        </thead>
        <tbody>
        {
          allScheduledJobs.map((job) =>
          <tr key={job._id.toString()}>
            <td>{job._id.toString()} <br/> <br/>{job.replicationId}</td>
            <td>{job.type} <br/> {job.isRollback ? "rollback" : "migrate"} <br/> {job.migrationJobIdType}</td>
            <td>{new Date(job.scheduledTime).toLocaleString()}</td>
            <td>{job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}</td>
            <td>{job.finishedAt ? new Date(job.finishedAt).toLocaleString() : ""}</td>
            <td><p style={styleState(job.state)}>{job.state}</p>{`${jobToRunningInMinutes(job.startedAt, job.finishedAt)}`}</td>
            <td>{getButtons(job)}</td>
          </tr>
          )
        }
        </tbody>
      </table>
    </div>
  );
};

const MockRunMigrationJobs = () => {
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
  )
}

export default function App() {
  return (
    <main>
      <SubmitMigration />
      <br/>
      <MockRunMigrationJobs />
      <br/>
      <SearchMigrationJobs />
      <br/>
      <ListMigrationJobs />
    </main>
  );
}
