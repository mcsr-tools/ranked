import { getLeaderboardWithStreams } from "#/mcsrranked/mod.ts";
import { Leaderboard } from "#/components/mod.ts";

export default async function LeaderboardPage() {
  const data = await getLeaderboardWithStreams();
  return <Leaderboard {...data} />;
}
