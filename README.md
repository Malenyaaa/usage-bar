# usage-bar

A small Claude Code mod that keeps your usage in view. It pins one line under the prompt showing how much of your 5-hour and weekly limits is used, when each one resets, and how full the current context window is:

```
5h ██░░░░░░░░ 23% · resets in 2h 30m   |   Week ████░░░░░░ 41% · resets Mon 09:00   |   Context 37%
```

Once the 5-hour window is at 50% or more, the line also says whether it lasts until the reset at your current pace, or when it would hit 100%. The pace is that of the last half hour, from 5 minutes of readings on:

```
5h ███████░░░ 65% · resets in 2h 20m · full at this pace 12:45
```

The figures come from Claude Code itself: every API response carries the account's rate-limit readings, the same ones `/usage` shows. The mod only formats them. It updates after each turn and whenever a limit moves by a whole percent, and the countdown ticks on once a minute in between. Right after a session starts there is no reading yet, so the line says so until the first response arrives.

Limits only appear on a Claude subscription; with an API key the line shows the context alone.

## Language

The line comes in English (default) or German. You pick it while installing, and can change it later under `/config` (usage → Language / Sprache): `en` or `de`.

## Install

At the prompt of a terminal session:

```
/plugin install usage --marketplace Malenyaaa/usage-bar
```

From a shell:

```
claude plugin install usage --marketplace Malenyaaa/usage-bar
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `Malenyaaa/usage-bar`, then Add plugin.

Until version 0.2 the plugin was called `usage-bar`. If you have that installed, remove it (`/plugin uninstall usage-bar`) and install `usage` as above.

---

## Deutsch

Eine kleine Erweiterung für Claude Code. Sie zeigt unter der Eingabe in einer Zeile, wie viel vom 5-Stunden- und vom Wochenkontingent verbraucht ist, wann es zurückgesetzt wird und wie voll das Kontextfenster ist:

```
5 Std ██░░░░░░░░ 23% · neu in 2 Std 30 min   |   Woche ████░░░░░░ 41% · neu Mo 09:00   |   Kontext 37%
```

Ab 50 % im 5-Stunden-Kontingent steht zusätzlich da, ob es beim aktuellen Tempo bis zum Zurücksetzen reicht oder wann es voll wäre. Gemessen wird das Tempo der letzten halben Stunde, ab 5 Minuten Messdaten:

```
5 Std ███████░░░ 65% · neu in 2 Std 20 min · bei dem Tempo voll 12:45
```

Die Zahlen liefert Claude Code selbst mit jeder Antwort, dieselben wie bei `/usage`. Die Erweiterung zählt nichts selbst, sie bringt die Werte nur in Form. Direkt nach dem Start einer Sitzung gibt es noch keine Werte, die kommen mit der ersten Antwort. Kontingente gibt es nur mit einem Claude-Abo, mit einem API-Schlüssel erscheint nur der Kontext.

**Sprache:** Beim Installieren `de` wählen, oder später unter `/config` (usage → Language / Sprache) umstellen.

**Installieren:** in Claude Code eingeben (bis Version 0.2 hieß das Plugin `usage-bar`; das alte vorher mit `/plugin uninstall usage-bar` entfernen)

```
/plugin install usage --marketplace Malenyaaa/usage-bar
```

## License

MIT, see [LICENSE](LICENSE).
