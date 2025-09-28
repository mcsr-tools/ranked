import { fetchStreams, fetchToken } from "#/twitch/mod.ts";
import { kv, WithMeta } from "#/kv/mod.ts";
import { fetchLeaderboard, fetchLiveMatches } from "./api.ts";
import { KV_KEY_API_LEADERBOARD_PREV } from "./constants.ts";
import {
  populateLeaderboard,
  populateNonStreamingUsers,
  sortMatchesNewest,
} from "./helpers.ts";
import { DataLeaderboard } from "./types.ts";

export async function getLiveMatches() {
  const live = await fetchLiveMatches();
  const sorted = sortMatchesNewest(live);
  return populateNonStreamingUsers(sorted);
}

export async function getLeaderboardWithStreams() {
  const [leaderboard, twitchToken] = await Promise.all([
    fetchLeaderboard().then(populateLeaderboard),
    fetchToken(),
  ]);

  const prevLeaderboard = await kv.get<WithMeta<DataLeaderboard>>(
    KV_KEY_API_LEADERBOARD_PREV,
  );
  const prevLbNorm = Object.groupBy(
    prevLeaderboard.value?.users ?? [],
    (it) => it.uuid,
  );
  const rankChanges = leaderboard.users.map((_) =>
    prevLbNorm[_.uuid]?.at(0)?.eloRank! - _.eloRank! || 0
  );

  const streams = await fetchStreams(twitchToken!.access_token, {
    // FIXME: Union types not working correctly without using ... TS bug?
    userLogins: [...leaderboard.users]
      .filter((_) => _.connections.twitch)
      .map((_) => _.connections.twitch.name),
  });

  return {
    leaderboard,
    streams: Object.groupBy(streams, (_) => _.user_name),
    rankChanges,
    prevLeaderboardUpdatedAt: prevLeaderboard.value?._updatedAt,
  };
}
