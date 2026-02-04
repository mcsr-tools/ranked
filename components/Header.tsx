import { GitHubCorner } from "#/components/ui/mod.ts";

export function Header() {
  return (
    <header>
      <GitHubCorner />
      <Menu />
      <div className="flex gap-2 items-center mt-4">
        <img
          src="/clock.webp"
          alt="Clock"
          className="size-12 image-pixel-art"
          data-fresh-disable-lock
        />
        <h1 className="text-4xl font-minecraft text-primary">
          <a href="/">Ranked Watch</a>
        </h1>
      </div>
      <p className="mt-0.5">
        Your go-to{" "}
        <a
          className="link link-hover text-ranked text-xl font-ranked uppercase leading-0"
          href="https://mcsrranked.com"
          target="_blank"
        >
          MCSR Ranked
        </a>{" "}
        fan site to see ongoing matches currently being streamed and more.
      </p>
    </header>
  );
}

function Menu() {
  return (
    <ul className="menu menu-horizontal bg-base-200 rounded-box text-sm">
      <li>
        <a href="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Home
        </a>
      </li>
      <li>
        <a href="/leaderboard">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Leaderboard
        </a>
      </li>
      <li>
        <a href="https://mcsr.tv" target="_blank">
          <img
            className="size-5"
            src="https://mcsr.tv/favicon-32x32.png"
            alt="MCSR TV logo"
          />
          <span className="flex items-start gap-1">
            <span className="font-minecraft">MCSR TV</span>
            <svg
              className="size-4.5"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 11V3h-8v2h4v2h-2v2h-2v2h-2v2H9v2h2v-2h2v-2h2V9h2V7h2v4h2zM11 5H3v16h16v-8h-2v6H5V7h6V5z"
                fill="currentColor"
              />
            </svg>
          </span>
        </a>
      </li>
    </ul>
  );
}
