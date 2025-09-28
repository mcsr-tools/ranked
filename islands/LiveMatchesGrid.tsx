import { useComputed, useSignal } from "@preact/signals";
import clsx from "clsx";
import { WithMeta } from "#/kv/meta.ts";
import { findRank, Rank } from "#/mcsrranked/ranks.ts";
import { DataLive, ObjectUserProfile } from "#/mcsrranked/types.ts";
import { API_CACHE_MS_LIVE_MATCHES } from "#/mcsrranked/constants.ts";
import { channelFromURL } from "#/twitch/helpers.ts";
import { isNumber } from "#/lib/filter.ts";
import { RankImage } from "#/components/ui/mod.ts";
import { RelativeTime } from "./RelativeTime.tsx";
import { LastUpdated } from "./LastUpdated.tsx";

export function LiveMatchesGrid(props: {
  data: WithMeta<DataLive>;
  ranks: Rank[];
  top150Filterable?: boolean;
  basePath: string;
}) {
  const now = useSignal(Date.now());

  const filteredRank = useSignal<null | Rank>(null);
  const filteredTop150 = useSignal(false);

  const liveMatches = useComputed(() =>
    props.data.liveMatches
      .filter((match) =>
        filteredRank.value !== null
          ? filteredRank.value === findRank(
            Math.max(
              ...match.players
                .map((player) => player.eloRate)
                .filter(isNumber),
            ),
          )
          : true
      ).filter((match) =>
        filteredTop150.value
          ? match.players
            .map((player) => player.eloRank)
            .filter(isNumber)
            .find((rank) => rank <= 150)
          : true
      )
  );
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-top gap-2 mt-4">
        <div className="flex gap-1 items-center flex-wrap">
          {props.ranks && (
            <FilterRanks
              ranks={props.ranks}
              value={filteredRank.value}
              basePath={props.basePath}
              onChange={(rank) => {
                filteredTop150.value = false;
                filteredRank.value = filteredRank.peek() === rank ? null : rank;
              }}
            />
          )}
          {props.top150Filterable &&
            (
              <FilterTop150
                value={filteredTop150.value}
                onChange={(value) => {
                  filteredRank.value = null;
                  filteredTop150.value = value;
                }}
              />
            )}
          {liveMatches.value.length > 0 &&
            (
              <a
                className="btn btn-sm bg-twitch text-black"
                href={`https://multitwitch.tv/${
                  liveMatches.value.flatMap((match) =>
                    Object.values(match.data).map((data) => data.liveUrl)
                      .filter((
                        url,
                      ): url is string => !!url).map(channelFromURL)
                  ).join("/")
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
              </a>
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
  return (
    <div className="w-full sm:w-auto">
      <article className="card bg-neutral shadow-sm w-full sm:w-auto">
        <div className="relative card-body">
          <div className="flex flex-col justify-center items-center gap-1">
            {(props.match.players[0].eloRate ||
              props.match.players[1].eloRate) &&
              (
                <RankImage
                  className="size-7"
                  rank={findRank(
                    Math.max(
                      ...props.match.players.map((player) => player.eloRate)
                        .filter(isNumber),
                    ),
                  )}
                  basePath={props.basePath}
                  data-fresh-disable-lock
                />
              )}
            <p className="text-xs text-neutral-300">
              Started{" "}
              <RelativeTime
                date={props.now -
                  (props.now - props.liveDataLastUpdatedAt +
                    props.match.currentTime)}
              />
            </p>
          </div>
          <div className="w-full mt-2.5">
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
    <div className="join">
      {props.ranks.map((rank) => (
        <button
          className={clsx(
            "btn btn-sm btn-neutral join-item",
            props.value === rank && "btn-active",
          )}
          type="button"
          onClick={() => props.onChange(rank)}
        >
          <RankImage
            basePath={props.basePath}
            className={clsx(
              "size-5",
              props.value !== rank && "grayscale-50",
            )}
            rank={rank}
            data-fresh-disable-lock
          />
        </button>
      ))}
    </div>
  );
}

function FilterTop150(props: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      className={clsx(
        "btn btn-sm btn-neutral",
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
  const p1 = props.match.data[props.match.players[0].uuid];
  const p2 = props.match.data[props.match.players[1].uuid];

  if (p1.timeline?.type !== p2.timeline?.type) {
    return <span className="text-error italic text-lg">GAPPED</span>;
  }

  if (!p1.timeline || !p2.timeline) {
    return <span className="text-info italic text-lg">NEW</span>;
  }

  let diff = Math.abs(p1.timeline.time - p2.timeline.time);
  if (p1.timeline.time < p2.timeline.time) {
    diff = -diff;
  }

  return (
    <>
      {p1.timeline && p2.timeline && diff &&
        (
          <span>
            <span
              className={clsx(
                "text-lg",
                diff < 0 ? "text-success" : "text-warning",
              )}
            >
              {diff < 0 ? "-" : "+"}
              {(Math.abs(diff) / 1000).toFixed(1)}s
            </span>
          </span>
        )}
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
          type={props.timeline?.type || "overworld"}
        />
        <img
          className="size-[100px] image-pixelated"
          src={`https://minotar.net/bust/${props.user.nickname}/100`}
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

function TimelineImage(props: {
  className?: string;
  basePath: string;
  type: string;
}) {
  const lut: Record<string, [number, number]> = {
    "overworld": [1, 1],
    "story.enter_the_nether": [2, 3],
    "nether.find_bastion": [3, 3],
    "nether.find_fortress": [4, 3],
    "projectelo.timeline.blind_travel": [1, 4],
    "story.follow_ender_eye": [2, 4],
    "story.enter_the_end": [3, 4],
  };

  const [x, y] = lut[props.type] ?? [1, 1];
  const size = 16;
  const scale = 2.125;

  return (
    <span
      className={clsx("inline-block indicator-item", props.className)}
      style={{
        width: size * scale,
        height: size * scale,
        backgroundImage: `url(${props.basePath}/structure-icons.png)`,
        backgroundSize: 64 * scale,
        imageRendering: "pixelated",
        backgroundPositionX: `right ${x * 16 * scale}px`,
        backgroundPositionY: `bottom ${y * 16 * scale}px`,
      }}
      data-timeline={props.type}
    />
  );
}
