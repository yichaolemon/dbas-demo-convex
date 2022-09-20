import { useEffect, useState } from "react";
import Select from 'react-select'
import { replicationInfo } from "../constants";

export const ReplicationOrchestration = () => {
  const [snapshotterState, setSnapshotterState] = useState("")
  const [binlogIngesterState, setBinlogIngesterState] = useState("")
  const [replicatorState, setReplicatorState] = useState("")
  const [replicationId, setReplicationId] = useState("");

  const pipelineStatus = (replicationId === "") ? null
  : (
    <p>
      <strong>Status:&nbsp;</strong><br />
      Databse snapshotter:&nbsp;&nbsp;<text style={{ color: "red" }}>{snapshotterState}</text>
      &nbsp;&nbsp;
      <button onClick={() => setSnapshotterState(Math.random() < 0.5 ? "Running!" : "Down!")}>Re-send a heartbeat</button>
      <br />
      Binlog ingester:&nbsp;&nbsp;<text style={{ color: "red" }}>{binlogIngesterState}</text>
      &nbsp;&nbsp;
      <button onClick={() => setBinlogIngesterState(Math.random() < 0.5 ? "Running!" : "Down!")}>Re-send a heartbeat</button>
      <br />
      Replicator: &nbsp;&nbsp;<text style={{ color: "red" }}>{replicatorState}</text>
      &nbsp;&nbsp;
      <button onClick={() => setReplicatorState(Math.random() < 0.5 ? "Running!" : "Down!")}>Re-send a heartbeat</button>
    </p>
  );
  
  const workflowSelection = (replicationId === "") ? null
    : (
      <p>
        <strong>Pipeline Action Workflows:&nbsp;</strong><br />
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
    );

  return (
    <div>
      <h3 style={{ color: "#72bcd4" }}>Replication Orchestration: </h3>
      <strong>Selected Pipeline:&nbsp;</strong>{replicationId}
      <Select
          className="replication-id-dropdown"
          value={{value: replicationId, label: replicationId}}
          options={replicationInfo.map((info) => {
              return { value: info.id, label: info.id }
            })}
          onChange={(newValue, _) => {
            if (newValue === null) {
              return
            }
            setReplicationId(newValue.value)
            setSnapshotterState(Math.random() < 0.5 ? "Running!" : "Down!")
            setBinlogIngesterState(Math.random() < 0.5 ? "Running!" : "Down!")
            setReplicatorState(Math.random() < 0.5 ? "Running!" : "Down!")
          }}
        />
      {pipelineStatus}
      {workflowSelection}
      <p>
        <strong>Workflow Jobs:&nbsp;</strong>
        TODO: add a table here
      </p>
    </div>
  )
};
