[site]: https://mcsr.tools/ranked
[mc]: https://www.minecraft.net
[ms]: https://www.microsoft.com
[mcsrranked]: https://mcsrranked.com
[multitwitch]: https://www.multitwitch.tv
[deno]: deno.land
[fresh]: https://fresh.deno.dev
[ttv-api-ref]: https://dev.twitch.tv/docs/api/reference
[ttv-register-app]: https://dev.twitch.tv/docs/authentication/register-app

<p align="center">
  <a href="https://mcsr.tools/ranked">
    <img src="static/clock.webp" height="100">
    <h1 align="center"><b>Ranked Watch</b></h1>
  </a>
</p>

![GitHub](https://img.shields.io/github/license/mcsr-tools/ranked?style=flat-square)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/mcsr-tools/ranked?style=flat-square)
![GitHub Repo stars](https://img.shields.io/github/stars/mcsr-tools/ranked?style=social)

---

_**[Ranked Watch][site] is not affiliated with [Minecraft][mc], [Microsoft][ms] or [MCSR Ranked][mcsrranked]. All Trademarks referred to are the property of their respective owners.**_

---

Ranked Watch is your go-to MCSR Ranked fan site to see ongoing matches currently being streamed and more!

# Features

- View current live matches being streamed on Twitch
- Filter players based on rank (e.g gold, emerald, etc.) or leaderboard position (top 150)
- Play both perspectives with [multitwitch][multitwitch] for an ongoing match or all combined filtered matches
- See match timeline (a.k.a splits e.g. find bastion, blinded, etc.) time delta (+/-)
- View top players leaderboard with rank change delta based on some previous snapshot
- See if leaderboard players are streaming on Twitch (possibly doing something else than playing ranked)

# Development

Ranked Watch is built on top of [Fresh][fresh] so make sure that [Deno][deno] is installed on your system.

Due to use of [Twitch API][ttv-api-ref] client credentials are required to run the app. Click [here][ttv-register-app] to check the docs on how to register your app. Afterwards copy the ID and secret to `.env` file at the root of the project.

e.g.:

```
TWITCH_CLIENT_ID=<your-client-id>
TWITCH_CLIENT_SECRET=<your-client-secret>
```

---

Run the following command at the root of the project to run the app:

```
deno run start
```

Click on the URL outputted in your terminal to view the app locally.

## Linting and formatting

Run the following command at the root of the project to lint & format the code.

```
deno check && deno fmt
```

# Contributing

Bug reports and fixes are appreciated as well as ideas or discussions!

# License

MIT
