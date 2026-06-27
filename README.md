# JobFocus Assist

JobFocus Assist is a minimal Chrome extension that restyles LinkedIn job result cards and highlights keywords inside the opened LinkedIn job description based only on the state already visible in LinkedIn.

> *JobFocus Assist: LinkedIn Job Search Visual Helper*
![JobFocus Assist Logo](assets/brand/jobfocus-assist-lockup.png)


## What it does

- Detects LinkedIn job cards
- Mutes cards marked `Viewed`
- Marks cards marked `Applied`
- Highlights matched keywords inside the open JD using user-defined local rules
- Lets you manage keyword rules locally in the popup
- Leaves all other cards unchanged
- Re-runs automatically as LinkedIn updates the job list

![JobFocus Assist Store Intro](assets/store/jobfocus-assist-store-intro.png)

## Privacy

- No job data is stored
- No LinkedIn content is uploaded
- Only extension preferences and keyword rules are stored locally in Chrome storage
- Keyword highlighting applies only to the open JD and never uploads page content

See the full policy in [docs/privacy-policy.md](docs/privacy-policy.md).


# Install

1. Download the extension source code from this repository.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked.
5. Select this folder.

## Publish

- Keep `manifest.json`, `docs/privacy-policy.md`, and `privacy.html` aligned.
- Mention viewed/applied styling and local JD keyword highlighting in the store listing.
- Ship the repository root as the extension bundle; no build step is required.

## Project links

- Repository: https://github.com/Ajandaghian/JobFocus_Assist
- Issues: https://github.com/Ajandaghian/JobFocus_Assist/issues
