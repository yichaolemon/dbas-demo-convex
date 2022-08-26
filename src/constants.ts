export const replicationInfo = [
  {
    id: "koreacentral-dev-acl-primary-koreacentral-dev-acl-flex",
    sourceId: "koreacentral-dev-acl-primary",
    targetId: "koreacentral-dev-acl-flex",
    migration_job_ids: [
      11223,
      87373,
      87324,
      98823,
      23842,
      29735,
      90923,
    ],
    type: "flex",
    isBucket: false
  },
  {
    id: "westus-dev-acl-primary-westus-dev-acl-tidb",
    sourceId: "westus-dev-acl-primary",
    targetId: "westus-dev-acl-tidb",
    migration_job_ids: [
      2348,
      2347,
      2837,
      8787,
      2655,
      7677
    ],
    type: "tidb",
    isBucket: false
  },
  {
    id: "eastus-staging-deltapipelines-primary-eastus-staging-deltapipelines-flex",
    sourceId: "eastus-staging-deltapipelines-primary",
    targetId: "eastus-staging-deltapipelines-flex",
    migration_job_ids: [
      23,
      25,
      20,
      18,
      94,
      48
    ],
    type: "flex",
    isBucket: false
  },
  {
    id: "westeurope-prod-sessions-primary-westeurope-prod-sessions-tidb",
    sourceId: "westeurope-prod-sessions-primary",
    targetId: "westeurope-prod-sessions-tidb",
    migration_job_ids: [
      298492,
      866348,
      234755,
      872731
    ],
    type: "tidb",
    isBucket: true
  }
];

export const migrationJobStates = new Map([
  ["Scheduled", ["Running", "Cancelled"]],
  ["Running", ["Succeeded", "Failed"]],
  ["Succeeded", []],
  ["Failed", []],
  ["Cancelled", []]
])
