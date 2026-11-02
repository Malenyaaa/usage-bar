# usage-bar

A small Claude Code mod that keeps your usage in view. It pins one line under the prompt showing how much of your 5-hour and weekly limits is used, when each one resets, and how full the current context window is:

```
5h ██░░░░░░░░ 23% · resets 14:30   |   Week ████░░░░░░ 41% · resets Mon 09:00   |   Context 37%
```

The figures come from Claude Code itself: every API response carries the account's rate-limit readings, the same ones `/usage` shows. The mod only formats them. It updates after each turn and whenever a limit moves by a whole percent. Right after a session starts there is no reading yet, so the line says so until the first response arrives.

Limits only appear on a Claude subscription; with an API key the line shows the context alone.

## Install

At the prompt of a terminal session:

```
/plugin install usage-bar --marketplace Malenyaaa/usage-bar
```

From a shell:

```
claude plugin install usage-bar --marketplace Malenyaaa/usage-bar
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `Malenyaaa/usage-bar`, then Add plugin.

## License

MIT, see [LICENSE](LICENSE).
