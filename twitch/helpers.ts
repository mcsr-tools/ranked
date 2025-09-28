export function channelFromURL(url: string) {
  return url.split("twitch.tv/")[1];
}
