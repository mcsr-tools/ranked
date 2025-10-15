import { DataLive, findRank } from "#/mcsrranked/mod.ts";
import { WithMeta } from "#/kv/mod.ts";
import { isInteger, isNotNullable } from "#/lib/filter.ts";
import { LiveMatchesGrid } from "#/islands/LiveMatchesGrid.tsx";

export function LiveMatches(
  props: {
    data: WithMeta<DataLive>;
    basePath: string;
    searchParams: Record<string, string | string[]>;
  },
) {
  const ranks = new Set(
    props.data.liveMatches
      .map((match) =>
        Math.max(
          ...match.players.map((player) => player.eloRate)
            .filter(isInteger),
        )
      )
      .filter(Number.isFinite)
      .sort((a, b) => b - a)
      .map(findRank)
      .filter(isNotNullable),
  );

  const top150Filterable = props.data.liveMatches
    .flatMap((match) =>
      match.players.map((player) => player.eloRank).filter(isInteger)
    )
    .find((rank) => rank <= 150) !== undefined;

  return (
    <div className="relative">
      <h2 className="text-3xl">Live Matches</h2>
      <p className="text-sm text-neutral-300">
        There are{" "}
        <span className="text-info">{props.data.players ?? 0} players</span>
        {" "}
        playing right now.
      </p>
      <LiveMatchesGrid
        data={props.data}
        ranks={[...ranks]}
        top150Filterable={top150Filterable}
        basePath={props.basePath}
        searchParams={props.searchParams}
      />
    </div>
  );
}
