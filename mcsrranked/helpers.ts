import { fetchUserData } from "./api.ts";
import { LEADERBOARD_SIZE } from "./constants.ts";
import { DataLeaderboard, DataLive, PopulatedLeaderboard } from "./types.ts";

export function sortMatchesNewest<T extends DataLive>(data: T) {
  data.liveMatches.sort((a, b) => a.currentTime - b.currentTime);
  return data;
}

export async function populateLeaderboard<T extends DataLeaderboard>(
  leaderboard: T,
) {
  const users = await Promise.all(
    leaderboard.users.slice(0, LEADERBOARD_SIZE).map((user) =>
      fetchUserData(user.uuid)
    ),
  );
  return { ...leaderboard, users } satisfies PopulatedLeaderboard;
}

/**
 * Populate missing non-streaming player data for live matches API data result.
 */
export async function populateNonStreamingUsers<T extends DataLive>(
  live: T,
) {
  const promises = live.liveMatches.flatMap((match) => {
    const known = new Set(match.players.map((p) => p.uuid));
    return Object.keys(match.data)
      .filter((uuid) => !known.has(uuid))
      .map((uuid) => fetchUserData(uuid).then((user) => ({ match, user })));
  });
  for (const { match, user } of await Promise.all(promises)) {
    match.players.push(user);
  }
  return live;
}
