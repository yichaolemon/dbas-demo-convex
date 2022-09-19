export const replicationInfo = [
  {
    id: "koreacentral-dev-acl-primary-koreacentral-dev-acl-flex",
    sourceId: "koreacentral-dev-acl-primary",
    targetId: "koreacentral-dev-acl-flex",
    migrationInfo: {
      buckets: 5,
      workspaces: [
        "11223",
        "87373",
        "87324",
        "98823",
        "23842",
        "29735",
        "90923",
        "94583"
      ]
    },
    logicalDbName: "acl",
    type: "flex",
  },
  {
    id: "westus-dev-acl-primary-westus-dev-acl-tidb",
    sourceId: "westus-dev-acl-primary",
    targetId: "westus-dev-acl-tidb",
    migrationInfo: {
      buckets: 10,
      workspaces: [
        "2348",
        "2347",
        "2837",
        "8787",
        "2655",
        "7677"
      ],
    },
    logicalDbName: "acl",
    type: "tidb",
  },
  {
    id: "eastus-staging-deltapipelines-primary-eastus-staging-deltapipelines-flex",
    sourceId: "eastus-staging-deltapipelines-primary",
    targetId: "eastus-staging-deltapipelines-flex",
    migrationInfo: {
      buckets: 0,
      workspaces: [
        "23",
        "25",
        "20",
        "18",
        "94",
        "48"
      ],
    },
    logicalDbName: "deltapipelines",
    type: "flex",
  },
  {
    id: "westeurope-prod-sessions-primary-westeurope-prod-sessions-tidb",
    sourceId: "westeurope-prod-sessions-primary",
    targetId: "westeurope-prod-sessions-tidb",
    migrationInfo: {
      buckets: 20,
      workspaces: [
        "298492",
        "866348",
        "234755",
        "872731"
      ]
    },
    logicalDbName: "sessions",
    type: "tidb",
  },
  {
    id: "southasia-prod-ngrok-primary-southasia-prod-ngrok-tidb",
    sourceId: "southasia-prod-ngrok-primary",
    targetId: "southasia-prod-ngrok-tidb",
    migrationInfo: {
      buckets: 20,
      workspaces: [
        "5459",
        "35281",
        "85669",
        "40550"
      ],
    },
    logicalDbName: "ngrok",
    type: "tidb",
  }
];

export const migrationJobStates = new Map([
  ["Scheduled", ["Running", "Cancelled"]],
  ["Running", ["Succeeded", "Failed"]],
  ["Succeeded", []],
  ["Failed", []],
  ["Cancelled", []]
]);

export const migrationJobIdTypes = [
  "BUCKET",
  "WORKSPACE",
  "INSTANCE"
];

export const migrationJobTypes = [
  "flex",
  "tidb"
];
