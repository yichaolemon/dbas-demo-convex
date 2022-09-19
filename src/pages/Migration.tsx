import { ListMigrationJobs } from "../components/ListMigrationJobs";
import { MockRunMigrationJobs } from "../components/MockRunMigrationJobs";
import { SearchMigrationJob } from "../components/SearchMigrationJob";

export const MigrationPage = () => {
  return (
    <div>
      <ListMigrationJobs />
      <br/>
      <MockRunMigrationJobs />
      <br />
      <SearchMigrationJob />
    </div>
  )
}