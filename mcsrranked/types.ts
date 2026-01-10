import { components, paths } from "./openapi-schema.d.ts";

export type PopulatedLeaderboard = Omit<DataLeaderboard, "users"> & {
  users: DataUserData[];
};

/** https://docs.mcsrranked.com/#leaderboard */
export type DataLeaderboard =
  paths["/leaderboard"]["get"]["responses"]["200"]["content"][
    "application/json"
  ];

/** https://docs.mcsrranked.com/#live- */
export type DataLive = paths["/live"]["get"]["responses"]["200"]["content"][
  "application/json"
];

/** https://docs.mcsrranked.com/#users-identifier */
export type DataUserData =
  paths["/users/{identifier}"]["get"]["responses"]["200"]["content"][
    "application/json"
  ];

/** https://docs.mcsrranked.com/#objects-userprofile */
export type ObjectUserProfile = components["schemas"]["UserProfile"];

export type Result<T> = Success<T> | Error<T>;

export type Success<T> = {
  status: "success";
  data: T;
};

export type Error<T> = {
  status: "error";
  data: string;
};

export function isError<T>(result: Result<T>): result is Error<T> {
  return result.status === "error";
}
