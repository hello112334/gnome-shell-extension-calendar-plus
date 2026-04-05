# Lessons

- Do not ship a "safe fallback" that silently disables a user-facing feature after a bug report. Preserve the feature or make the limitation explicit in the UI/setting behavior.
- For GNOME Shell extension work, verify whether the active session is reloading the current module or serving a cached copy before trusting runtime stack traces.
- On this Wayland setup, `gnome-extensions disable/enable` can leave GNOME Shell running an older extension module revision; after JS behavior changes, use a full logout to validate the new code path.
- When removing GNOME Shell `message-list` dividers, handle both the hidden original date-menu list and any detached replacement list, and override directional border rules directly instead of assuming generic `border-width` is sufficient.
- When a GNOME Shell visual artifact survives an explicit CSS override and reload, stop guessing and inspect the live actor tree from inside the extension before making another styling change.
- Clarify whether a reported "divider" is in the panel header button or inside the popup content before patching; Open Bar styles both layers independently.
- When a user says an artifact is on the left side inside the datetime block, treat it as a possible built-in `messages-indicator` or `clock-display-box` issue before assuming the seam is between adjacent panel buttons.
- Do not accept a CSS-only fix for split notifications if it leaves the detached menu backed by a new empty actor; verify the split menu still shows the live notification content before considering the change done.
- For rounded GNOME panel buttons, removing an inner border may still leave short corner strokes; flatten the touching inner corner radii as well when joining adjacent buttons.
- When joining Open Bar panel buttons, also account for the `button-container` wrapper padding; otherwise a visible gap can remain even after the inner border is removed.
- When a leftover datetime-block artifact scales one-for-one with notification count, treat it as the stock `DateMenu` `_messageList` still painting row structure; hide the subtree non-destructively instead of relying on width/opacity collapse alone.
