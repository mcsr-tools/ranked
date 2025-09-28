import { IconInfo } from "../components/ui/icons.tsx";
import { RelativeTime } from "./RelativeTime.tsx";

export function LastUpdated(props: {
  updatedAt: number;
  refreshBtnMsThreshold: number;
}) {
  return (
    <div className="flex shrink-0">
      <div className="bg-base-200 text-base-content text-xs px-4 py-1.5 rounded-lg flex gap-1.5 items-center h-8">
        <IconInfo />
        <span>
          <span className="font-semibold">Last updated</span>:{" "}
        </span>
        <RelativeTime date={props.updatedAt}>
          {(msPassed, formatted) => (
            <>
              {formatted}
              {msPassed > props.refreshBtnMsThreshold &&
                (
                  <button
                    className="btn btn-xs btn-info btn-soft"
                    type="button"
                    onClick={() => globalThis.window.location.reload()}
                  >
                    refresh this page
                  </button>
                )}
            </>
          )}
        </RelativeTime>
      </div>
    </div>
  );
}
