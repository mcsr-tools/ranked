import { IS_BROWSER } from "$fresh/runtime.ts";
import { useComputed, useSignal, useSignalEffect } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";
import { rtfAutoUnitFormat } from "#/lib/time.ts";

export function RelativeTime(props: {
  date: number;
  children?: (msPassed: number, formatted: string) => JSX.Element;
}) {
  const clock = useSignal(Date.now());
  const msPassed = useComputed(() => Math.floor(clock.value - props.date));
  const formatted = useComputed(() => rtfAutoUnitFormat(-msPassed.value));

  useSignalEffect(() => {
    if (IS_BROWSER) {
      const id = setInterval(() => {
        clock.value = clock.peek() + 1e3;
      }, 1e3);
      return () => clearInterval(id);
    }
  });

  return (
    <>
      {props.children
        ? props.children(msPassed.value, formatted.value)
        : formatted.value}
    </>
  );
}
