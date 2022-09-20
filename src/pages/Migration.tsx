import { ListMigrationJobs } from "../components/ListMigrationJobs";
import { MockRunMigrationJobs } from "../components/MockRunMigrationJobs";
import { SearchMigrationJob } from "../components/SearchMigrationJob";
import { ToastContainer } from "react-toastify";

export const MigrationPage = () => {
  return (
    <div>
      <ToastContainer position="bottom-right" newestOnTop />
      <ListMigrationJobs />
      <br/>
      <MockRunMigrationJobs />
      <br />
      <SearchMigrationJob />
    </div>
  )
}