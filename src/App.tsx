import { useQuery, useMutation } from "../convex/_generated/react";
import { useEffect, useState } from "react";
import { replicationInfo } from "./constants";
import startRunningJob from "../convex/startRunningJob";
import { Id, Document } from "../convex/_generated/dataModel";
import React from 'react'
import Select from 'react-select'


const SubmitMigration = () => {
  const submitMigrationJob = useMutation("submitMigrationJob");

  const [replicationId, setReplicationId] = useState(replicationInfo[0].id);
  const [isRollback, setIsRollback] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");

  const selectedInfo = replicationInfo.filter((info) => info.id === replicationId)[0];
  const [migrationJobId, setMigrationJobId] = useState(selectedInfo.migration_job_ids[0]);

  const replicationIdOptions = replicationInfo.map((info) => {
    return { value: info.id, label: info.id }
  })

  function submitSelectedJob() {
    // Execute the Convex function `incrementCounter` as a mutation
    // that updates the counter value.
    let time = +scheduledTime;
    if (scheduledTime.length === 0) {
      time = new Date().getTime();
    }
    submitMigrationJob(replicationId, migrationJobId, selectedInfo.isBucket, isRollback, time, selectedInfo.type);
  }

  return (
    <div>
      <h3 style={{color: "#72bcd4"}}>Submit your migration jobs:</h3>
      <p><strong>Source</strong>: {selectedInfo.sourceId}</p>
      <p><strong>Target</strong>: {selectedInfo.targetId}</p>
      <p><strong>Type</strong>: {selectedInfo.type}. <strong>Is Bucket</strong>: {selectedInfo.isBucket ? "true" : "false"}</p>
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
            setMigrationJobId(+(newValue?.value))
          }}
        />
      </p>
      <p><strong>Rollback: </strong><input type="checkbox" checked={isRollback} onChange={(e) => setIsRollback(e.target.checked)} /></p>
      <p>Scheduled time (millis since epoch) <input type="text" placeholder="leave blank to run now" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} /></p>
      <button onClick={submitSelectedJob}>Submit Job!</button>
    </div>
  );
};

const SearchMigrationJobs = () => {
  return (
    <div>
      <h3 style={{color: "#72bcd4"}}>Search your migration jobs:</h3>
    </div>
  )
}

const ListMigrationJobs = () => {
  const allScheduledJobs = useQuery('getMigrationJobs');
  const submitMigrationJob = useMutation("submitMigrationJob");
  const finishRunningJob = useMutation("finishRunningJob");

  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const jobToRunningInMinutes = (startedAt: number|null, finishedAt: number|null): string => {
    if (startedAt == null) {
      return ""
    }
    const later = finishedAt == null ? currentTime : finishedAt
    const diffInMinutes = Math.floor((later - startedAt) / (60 * 1000))
    const secsRemainder = ((later - startedAt) / 1000 ) % 60
    return `(${diffInMinutes.toFixed(0)} mins ${secsRemainder.toFixed(0)} secs)`
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
            submitMigrationJob(job.replicationId, job.migrationJobId, job.isBucket, job.isRollback, new Date().getTime(), job.type)}
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
      <table>
        <thead>
        <tr>
          <th>uuid</th>
          <th>migration job id</th>
          <th>is rollback</th>
          <th>scheduled time</th>
          <th>started at</th>
          <th>state</th>
          <th>type</th>
          <th>action</th>
        </tr>
        </thead>
        <tbody>
        {
          allScheduledJobs.map((job) =>
          <tr key={job._id.toString()}>
            <td>{job._id.toString()}</td>
            <td>{job.migrationJobId}</td>
            <td>{job.isRollback ? "rollback" : "migrate"}</td>
            <td>{new Date(job.scheduledTime).toLocaleString()}</td>
            <td>{job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}</td>
            <td><p style={styleState(job.state)}>{job.state}</p>{`${jobToRunningInMinutes(job.startedAt, job.finishedAt)}`}</td>
            <td>{job.type}</td>
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
      <h3 style={{color: "#72bcd4"}}>Mock run your job:</h3>
      <p>Click on one of the buttons at a time:</p>
      <p>uuid: <input type="text" placeholder="type in the UUID of a job" value={jobUuid} onChange={(e) => setJobUuid(e.target.value)}></input>
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
