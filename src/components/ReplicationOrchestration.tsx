

export const ReplicationOrchestration = () => {
  return (
    <div>
      <h3 style={{color: "#72bcd4"}}>Replication Orchestration: </h3>
      <p>
        <strong>Pipeline Status:&nbsp;</strong><br/>
        Databse snapshotter: Running, 
        <text style={{color: "red"}}>MOCK at the moment</text><br/>
        Binlog ingester: Running,
        <text style={{color: "red"}}>MOCK at the moment</text><br/>
        Replicator: Running, 
        <text style={{color: "red"}}>MOCK at the moment</text><br/>
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
    </div>
  )
};
