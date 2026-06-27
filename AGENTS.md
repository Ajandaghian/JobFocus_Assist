# JobFocus Assist Agent Development Notes

## Scope

Build JobFocus Assist, a minimal Chrome extension that visually restyles LinkedIn job result cards based only on state already visible in LinkedIn's page.

Do not add job-data persistence, custom tracking, notes, CRM features, or application automation unless the user explicitly changes the scope. Storing extension preferences and local keyword rules is allowed.

## Core Product Rule

LinkedIn is the source of truth. The extension should read visible page text/state and apply presentation changes only.

## MVP Behavior

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

## Current Feature Guardrails

Keyword highlighting in the opened JD is in scope. Keep it browser-local, grouped by keyword rule, and limited to visible page text. Advanced LinkedIn search links and AI assistance remain future scope.

## Verification Checklist

- Viewed cards are visibly de-emphasized.
- Applied cards are visibly completed/green.
- New cards look unchanged.
- LinkedIn card clicks and native buttons still work.
- Styling applies after scrolling or changing search results.
- No user job data is stored by the extension.
- Popup preferences persist across reopen and browser refresh.

## PPM product/design workflow

- Use `ppm-project-setup` when project product/design structure is missing or stale.
- Use `ppm-product-discovery` before PRD or UI design.
- Use `ppm-prd-writer` before visual design or implementation.
- Use `ppm-visual-design-explorer` to generate image-based design directions before coding.
- Use `ppm-design-critic` to compare design directions and select/revise one.
- Use `ppm-dev-handoff-designer` only if a deeper handoff is requested.
- Implement from `product/prd.md`, the selected popup state-flow image, and brand assets.
- Use `ppm-acceptance-reviewer` before accepting or shipping the feature.
- Do not silently promote feature-specific design choices into `design/system/`; ask first.

## Publish Checklist

- Keep `manifest.json`, `docs/privacy-policy.md`, `privacy.html`, and `README.md` aligned.
- Make sure the store copy mentions viewed/applied styling plus local JD keyword highlighting.
- Ship the repository root as the extension bundle; no build step is required.
