/** https://wiki.mcsrranked.com/gameplay/elo_and_ranks#ranks */
export const RANKS = [
  "Coal",
  "Iron",
  "Gold",
  "Emerald",
  "Diamond",
  "Netherite",
] as const;

export type Rank = typeof RANKS[number];

/** https://wiki.mcsrranked.com/gameplay/elo_and_ranks#ranks */
const RANK_ELO_MAX = {
  Coal: 599,
  Iron: 899,
  Gold: 1199,
  Emerald: 1499,
  Diamond: 1999,
  Netherite: Infinity,
} satisfies Record<Rank, number>;

export function findRank(elo: number): Rank | null {
  if (elo < 0) {
    return null;
  }

  let min = 0;
  for (const rank of RANKS) {
    if (elo > min && elo <= RANK_ELO_MAX[rank]) {
      return rank;
    }
    min = RANK_ELO_MAX[rank];
  }

  throw new Error("Unreachable");
}
