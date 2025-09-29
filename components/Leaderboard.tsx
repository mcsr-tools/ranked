import clsx from "clsx";
import dayjs from "dayjs";
import {
  API_CACHE_MS_LEADERBOARD,
  DataUserData,
  LEADERBOARD_SIZE,
  ObjectConnection,
  PopulatedLeaderboard,
} from "#/mcsrranked/mod.ts";
import { Stream } from "#/twitch/mod.ts";
import { WithMeta } from "#/kv/meta.ts";
import { rtfAutoUnitFormat } from "#/lib/time.ts";
import { LastUpdated } from "#/islands/LastUpdated.tsx";

export function Leaderboard(props: {
  leaderboard: WithMeta<PopulatedLeaderboard>;
  streams: Partial<Record<string, Stream[]>>;
  rankChanges: number[];
  prevLeaderboardUpdatedAt?: number;
}) {
  return (
    <div>
      <h2 className="text-3xl">
        Top {LEADERBOARD_SIZE}{" "}
        <a
          className="link link-hover text-ranked font-ranked leading-0 uppercase text-4xl"
          href="https://mcsrranked.com/stats"
          target="_blank"
        >
          Leaderboard
        </a>
      </h2>
      {props.prevLeaderboardUpdatedAt &&
        (
          <p className="text-sm">
            Rank changes{" "}
            <span className="badge badge-sm badge-ghost">
              <span className="text-success">
                +
              </span>/<span className="text-error">-</span>
            </span>{" "}
            are compared with leaderboard snapshotted from{" "}
            {rtfAutoUnitFormat(props.prevLeaderboardUpdatedAt - Date.now())}.
          </p>
        )}
      <div className="mt-4">
        <LastUpdated
          updatedAt={props.leaderboard._updatedAt}
          refreshBtnMsThreshold={API_CACHE_MS_LEADERBOARD}
        />
      </div>
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ul className="list bg-neutral rounded-box shadow-sm">
          {props.leaderboard.users.slice(0, LEADERBOARD_SIZE / 2)
            .map((user, i) => (
              <ListItem
                key={user.uuid}
                user={user}
                live={props.streams[user.connections.twitch?.name] &&
                  {
                    url: `https://twitch.tv/${user.connections.twitch.name}`,
                    title: props.streams[user.connections.twitch.name]?.at(0)
                      ?.title ?? "N/A",
                  }}
                rankChange={props.rankChanges[i]}
              />
            ))}
        </ul>
        <ul className="list bg-neutral rounded-box shadow-sm">
          {props.leaderboard.users.slice(LEADERBOARD_SIZE / 2, LEADERBOARD_SIZE)
            .map((user, i) => (
              <ListItem
                key={user.uuid}
                user={user}
                live={props.streams[user.connections.twitch?.name] &&
                  {
                    url: `https://twitch.tv/${user.connections.twitch.name}`,
                    title: props.streams[user.connections.twitch.name]?.at(0)
                      ?.title ?? "N/A",
                  }}
                rankChange={props.rankChanges[LEADERBOARD_SIZE / 2 + i]}
              />
            ))}
        </ul>
      </div>
    </div>
  );
}

function ListItem(
  props: {
    user: DataUserData;
    live?: {
      url: string;
      title: string;
    };
    rankChange: number;
  },
) {
  return (
    <li key={props.user.uuid} className="list-row px-6 py-5">
      <div
        className={clsx(
          "avatar size-10",
          props.rankChange !== 0 && "indicator",
        )}
      >
        <img
          className="image-pixel-art"
          src={`https://minotar.net/avatar/${props.user.nickname}/40`}
          alt={props.user.nickname}
        />
        {props.rankChange !== 0 &&
          (
            <span
              className={clsx(
                "indicator-item indicator-start badge badge-sm badge-soft",
                Math.sign(props.rankChange) > 0
                  ? "badge-success"
                  : "badge-error",
              )}
            >
              {Math.sign(props.rankChange) > 0 ? "+" : "-"}
              {Math.abs(props.rankChange)}
            </span>
          )}
      </div>
      <div className="overflow-hidden">
        <div className="text-neutral-content font-bold flex items-center gap-1.5">
          {props.live
            ? (
              <>
                <span className="status status-error animate-pulse"></span>
                <a
                  className="link link-hover font-minecraft text-twitch shrink-0"
                  href={props.live.url}
                  target="_blank"
                >
                  {props.user.nickname}
                </a>{" "}
                &mdash;{" "}
                <span className="truncate" title={props.live.title}>
                  {props.live.title}
                </span>
              </>
            )
            : (
              <p className="font-minecraft">
                {props.user.nickname}
              </p>
            )}
        </div>
        <div className="text-xs text-neutral-content">
          <a
            class="link link-hover text-ranked font-ranked text-lg leading-0 w-full inline-block md:w-auto md:inline mr-1.5"
            href={`https://mcsrranked.com/stats/${props.user.nickname}`}
            target="_blank"
          >
            {props.user.eloRank !== null && props.user.eloRate != null
              ? `#${props.user.eloRank} - ${props.user.eloRate}`
              : "N/A"}
          </a>
          <span
            className={clsx(
              dayjs(
                  props.user.timestamp.lastRanked * 1000,
                ).isBefore(
                  dayjs().subtract(3, "days"),
                )
                ? "text-warning font-semibold"
                : "text-neutral-400",
            )}
          >
            Played {dayjs(props.user.timestamp.lastRanked * 1000).fromNow()}
          </span>{" "}
          {dayjs(
            props.user.timestamp.lastRanked * 1000,
          ).isBefore(
            dayjs().subtract(3, "days"),
          ) && props.user.timestamp.nextDecay && <span>Decaying</span> &&
            (
              <span className="text-neutral-400">
                elo decay{" "}
                {dayjs(props.user.timestamp.nextDecay * 1000).fromNow()}
              </span>
            )}
        </div>
      </div>
      <Connections connections={props.user.connections} />
    </li>
  );
}

function Connections(props: {
  connections: Record<string, ObjectConnection>;
}) {
  return (
    <>
      {props.connections.twitch &&
        (
          <a
            className="btn btn-square btn-ghost"
            href={`https://twitch.tv/${props.connections.twitch.name}`}
            target="_blank"
          >
            <img
              className="fill-twitch size-6"
              src="brands/twitch.svg"
              alt="Twitch"
              data-fresh-disable-lock
            />
          </a>
        )}
      {props.connections.youtube &&
        (
          <a
            className="btn btn-square btn-ghost"
            href={`https://www.youtube.com/channel/${props.connections.youtube.id}`}
            target="_blank"
          >
            <img
              className="fill-youtube size-6"
              src="brands/youtube.svg"
              alt="Youtube"
              data-fresh-disable-lock
            />
          </a>
        )}
      {props.connections.discord &&
        (
          <a
            className="btn btn-square btn-ghost"
            href={`https://discordapp.com/users/${props.connections.discord.id}`}
            target="_blank"
          >
            <img
              className="fill-discord size-6"
              src="brands/discord.svg"
              alt="Youtube"
              data-fresh-disable-lock
            />
          </a>
        )}
    </>
  );
}
