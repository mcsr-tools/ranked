import dayjs from "dayjs";
import { DataUserData } from "#/mcsrranked/mod.ts";

export function Footer(props: { user: DataUserData }) {
  return (
    <footer className="mt-10 footer sm:footer-horizontal bg-base-200 text-base-content items-center p-4 rounded-lg">
      <aside className="grid-flow-col items-center">
        <img
          src="/clock.webp"
          alt="Clock"
          className="size-12 image-pixel-art"
          data-fresh-disable-lock
        />
        <p>
          <span>
            Crafted by{" "}
            <span className="font-minecraft font-bold">
              {props.user.nickname}
            </span>{" "}
            <a
              class="link link-hover text-ranked font-ranked text-lg leading-0"
              href={`https://mcsrranked.com/stats/${props.user.nickname}`}
              target="_blank"
            >
              {props.user.eloRank && props.user.eloRate
                ? `#${props.user.eloRank} - ${props.user.eloRate}`
                : "N/A"}
            </a>{" "}
            |{" "}
            <span>
              Online {dayjs(props.user.timestamp.lastOnline * 1000).fromNow()}
            </span>{" "}
            |{" "}
            <span>
              PB{" "}
              {dayjs.duration(props.user.statistics.total.bestTime.ranked, "ms")
                .format("mm:ss")}
            </span>
          </span>
          <br />
          <span className="text-xs">
            <a className="link link-hover text-primary" href="/">
              Ranked Watch
            </a>{" "}
            is <span className="font-bold">not</span> affiliated with{" "}
            <a
              className="link link-hover text-ranked font-ranked leading-0 text-lg uppercase"
              href="https://mcsrranked.com/"
              target="_blank"
            >
              MCSR Ranked
            </a>. All Trademarks referred to are the property of their
            respective owners.
          </span>
        </p>
      </aside>
    </footer>
  );
}
