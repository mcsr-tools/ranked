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
const EloRank = {
  Coal: 599,
  Iron: 899,
  Gold: 1199,
  Emerald: 1499,
  Diamond: 1999,
  Netherite: Infinity,
} satisfies Record<Rank, number>;

export function findRank(elo: number) {
  let min = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (elo > min && elo <= EloRank[RANKS[i]]) {
      return RANKS[i];
    }
    min = EloRank[RANKS[i]];
  }
  throw new Error("Unreachable");
}
