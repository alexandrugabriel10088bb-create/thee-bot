---
name: Discord copy button behavior
description: Discord message buttons cannot write directly to a user's clipboard.
---

Discord buttons do not have permission to copy text directly to a user's clipboard. The compatible pattern is a green button that responds privately with the exact text to copy.

**Why:** Discord controls the client UI and does not expose clipboard writes to bot interactions.

**How to apply:** For future bot features that ask for a copy button, use a button interaction followed by an ephemeral response containing the copyable value.