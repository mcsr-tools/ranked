import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import clsx from "clsx";
import { WithMeta } from "#/kv/meta.ts";
import { findRank, isRank, Rank } from "#/mcsrranked/ranks.ts";
import { DataLive, ObjectUserProfile } from "#/mcsrranked/types.ts";
import { API_CACHE_MS_LIVE_MATCHES } from "#/mcsrranked/constants.ts";
import { channelFromURL } from "#/twitch/helpers.ts";
import { isInteger, isNotNullable } from "#/lib/filter.ts";
import { RankImage } from "#/components/ui/RankImage.tsx";
import { dfAutoFormat } from "#/lib/time.ts";
import { RelativeTime } from "./RelativeTime.tsx";
import { LastUpdated } from "./LastUpdated.tsx";

export function LiveMatchesGrid(props: {
  data: WithMeta<DataLive>;
  ranks: Rank[];
  top150Filterable?: boolean;
  basePath: string;
  searchParams: Record<string, string>;
}) {
  const now = useSignal(Date.now());

  const filter = useSignal<
    | { kind: "rank"; rank: Rank }
    | { kind: "top-150" }
    | null
  >((() => {
    const filter = props.searchParams["filter"];
    switch (filter) {
      case "rank": {
        const rank = props.searchParams["rank"];
        if (!isRank(rank) || !props.ranks.includes(rank)) break;
        return { kind: filter, rank };
      }
      case "top-150": {
        if (!props.top150Filterable) break;
        return { kind: filter };
      }
    }
    return null;
  })());

  const liveMatches = useComputed(() =>
    props.data.liveMatches
      .filter((match) =>
        filter.value?.kind === "rank"
          ? filter.value.rank === findRank(
            Math.max(
              ...match.players
                .map((player) => player.eloRate)
                .filter(isInteger),
            ),
          )
          : true
      ).filter((match) =>
        filter.value?.kind === "top-150"
          ? match.players
            .map((player) => player.eloRank)
            .filter(isInteger)
            .find((rank) => rank <= 150)
          : true
      )
      .sort((a, b) => {
        function furthestTimeline(match: typeof a) {
          const timelines = Object.values(match.data)
            .map((it) => it.timeline?.type)
            .filter(isNotNullable)
            .filter((s): s is keyof typeof TIMELINES => s in TIMELINES)
            .map((t) => TIMELINES[t]);
          if (!timelines.length) {
            return 0;
          }
          return Math.max(...timelines.map((t) => t.ord));
        }
        const t1 = furthestTimeline(a);
        const t2 = furthestTimeline(b);
        if (t1 === t2) {
          return a.currentTime - b.currentTime;
        }
        return t1 - t2;
      })
  );

  useSignalEffect(() => {
    const params = new URLSearchParams(globalThis.window.location.search);

    params.delete("rank");
    params.delete("filter");

    if (filter.value) {
      params.set("filter", encodeURIComponent(filter.value.kind));
      if (filter.value.kind === "rank") {
        params.set("rank", encodeURIComponent(filter.value.rank));
      }
    }

    const url = new URL(globalThis.window.location.href);
    url.search = params.toString();

    globalThis.history.replaceState(null, "", url);
  });

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-top gap-2 mt-4">
        <div className="flex gap-1 items-center flex-wrap">
          <div className="join">
            {props.ranks.length > 0 && (
              <FilterRanks
                ranks={props.ranks}
                value={filter.value?.kind === "rank" ? filter.value.rank : null}
                basePath={props.basePath}
                onChange={(rank) => {
                  if (
                    filter.value?.kind === "rank" && filter.value.rank === rank
                  ) {
                    filter.value = null;
                  } else {
                    filter.value = {
                      kind: "rank",
                      rank,
                    };
                  }
                }}
              />
            )}
            {props.top150Filterable &&
              (
                <FilterTop150
                  value={filter.value?.kind === "top-150"}
                  onChange={(value) => {
                    if (value) {
                      filter.value = {
                        kind: "top-150",
                      };
                    } else {
                      filter.value = null;
                    }
                  }}
                />
              )}
          </div>
          {liveMatches.value.length > 0 &&
            (
              <MultitwitchLink
                players={liveMatches.value
                  .flatMap((match) =>
                    match.players.map((player) => ({
                      player,
                      liveUrl: match.data[player.uuid].liveUrl,
                    }))
                  )
                  .filter((it): it is typeof it & { liveUrl: string } =>
                    isNotNullable(it.liveUrl)
                  )
                  .map(({ player, liveUrl }) => ({
                    twitchChannel: channelFromURL(liveUrl),
                    mcNickname: player.nickname,
                  }))}
              />
            )}
        </div>
        {props.data._updatedAt && !!props.data.liveMatches.length && (
          <LastUpdated
            updatedAt={props.data._updatedAt}
            refreshBtnMsThreshold={API_CACHE_MS_LIVE_MATCHES}
          />
        )}
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mt-2 w-full">
        {liveMatches.value.map((match) => (
          <Match
            key={match.players[0].uuid}
            match={match}
            now={now.value}
            liveDataLastUpdatedAt={props.data._updatedAt}
            basePath={props.basePath}
          />
        ))}
      </div>
    </>
  );
}

function Match(props: {
  match: DataLive["liveMatches"][0];
  now: number;
  liveDataLastUpdatedAt: number;
  basePath: string;
}) {
  const rank = findRank(
    Math.max(
      ...props.match.players
        .map((player) => player.eloRate)
        .filter(isInteger),
    ),
  );

  const timeline = useTimeline(props.match);

  return (
    <div className="w-full sm:w-auto">
      <article className="card bg-neutral shadow-sm w-full sm:w-auto">
        <div
          className={clsx(
            `relative card-body rounded-2xl`,
            timeline.kind === "DIFF"
              ? timeline.diff <= 0
                ? "from-success/15 hover:via-50% via-30% via-neutral bg-linear-to-r"
                : "from-warning/15 hover:via-50% via-30% via-neutral bg-linear-to-r"
              : null,
            timeline.kind === "GAPPED"
              ? timeline.gapped
                ? "from-error/15 hover:via-50% via-30% via-neutral bg-linear-to-r"
                : "from-error/15 hover:via-50% via-30% via-neutral bg-linear-to-l"
              : null,
          )}
        >
          <div className="flex justify-center items-center content-between gap-1">
            <div class="flex items-center">
              {rank
                ? (
                  <RankImage
                    className="size-7"
                    rank={rank}
                    basePath={props.basePath}
                    data-fresh-disable-lock
                  />
                )
                : (
                  <span className="h-7 text-center font-ranked text-lg">
                    ???
                  </span>
                )}
            </div>
            <p class="font-mono text-base-content flex flex-col items-end text-sm">
              <RelativeTime date={props.liveDataLastUpdatedAt}>
                {(ms) => (
                  <span>RTA {dfAutoFormat(props.match.currentTime + ms)}</span>
                )}
              </RelativeTime>
              <span class="text-neutral-400">
                API {dfAutoFormat(props.match.currentTime)}
              </span>
            </p>
          </div>
          <div className="w-full mt-4">
            <div className="flex">
              <Bust
                basePath={props.basePath}
                user={props.match.players[0]}
                live={props.match.data[props.match.players[0].uuid].liveUrl}
                timeline={props.match.data[props.match.players[0].uuid]
                  .timeline}
                align="left"
              />
              <Divider match={props.match} />
              <Bust
                basePath={props.basePath}
                user={props.match.players[1]}
                live={props.match.data[props.match.players[1].uuid].liveUrl}
                timeline={props.match.data[props.match.players[1].uuid]
                  .timeline}
                align="right"
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function FilterRanks(props: {
  ranks: Rank[];
  value: Rank | null;
  basePath: string;
  onChange: (rank: Rank) => void;
}) {
  return (
    <>
      {props.ranks.map((rank) => (
        <button
          className={clsx(
            "btn btn-sm btn-soft join-item",
            props.value === rank && "btn-active",
          )}
          type="button"
          onClick={() => props.onChange(rank)}
        >
          <RankImage
            basePath={props.basePath}
            className="size-5"
            rank={rank}
            data-fresh-disable-lock
          />
        </button>
      ))}
    </>
  );
}

function FilterTop150(props: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      className={clsx(
        "btn btn-sm btn-soft join-item",
        props.value && "btn-active",
      )}
      type="button"
      onClick={() => props.onChange(!props.value)}
    >
      Top 150
    </button>
  );
}

function Divider(props: {
  match: DataLive["liveMatches"][0];
}) {
  return (
    <div className="divider divider-horizontal grow font-minecraft">
      <DividerTimeDelta match={props.match} />
      <a
        className="link link-hover text-ranked"
        href={`https://mcsrranked.com/stats/${
          props.match.players[0].nickname
        }/vs/${props.match.players[1].nickname}`}
        target="_blank"
      >
        VS
      </a>
      {props.match.data[props.match.players[0].uuid].liveUrl &&
        props.match.data[props.match.players[1].uuid].liveUrl &&
        (
          <a
            className="link link-hover text-twitch animate-pulse"
            href={`https://multitwitch.tv/${
              channelFromURL(
                props.match.data[props.match.players[0].uuid].liveUrl!,
              )
            }/${
              channelFromURL(
                props.match.data[props.match.players[1].uuid].liveUrl!,
              )
            }`}
            target="_blank"
          >
            Multi
          </a>
        )}
    </div>
  );
}

function DividerTimeDelta(props: {
  match: DataLive["liveMatches"][0];
}) {
  const timeline = useTimeline(props.match);

  if (timeline.kind === "GAPPED") {
    return <span className="text-error italic text-lg">GAPPED</span>;
  }

  if (timeline.kind === "NEW") {
    return <span className="text-info italic text-lg">NEW</span>;
  }

  return (
    <>
      <span>
        <span
          className={clsx(
            "text-lg",
            timeline.diff < 0 ? "text-success" : "text-warning",
          )}
        >
          {timeline.diff < 0 ? "-" : "+"}
          {(Math.abs(timeline.diff) / 1000).toFixed(1)}s
        </span>
      </span>
    </>
  );
}

function Bust(
  props: {
    basePath: string;
    user: ObjectUserProfile;
    timeline: DataLive["liveMatches"][0]["data"][""]["timeline"];
    live?: string;
    align: "left" | "right";
  },
) {
  return (
    <div className="space-y-1 shrink w-32">
      <div
        className={clsx(
          "indicator block",
          props.align === "right" && "ml-auto",
        )}
      >
        <TimelineImage
          className={clsx(
            "indicator-item badge badge-ghost",
            props.align === "left"
              ? "indicator-end indicator-middle"
              : "indicator-middle indicator-start",
          )}
          basePath={props.basePath}
          timeline={props.timeline?.type || "overworld"}
        />
        <img
          className={clsx(
            "size-[100px]",
            props.align === "right" && "-scale-x-100",
          )}
          src={`https://nmsr.nickac.dev/bust/${props.user.nickname}`}
          alt={props.user.nickname}
        />
      </div>
      <div
        className={clsx(
          "flex items-center gap-1.5",
          props.align === "right" && "flex-row-reverse",
        )}
      >
        {props.user.country &&
          (
            <img
              className="size-5"
              src={`https://flagsapi.com/${props.user.country.toUpperCase()}/flat/64.png`}
            />
          )}
        <div className="flex gap-1 items-center truncate">
          {props.live
            ? (
              <>
                <span className="status status-error animate-pulse"></span>
                <a
                  className="font-minecraft link link-hover text-twitch truncate"
                  href={props.live}
                  target="_blank"
                >
                  {props.user.nickname}
                </a>
              </>
            )
            : (
              <p className="font-minecraft">
                {props.user.nickname}
              </p>
            )}
        </div>
      </div>
      <div className={clsx(props.align === "right" && "text-right")}>
        <a
          class="link link-hover text-ranked font-ranked text-lg leading-0"
          href={`https://mcsrranked.com/stats/${props.user.nickname}`}
          target="_blank"
        >
          {props.user.eloRank && props.user.eloRate
            ? `#${props.user.eloRank} - ${props.user.eloRate}`
            : "N/A"}
        </a>
      </div>
    </div>
  );
}

const TIMELINES = {
  "overworld": {
    ord: 10,
    spriteCoords: [1, 1],
  },
  "story.enter_the_nether": {
    ord: 20,
    spriteCoords: [2, 3],
  },
  "nether.find_bastion": {
    ord: 30,
    spriteCoords: [3, 3],
  },
  "nether.find_fortress": {
    ord: 40,
    spriteCoords: [4, 3],
  },
  "projectelo.timeline.blind_travel": {
    ord: 50,
    spriteCoords: [1, 4],
  },
  "story.follow_ender_eye": {
    ord: 60,
    spriteCoords: [2, 4],
  },
  "story.enter_the_end": {
    ord: 70,
    spriteCoords: [3, 4],
  },
} as const;

function TimelineImage(props: {
  className?: string;
  basePath: string;
  timeline: string;
}) {
  const SIZE = 16;
  const SCALE = 2.125;

  if (!(props.timeline in TIMELINES)) {
    return null;
  }

  const { spriteCoords } = TIMELINES[props.timeline as keyof typeof TIMELINES];

  const bpX = spriteCoords[0] * SIZE * SCALE;
  const bpY = spriteCoords[1] * SIZE * SCALE;

  return (
    <span
      className={clsx("inline-block indicator-item", props.className)}
      style={{
        width: SIZE * SCALE,
        height: SIZE * SCALE,
        backgroundImage: `url(${props.basePath}/structure-icons.png)`,
        backgroundSize: 64 * SCALE,
        imageRendering: "pixelated",
        backgroundPosition: `right ${bpX}px bottom ${bpY}px`,
      }}
    />
  );
}

function useTimeline(match: DataLive["liveMatches"][0]) {
  const p1 = match.data[match.players[0].uuid];
  const p2 = match.data[match.players[1].uuid];

  if (!p1.timeline || !p2.timeline) {
    return { kind: "NEW" } as const;
  }

  if (p1.timeline?.type !== p2.timeline?.type) {
    return {
      kind: "GAPPED",
      gapped: !cmpTimeline(p1.timeline.type, p2.timeline.type),
    } as const;
  }

  let diff = Math.abs(p1.timeline.time - p2.timeline.time);
  if (p1.timeline.time < p2.timeline.time) {
    diff = -diff;
  }

  return { kind: "DIFF", diff } as const;
}

function cmpTimeline(t1: string, t2: string) {
  return TIMELINES[t1 as keyof typeof TIMELINES].ord >
    TIMELINES[t2 as keyof typeof TIMELINES].ord;
}

function MultitwitchLink(props: {
  players: {
    twitchChannel: string;
    mcNickname: string;
  }[];
}) {
  const LENGTH = 3;

  return (
    <a
      className="btn btn-sm bg-twitch text-black"
      href={`https://multitwitch.tv/${
        props.players.map((player) => player.twitchChannel).join("/")
      }`}
      target="_blank"
    >
      <img
        className="fill-twitch size-5"
        src="brands/twitch.svg"
        alt="Twitch"
        data-fresh-disable-lock
      />
      multitwitch
      <div className="avatar-group -space-x-3">
        {props.players
          .slice(0, LENGTH)
          .map(({ mcNickname }) => (
            <div className="avatar border-2" key={mcNickname}>
              <div className="h-5">
                <img
                  className="image-pixel-art"
                  src={`https://minotar.net/avatar/${mcNickname}/40`}
                  alt={mcNickname}
                />
              </div>
            </div>
          ))}
        {props.players.length > LENGTH &&
          (
            <div className="avatar avatar-placeholder border-2">
              <div className="bg-neutral text-neutral-content h-5 text-[9px]">
                <span>
                  +{props.players.length - LENGTH}
                </span>
              </div>
            </div>
          )}
      </div>
    </a>
  );
}
