import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import { MigrationPage } from "./pages/Migration";
import { ReplicationPage } from "./pages/Replication";
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

export default function App() {
  return (
    <main>
      <Router>
        <ul>
          <li>
            <Link to="/migration">Migration</Link>
          </li>
          <li>
            <Link to="/replication">Replication</Link>
          </li>
        </ul>
        <Routes>
          <Route path="/" element={<MigrationPage />} />
          <Route path="/migration" element={<MigrationPage />} />
          <Route path="/replication" element={<ReplicationPage />} />
        </Routes>
      </Router>
    </main>
  );
}
