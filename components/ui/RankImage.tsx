import clsx from "clsx";
import { type ImgHTMLAttributes } from "preact";
import { type Rank } from "#/mcsrranked/ranks.ts";

export function RankImage(
  props: {
    basePath: string;
    rank: Rank;
  } & ImgHTMLAttributes,
) {
  const { rank, basePath, src, className, ...rest } = props;
  void src;
  return (
    <img
      className={clsx(className, "image-pixel-art")}
      src={`${basePath}/ranks/${props.rank.toLowerCase()}.webp`}
      alt={rank}
      {...rest}
    />
  );
}
