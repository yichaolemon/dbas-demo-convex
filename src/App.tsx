import { useQuery, useMutation } from "../convex/_generated/react";
import { useEffect, useState } from "react";
import { replicationInfo } from "./constants";
import startRunningJob from "../convex/startRunningJob";
import { Id } from "../convex/_generated/dataModel";
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
        {/* <select value={replicationId} onChange={(e) => setReplicationId(e.target.value)}>
          {replicationInfo.map((info) =>
          <option key={info.id} value={info.id}>{info.id}</option>
          )}
        </select> */}
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
        {/* <select value={migrationJobId} onChange={(e) => setMigrationJobId(+e.target.value)}>
          {selectedInfo.migration_job_ids.map((id) =>
          <option key={id} value={id}>{id}</option>
          )}
        </select> */}
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

const ListMigrationJobs = () => {
  const allScheduledJobs = useQuery('getMigrationJobs');

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
    if (state == "Scheduled") {
      return {background: "#8f9c99"}
    }
    if (state == "Failed") {
      return {background: "#d4442a"}
    }
    if (state == "Completed") {
      return {background: "#30b027"}
    }
    return {background: "#85c0de"}
  }

  if (!allScheduledJobs) {
    return null;
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

  function submitRunningJob() {
    startRunningJob(new Id("migration_jobs", jobUuid));
  }

  function submitFinishJob(failed: boolean) {
    finishRunningJob(new Id("migration_jobs", jobUuid), failed);
  }

  return (
    <div>
      <h3 style={{color: "#72bcd4"}}>Mock run your job:</h3>
      <p>Click on one of the buttons at a time:</p>
      <p>uuid: <input type="text" placeholder="type in the UUID of a job" value={jobUuid} onChange={(e) => setJobUuid(e.target.value)}></input>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={submitRunningJob}>Start Running Job!</button>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={() => submitFinishJob(false)}>Complete a Running Job!</button>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <button onClick={() => submitFinishJob(true)}>Fail a Running Job!</button>
      </p>
    </div>
  )
}

export default function App() {
  // // Watch the results of the Convex function `getCounter`.
  // const counter = useQuery("getCounter") ?? 0;

  return (
    <main>
      <SubmitMigration />
      <br/>
      <MockRunMigrationJobs />
      <br/>
      <ListMigrationJobs />
    </main>
  );
}
// replication_id -> Array<(migration_job_id,is_bucket)>
