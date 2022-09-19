import { useQuery, useMutation } from "../convex/_generated/react";
import { useEffect, useState } from "react";
import { replicationInfo } from "./constants";
import startRunningJob from "../convex/startRunningJob";
import { Id, Document } from "../convex/_generated/dataModel";
import React from 'react'
import Select from 'react-select'
import useCollapse from 'react-collapsed';

const Collapsible = (props:any) => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
  return (
    <div className="collapsible">
      <div className="header" {...getToggleProps()}>
        <strong>Runs</strong>
      </div>
      <div {...getCollapseProps()}>
        <div className="content">
          uuid: {props.job._id.toString()}, started_at: {props.job.startedAt}, finished_at: {props.job.finishedAt}
        </div>
      </div>
    </div>
  );
}

const MigrationUnit = (props: any) => {
  return (
    <div>
      <td>{props.id}, {props.unit}</td>
      <td>Not Started</td>
    </div>
  )
}

// const SubmitMigration = () => {
//   const submitMigrationJob = useMutation("submitMigrationJob");
//   const [submittedJobUuid, setSubmittedJobUuid] = useState("");

//   const [replicationId, setReplicationId] = useState(replicationInfo[0].id);
//   const [isRollback, setIsRollback] = useState(false);
//   const [scheduledTime, setScheduledTime] = useState("");

//   const selectedInfo = replicationInfo.filter((info) => info.id === replicationId)[0];
//   const [migrationJobId, setMigrationJobId] = useState("");
//   const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();

//   async function submitSelectedJob() {
//     let time = +scheduledTime;
//     if (scheduledTime.length === 0) {
//       time = new Date().getTime();
//     }
//     let id = await submitMigrationJob(replicationId, migrationJobId, "",
//       selectedInfo.type, isRollback, time);

//     setSubmittedJobUuid(id.toString());
//   }

//   return (
//     <div>
//       <h3 style={{color: "#72bcd4"}}>Submit your migration jobs:</h3>
//       <p><strong>Logical DB</strong>: {selectedInfo.logicalDbName}</p>
//       <p><strong>Source Host</strong>: {selectedInfo.sourceId} <strong>Target Host</strong>: {selectedInfo.targetId}</p>
//       <p><strong>Migration Type</strong>: {selectedInfo.type}</p>
//       <p>
//         <strong>Replication Id:&nbsp;</strong>
//         <Select
//           defaultValue={{value: replicationId, label: replicationId}}
//           options={replicationInfo.map((info) => {
//             return { value: info.id, label: info.id }
//           })}
//           onChange={(newValue, _) => {
//             if (newValue === null) {
//               return
//             }
//             setMigrationJobId(replicationInfo.filter((info) => info.id === newValue.value)[0].migration_job_ids[0])
//             setReplicationId(newValue.value)
//           }}
//         />
//       </p>
//       <p>
//         <strong>Migration job id:&nbsp;</strong>
//         <Select
//           // defaultValue={{value: migrationJobId, label: migrationJobId}}
//           value={{value: migrationJobId, label: migrationJobId}}
//           options={selectedInfo.migration_job_ids.map((id) => {
//             return {value: id, label: id}
//           })}
//           onChange={(newValue, _) => {
//             if (newValue === null) {
//               return
//             }
//             setMigrationJobId(newValue.value)
//           }}
//         />
//       </p>
//       <p><strong>Rollback: </strong><input type="checkbox" checked={isRollback} onChange={(e) => setIsRollback(e.target.checked)} /></p>
//       <p>Scheduled time (millis since epoch) <input type="text" placeholder="leave blank to run now" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} /></p>
//       <button onClick={submitSelectedJob}>Submit Job!</button><p>Job just submitted: <text style={{color: "red"}}>{submittedJobUuid}</text></p>
//     </div>
//   );
// };

const SearchResult = ({jobUuid}: {jobUuid: string}) => {
  const migrationJobById = useQuery('getMigrationJobById', new Id("migration_jobs", jobUuid));
  return (
    <textarea value={JSON.stringify(migrationJobById, null, 4)} />
  )
}

const SearchMigrationJob = () => {
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
        <td>{(replicationId === "ALL") ? rid : ""} <br /> {mtype.toString().toUpperCase()}, {mid}</td>
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
        {(i === 0) ? <td rowSpan={filtered.length}>{(replicationId === "ALL") ? rid : ""} <br /> {mtype.toString().toUpperCase()}, {mid}</td> : null}
        <td>{job._id.toString()}<br/><span style={styleState(job.state)}>{`${job.isRollback ? "Rollback" : "Migrate"} ${job.state}`}</span></td>
        <td>{job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}</td>
        <td>{job.finishedAt ? new Date(job.finishedAt).toLocaleString() : ""}</td>
        <td>{getButtons(job)}</td>
      </tr>
      ))
  }

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
        <strong>Pipeline Status:&nbsp;</strong><br/>
        Databse snapshotter: Running, 
        Binlog ingester: Running,
        Replicator: Running <br/>
      </p>
      <p>
        <strong>Pipeline Action Workflows:&nbsp;</strong><br/>
        <p>
          job id: <input type="text" placeholder="idempotency token"></input>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button>Create Restored Backup</button>
        </p>
        <p>
          job id: <input type="text" placeholder="idempotency token"></input>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button>Initialize Dbz Offset</button>
        </p>
        <p>
          job id: <input type="text" placeholder="idempotency token"></input>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button>Start Snapshotter Backfill</button>
        </p>
        <p>
          job id: <input type="text" placeholder="idempotency token"></input>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button>Bootstrap Snapshot</button> This runs the above three sequentially
        </p>
      </p>
      <p>
        <strong>Workflow Jobs:&nbsp;</strong>
        TODO: add a table here
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
      {/* <SubmitMigration /> */}
      {/* <br/> */}
      <ListMigrationJobs />
      <br/>
      <MockRunMigrationJobs />
      <br/>
      <SearchMigrationJob />
    </main>
  );
}
