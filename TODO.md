# TODO

Open work on the incident catalog. Entries are in [src/data/updates.json](src/data/updates.json); the format and the category definitions are in the [README](README.md).

## 1. Incidents that still need a citable source

These are real, well-documented incidents that belong in the catalog. They were left out of the September 2026 backfill only because the outlet that carried them could not be opened and verified at the time. Each needs one link that is actually read before it is added.

| Incident | Month | Where to look |
|---|---|---|
| Taylor Swift explicit deepfakes via a Microsoft Designer loophole; X blocks searches | Jan 2024 | 404 Media, The Verge |
| Arup named as the HK$200m deepfake-CFO victim (aisec-46 describes the case without the name) | May 2024 | CNN, FT |
| WPP CEO Mark Read deepfake voice/video scam attempt | May 2024 | The Guardian |
| Ferrari executive deepfake voice attempt, foiled by a security question | Jul 2024 | Bloomberg |
| Sen. Ben Cardin deepfake video call impersonating Dmytro Kuleba | Sep 2024 | NYT, Punchbowl |
| Italian defence minister Crosetto voice-clone scam | Feb 2025 | Reuters |
| Susie Wiles phone impersonation targeting senators and executives | May 2025 | WSJ, Reuters |
| Garante €5M fine on Luka Inc. (Replika) | May 2025 | garanteprivacy.it |
| Garante blocks Clothoff | Oct 2025 | garanteprivacy.it |
| Zoom and Adobe AI-training terms-of-service backlashes | Aug 2023 / Jun 2024 | The Verge |
| Czech DeepSeek government ban; ByteDance Trae IDE telemetry after opt-out; Whitebridge AI noyb complaint; Clearview rulings (BC Court of Appeal, US 7th Circuit) | 2025–2026 | euronews.com, theregister.com, biometricupdate.com |
| IDEsaster; Windsurf CVE-2026-30615; "Comment-and-Control"; Codex CLI RCE; Google Docs "refine" injection; ConfusedPilot | 2023–2026 | vendor advisories |
| Smithery.ai MCP path traversal; ComfyUI_LLMVISION credential stealer | 2024–2025 | GitGuardian (page 404s), original write-ups |
| "Secret Desires" companion leak (~2M images); Confidant Health exposure | 2025 | 404 Media, Wired |

## 2. Automate intake

Sources worth polling weekly:

- OpenAI's incident and misalignment disclosure pages; Anthropic's news and research feeds; Google's Threat Intelligence blog; Meta, xAI and Mistral security pages.
- UK AISI, NIST/CAISI and national DPA newsrooms (OAIC, Garante, DPC, Dutch AP, PIPC, ICO, AEPD).
- CISA KEV additions matching AI projects (Ray, Langflow, LiteLLM, vLLM, Triton, Ollama, MCP servers).
- Vendor research blogs: Wiz, Oligo, JFrog, Koi, Zenity, Noma, Varonis, PromptArmor, Tenable, Unit 42, SentinelOne, Socket, ReversingLabs, embracethered.com.
- Have I Been Pwned's new-breach feed, filtered to AI products.

The job should draft an entry in the existing format and leave the link for a human to open. Do not let it merge on its own: every link in this file has been read by a person or an agent that actually fetched it, and that is the property worth keeping.

## 3. Backfill the optional fields

`incidentDate`, `sources` and `related` were added in September 2026 and are populated where the research already supported them (36, 113 and 69 entries respectively). Worth extending:

- `incidentDate` for older entries, especially breaches disclosed long after the fact.
- `sources` for the pre-backfill entries aisec-1 … aisec-22, which have one link each.
- `related` for clusters not yet wired up: MCP server vulnerabilities, vibe-coding platform exposures, AI companion app breaches, North Korean IT-worker and npm campaigns.

## 4. Editorial notes on specific entries

- **aisec-88** (Garante €15M OpenAI fine) — a Rome court upheld OpenAI's appeal in March 2026 and the Garante withdrew the decision from its site. Mentioned in the summary; may deserve its own entry once final.
- **aisec-84** (Bunnings) — partially overturned by the ART in February 2026; noted in the summary.
- **aisec-46** (Hong Kong deepfake) — the victim is widely reported as Arup but the cited source does not name them, so the entry does not either.
- **aisec-252** (Cuties AI) — the HIBP page is internally inconsistent about 2025 vs 2026; the narrative says March 2026.
- **aisec-221** (Claude Code home-directory wipe) — rests on the developer's own account plus Gigazine.
- aisec-129 (Claude 3.7 system prompt) and aisec-270 (Grok/Bankr wallet drain) were removed for weak sourcing. Their ids are retired, not reused — share links of the form `?rowId=aisec-129` exist in the wild.

## 5. Site ideas

Shipped: the Year facet, the `?cluster=` related view, and the disclosure-lag line under each date. Still open:

- A timeline view. The Year facet narrows the table, but the 2026 agent incidents really want a horizontal axis with `incidentDate` and `date` as two marks per incident.
- Sortable columns. `enableSorting` is false on the table, so ordering is fixed newest-first; a lag sort ("what was sat on longest?") would be a good reason to turn it back on.
- Cluster permalinks in the share menu, so the row-action share button can offer "copy link to this cluster" alongside the single-incident link.
- Clusters are seeded from one entry, so `?cluster=aisec-320` shows that entry plus its `related`. A cluster that is more than one hop deep would need a transitive walk.
