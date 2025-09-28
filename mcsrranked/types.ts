export type PopulatedLeaderboard = Omit<DataLeaderboard, "users"> & {
  users: DataUserData[];
};

/** https://docs.mcsrranked.com/#leaderboard */
export type DataLeaderboard = {
  users: (ObjectUserProfile & {
    seasonResult: {
      eloRate: number;
      eloRank: number;
      phasePoint: number;
    };
  })[];
};

/** https://docs.mcsrranked.com/#live- */
export type DataLive = {
  players: number;
  liveMatches: {
    currentTime: number;
    players: ObjectUserProfile[];
    data: Record<string, {
      liveUrl?: string;
      timeline: null | {
        time: number;
        type: string;
      };
    }>;
  }[];
};

/** https://docs.mcsrranked.com/#users-identifier */
export type DataUserData = ObjectUserProfile & {
  connections: Record<string, ObjectConnection>;
  seasonResult: {
    phase: number;
    eloRate: number | null;
    eloRank: number | null;
    point: number;
  };
  timestamp: {
    firstOnline: number;
    lastOnline: number;
    lastRanked: number;
    nextDecay: number | null;
  };
  statistics: {
    total: {
      bestTime: {
        ranked: number;
      };
    };
  };
};

/** https://docs.mcsrranked.com/#objects-userprofile */
export type ObjectUserProfile = {
  uuid: string;
  nickname: string;
  roleType: number;
  eloRate: number | null;
  eloRank: number | null;
  country?: string;
};

export type ObjectConnection = {
  id: string;
  name: string;
};

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
