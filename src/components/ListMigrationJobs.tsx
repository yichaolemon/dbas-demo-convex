import { useQuery, useMutation } from "../../convex/_generated/react";
import { useEffect, useState } from "react";
import { replicationInfo } from "../constants";
import { Id, Document } from "../../convex/_generated/dataModel";
import React from 'react'
import Select from 'react-select'
import useCollapse from 'react-collapsed';

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

  const getScheduledJobs = (mid: any) => {
    return (
      <tr key={mid}>
        {
          allScheduledJobs?.filter((job) => job.migrationJobId === mid)
            .map((job) =>
              (
              <div>
              <td>uuid: {job._id.toString()}</td>
              <td>started_at: {job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}</td>
              <td>finished_at: {job.finishedAt ? new Date(job.finishedAt).toLocaleString() : ""}</td>
              </div>
            )
          )
        }
      </tr>
    )
  }

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

  const getButtons = (job: Document<"migration_jobs">) => {
    switch (job.state) {
      case "Running": {
        return <div></div>
      }
      case "Cancelled":
      case "Failed": {
        return <div>
          <button onClick={() =>
            submitMigrationJob(job.replicationId, job.migrationJobId, job.migrationJobIdType, job.type,
              false, new Date().getTime())}
          >Migrate</button>
          <button onClick={() =>
            submitMigrationJob(job.replicationId, job.migrationJobId, job.migrationJobIdType, job.type,
              true, new Date().getTime())}
          >Rollback</button>
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
  };

  const sortTable = (by: string) => {
    switch (by) {
      case "finishedAt": sortedJobs.sort((a, b) => {
        if (a.finishedAt === null) {
          return 1
        }
        if (b.finishedAt === null) {
          return -1
        }
        return a.finishedAt - b.finishedAt
      });
      break;
      case "readyAt": sortedJobs.sort((a, b) => {
        if (a.scheduledTime === null) {
          return 1
        }
        if (b.scheduledTime === null) {
          return -1
        }
        return a.scheduledTime - b.scheduledTime
      });
      break;
      case "startedAt": sortedJobs.sort((a, b) => {
        if (a.startedAt === null) {
          return 1
        }
        if (b.startedAt === null) {
          return -1
        }
        return a.startedAt - b.startedAt
      });
      break;
    }

    // needs to copy to make it rerender, otherwise same pointer
    setSortedJobs(sortedJobs.slice());
  };

  const jobsRows = (rid: any, mid: any, mtype: any, t: any) => {
    const filtered = allScheduledJobs?.filter((job) => job.migrationJobId === mid)
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
        <td className="unit-row">{(replicationId === "ALL") ? rid : ""} <br /> {mtype.toString().toUpperCase()}, {mid}</td>
        {/* <td><button onClick={() => submitMigrationJob(rid, mid, mtype, t, false, new Date().getTime())}>Submit</button></td> */}
        <td></td>
        <td></td>
        <td></td>
        <td><button onClick={() => submitMigrationJob(rid, mid, mtype, t, false, new Date().getTime())}>Migrate</button></td>
      </tr>;
    }
    return filtered
      .map((job, i, filtered) =>
      (<tr>
        {(i === 0) ? <td className="unit-row" rowSpan={filtered.length}>{(replicationId === "ALL") ? rid : ""} <br /> {mtype.toString().toUpperCase()}, {mid}</td> : null}
        <td>{job._id.toString()}<br/><span style={styleState(job.state)}>{`${job.isRollback ? "Rollback" : "Migrate"} ${job.state}`}</span></td>
        <td>{job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}</td>
        <td>{job.finishedAt ? new Date(job.finishedAt).toLocaleString() : ""}</td>
        <td>{getButtons(job)}</td>
      </tr>
      ))
  };

  return (
    <div>
      <h3 style={{color: "#72bcd4"}}>All Replication and Migration Units:</h3>
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
        <strong>Migration Units:&nbsp;</strong>
      </p>
      <table>
        <tr>
          <th>Migration Unit</th>
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