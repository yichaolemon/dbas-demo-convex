import { useQuery, useMutation } from "../../convex/_generated/react";
import { useEffect, useState } from "react";
import { replicationInfo } from "../constants";
import { Id, Document } from "../../convex/_generated/dataModel";
import React from 'react'
import Select from 'react-select'
import useCollapse from 'react-collapsed';
import { toast, TypeOptions } from "react-toastify";
import "react-toastify/ReactToastify.min.css";


export const ListMigrationJobs = () => {
  const submitMigrationJob = useMutation("submitMigrationJob");
  const finishRunningJob = useMutation("finishRunningJob");

  const [replicationId, setReplicationId] = useState("ALL");
  const selectedInfo = (replicationId === "ALL") ? null : replicationInfo.filter((info) => info.id === replicationId)[0];
  const [migrationJobId, setMigrationJobId] = useState("ALL");

  //TODO: this is dumb
  const allScheduledJobs = useQuery('getMigrationJobs', replicationId, migrationJobId);
  const [sortedJobs, setSortedJobs] = useState(allScheduledJobs);
  const allIds = allScheduledJobs?.map((doc) => [doc.replicationId, doc.migrationJobId]);

  useEffect(() => {
    setSortedJobs(allScheduledJobs)
  }, [allScheduledJobs]);

  const allJobs = [];
  for (let rinfo of replicationInfo) {
    if (replicationId !== "ALL" && replicationId !== rinfo.id) {
      continue
    }
    for (let mid of rinfo.migrationInfo.workspaces ) {
      allJobs.push([rinfo.id, mid, "workspace", rinfo.type])
    }
    for (let mid of [...Array(rinfo.migrationInfo.buckets).keys()]) {
      allJobs.push([rinfo.id, mid, "bucket", rinfo.type])
    }
  }

  const migrateButton = (rid:string, mid:string, mtype:string, t:string) =>
    <button className="submit-rollback-job" onClick={() => {
      const idPromise = submitMigrationJob(rid, mid, mtype, t, false, new Date().getTime())
      idPromise.then((id) => toast(`Successfully queued up migrate job with UUID: ${id}`))
      .catch((error) => toast(`Request failed: ${error}`))
    }}>
      Migrate
    <span className="tooltiptext">Migrate this unit. The execution will happen asynchronously.</span>
    </button>
  const rollbackButton = (rid:string, mid:string, mtype:string, t:string) =>
    <button className="submit-migrate-job" onClick={() => {
      const idPromise = submitMigrationJob(rid, mid, mtype, t, true, new Date().getTime())
      idPromise.then((id) => toast(`Successfully queued up rollback job with UUID: ${id}`))
      .catch((error) => toast(`Request failed: ${error}`))
    }}>
      Rollback
    <span className="tooltiptext">Rollback this unit. The execution will happen asynchronously.</span>
    </button>
  const cancelButton = (id:Id<"migration_jobs">) =>
    <button onClick={() => {
      const emptyPromise = finishRunningJob(id, "Cancelled")
      emptyPromise.then((_) => toast(`Successfully cancled job with UUID: ${id.id}`))
      .catch((error) => toast(`Request failed: ${error}`))
    }}>
      Cancel
    <span className="tooltiptext">Cancel this scheduled job if the execution hasn't started yet.</span>
    </button>

  const allUnscheduledJobs = [];
  for (let rinfo of replicationInfo) {
    for (let mid of rinfo.migrationInfo.workspaces ) {
      if (allIds === undefined) {
        continue
      }
      if (replicationId !== "ALL" && replicationId !== rinfo.id) {
        continue
      }
      if (migrationJobId !== "ALL" && migrationJobId !== mid) {
        continue
      }
      if (allIds?.filter(([r_id, m_id]) => r_id === rinfo.id && m_id === mid).length === 0) {
        allUnscheduledJobs.push([rinfo.id, mid, "", rinfo.type])
      }
    }
  }

  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  useEffect(() => {
    setTimeout(() => {
      setCurrentTime(new Date().getTime());
    }, 1000)
  }, [currentTime]);

  const styleState = (state: string) => {
    switch (state) {
      case "Cancelled": return { background: "#ffd24d" }
      case "Scheduled": return { background: "#8f9c99" }
      case "Failed": return { background: "#d4442a" }
      case "Succeeded": return { background: "#30b027" }
      case "Running": return { background: "#85c0de" }
      default: {}
    }
  }

  if (!allScheduledJobs || !sortedJobs) {
    return null;
  }

  const jobsRows = (rid: any, mid: any, mtype: any, t: any) => {
    const filtered = allScheduledJobs?.filter((job) => job.migrationJobId === mid && job.replicationId === rid)
    .sort((a, b) => {
      if (!a.startedAt) {
        return -1
      }
      if (!b.startedAt) {
        return 1
      }
      return a.startedAt - b.startedAt
    });
    if (!filtered || filtered.length === 0) {
      return <tr>
        <td className="unit-row">{(replicationId === "ALL") ? rid : ""} {mtype.toString().toUpperCase()}, {mid}</td>
        <td>{migrateButton(rid, mid, mtype, t)} {rollbackButton(rid, mid, mtype, t)}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>;
    }
    return filtered
      .map((job, i, filtered) =>
      (<tr>
        {(i === 0) ? <td className="unit-row" rowSpan={filtered.length}>{(replicationId === "ALL") ? rid : ""} <br /> {mtype.toString().toUpperCase()}, {mid}</td> : null}
        {(i === 0) ? <td rowSpan={filtered.length}>{migrateButton(rid, mid, mtype, t)} {rollbackButton(rid, mid, mtype, t)}</td> : null}
        <td>{job._id.toString()}<br/><span className="job-state" style={styleState(job.state)}>{`${job.isRollback ? "Rollback" : "Migrate"} ${job.state}`}</span></td>
        <td>{job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}</td>
        <td>{job.finishedAt ? new Date(job.finishedAt).toLocaleString() : ""}</td>
        <td>{job.state === "Scheduled" ? cancelButton(job._id) : <></>}</td>
      </tr>
      ))
  };

  return (
    <div>
      <h3 style={{color: "#72bcd4"}}>All Replication and Migration Units:</h3>
      <p>
        <strong>Replication Id:&nbsp;</strong>
        <Select
          className="replication-id-dropdown"
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
      <table>
        <tr>
          <th>Migration Unit</th>
          <th>Actions</th>
          <th>Run:UUID</th>
          <th>Run:StartedAt</th>
          <th>Run:FinishedAt</th>
          <th>Run:Actions</th>
        </tr>
        {
          allJobs.map(([rid, mid, mtype, t]) => 
            <tbody>
              {
                jobsRows(rid, mid, mtype, t)
              }
            </tbody>
          )
        }
      </table>
    </div>
  );
};