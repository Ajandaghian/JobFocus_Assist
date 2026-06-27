# JobFocus Assist Agent Development Notes

## Scope

Build JobFocus Assist, a minimal Chrome extension that visually restyles LinkedIn job result cards based only on state already visible in LinkedIn's page.

Do not add job-data persistence, custom tracking, notes, CRM features, or application automation unless the user explicitly changes the scope. Storing extension preferences is allowed.

## Core Product Rule

LinkedIn is the source of truth. The extension should read visible page text/state and apply presentation changes only.

## Behavior

- Detect LinkedIn job result cards.
- If a card contains `Viewed`, apply a muted/disabled style.
- If a card contains `Applied`, apply a subtle green completed style.
- Leave all other cards untouched.
- Do not block clicks or alter LinkedIn workflows.
- Re-run detection when LinkedIn dynamically updates the job list.

## Implementation Guidance

- Prefer resilient DOM traversal over brittle class-name-only selectors.
- Keep content script logic small and readable.
- Keep CSS isolated with extension-specific class names.
- Avoid storing job IDs, titles, companies, URLs, or user actions.
- Storing user preferences is allowed: Viewed rule On/Off, Applied rule On/Off, and Active/Paused.
- Avoid network calls.
- Avoid broad permissions; request only what the extension needs for LinkedIn jobs pages.

## Release And Maintenance Checks

- Before any Chrome Web Store update, confirm the public privacy-policy URL is live and matches the repo copy.
- Before any release, re-check popup links, store screenshots, and listing text for stale or placeholder content.
- Before any release, verify the generated ZIP includes only the extension files that should ship.
- If scope changes, update the privacy policy, README, and store assets together so they stay consistent.
- Keep the product non-commercial unless the user explicitly changes that direction.

## Future Feature Guardrails

Possible later features include keyword highlighting in job descriptions, advanced LinkedIn search links, and AI assistance. Treat these as future scope, not MVP requirements. If added later, preserve the core privacy posture unless the user explicitly approves a new data model.

## Verification Checklist

- Viewed cards are visibly de-emphasized.
- Applied cards are visibly completed/green.
- New cards look unchanged.
- LinkedIn card clicks and native buttons still work.
- Styling applies after scrolling or changing search results.
- No user job data is stored by the extension.
- Popup preferences persist across reopen and browser refresh.
