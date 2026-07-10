---
description: Start/check/stop the Gaia Research localhost preview
argument-hint: "[start|status|logs|restart|stop|urls]"
---
Use the project-local `preview` skill to manage the Gaia Research localhost website preview.

User arguments: `${ARGUMENTS:-start}`

Load `.pi/skills/preview/SKILL.md` if needed, then run the matching helper command from the repository root:

```bash
.pi/skills/preview/scripts/preview.sh ${ARGUMENTS:-start}
```

Report the homepage URL, Context Diet URL, PID/log paths, and any errors concisely.
