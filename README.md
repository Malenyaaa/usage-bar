# usage-bar

A small Claude Code mod that keeps your usage in view. It pins one line under the prompt showing how much of your 5-hour and weekly limits is used, when each one resets, and how full the current context window is:

```
5h ██░░░░░░░░ 23% · resets 14:30   |   Week ████░░░░░░ 41% · resets Mon 09:00   |   Context 37%
```

The figures come from Claude Code itself: every API response carries the account's rate-limit readings, the same ones `/usage` shows. The mod only formats them. It updates after each turn and whenever a limit moves by a whole percent. Right after a session starts there is no reading yet, so the line says so until the first response arrives.

Limits only appear on a Claude subscription; with an API key the line shows the context alone.

## Language

The line comes in English (default) or German. You pick it while installing, and can change it later under `/config` (usage-bar → Language / Sprache): `en` or `de`.

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

---

## Deutsch

Eine kleine Erweiterung für Claude Code. Sie zeigt unter der Eingabe in einer Zeile, wie viel vom 5-Stunden- und vom Wochenkontingent verbraucht ist, wann es zurückgesetzt wird und wie voll das Kontextfenster ist:

```
5 Std ██░░░░░░░░ 23% · neu 14:30   |   Woche ████░░░░░░ 41% · neu Mo 09:00   |   Kontext 37%
```

Die Zahlen liefert Claude Code selbst mit jeder Antwort, dieselben wie bei `/usage`. Die Erweiterung zählt nichts selbst, sie bringt die Werte nur in Form. Direkt nach dem Start einer Sitzung gibt es noch keine Werte, die kommen mit der ersten Antwort. Kontingente gibt es nur mit einem Claude-Abo, mit einem API-Schlüssel erscheint nur der Kontext.

**Sprache:** Beim Installieren `de` wählen, oder später unter `/config` (usage-bar → Language / Sprache) umstellen.

**Installieren:** in Claude Code eingeben

```
/plugin install usage-bar --marketplace Malenyaaa/usage-bar
```

## License

MIT, see [LICENSE](LICENSE).
