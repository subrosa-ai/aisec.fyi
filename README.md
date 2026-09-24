# AISec.fyi
⚡ A curated list of security risks and breaches associated with Artificial Intelligence.

![logo](/public/ai-sec.png)

We aim to provide a comprehensive resource for security professionals, AI developers, researchers and the general public to stay informed about latest AI security, safety issues and related breaches.

## Contributing Guidelines
We welcome contributions to enhance the project and AI security related report! Please follow these guidelines:

1. **Fork the repository**: Create your own fork of the repository.
2. **Create a new branch**: Use a descriptive name for your branch (e.g., `feature/add-feature`, `aisecnews/new-ai-breach`, `enhance/add-detail-to-aisec-1`).
3. **Make your changes**: Implement your feature or fix.
4. **Test locally**: Ensure your changes are covered by tests.
5. **Submit a pull request**: Describe your changes and reference any related issues.

## Submit new AI breach news
You can contribute new AI breaches and risk news at [src/data/updates.json](https://github.com/subrosa-ai/aisec.fyi/blob/master/src/data/updates.json) following existing JSON object format, and create PR for review.

### Entry format

```json
{
  "id": "aisec-123",
  "title": "Vendor X patches zero-click prompt injection in Product Y (CVE-2026-12345)",
  "region": "Global",
  "date": "September 2026",
  "link": "https://example.com/primary-disclosure",
  "summary": "Two to four neutral sentences: what happened, who was affected, how it was found or disclosed, and what the response was.",
  "category": "prompt injection"
}
```

- `id` — `aisec-N`, incrementing from the last entry in the file.
- `date` — the month the incident became **public** (`"Month YYYY"`, full English month name). If the incident happened earlier, say so in the summary.
- `link` — one canonical source that you have opened and that is about this exact incident. Prefer the vendor or researcher's primary disclosure, then a reputable outlet. No search pages, no social-media posts.
- `region` — a value from `regions` in [src/data/data.tsx](src/data/data.tsx) (add a new one there, with its flag, if needed). Use `Global` when there is no single jurisdiction.
- `category` — a value from `category` in [src/data/data.tsx](src/data/data.tsx); see the taxonomy below.
- One entry per incident. Merge a disclosure and its patch into one entry; different incidents at the same company are separate entries.
- Write summaries in the neutral tone of a catalog. No hype, no speculation, and no operational detail (e.g. do not reproduce jailbreak prompts or exploit payloads).

### Categories

| value | use it for |
|---|---|
| `data leak` | accidental exposure of data — open databases/buckets, leaked tokens, chat logs or files indexed or shared by mistake |
| `hack` | deliberate intrusion by a threat actor — breach of an AI company or AI-related system, stolen credentials, account takeover, model theft/distillation campaigns |
| `vulnerability` | a disclosed flaw in an AI product, framework, model-serving stack, agent or MCP server that is not primarily a prompt-injection issue (with or without confirmed exploitation) |
| `privacy breach` | regulatory findings and fines, unlawful use of personal data for AI training, biometrics/facial-recognition misuse, privacy-violating product behaviour |
| `prompt injection` | an AI system hijacked by instructions hidden in the content it processes — product flaws found by researchers (EchoLeak, AgentFlayer…) and in-the-wild abuse |
| `jailbreak` | notable guardrail bypasses and manipulations of deployed models or chatbots |
| `supply chain` | malicious or compromised packages, models, extensions, skills and MCP servers; poisoned dependencies; typosquatting / slopsquatting |
| `rogue agent` | an AI agent taking unauthorised or destructive real-world action — deleting data, publishing packages, escaping a sandbox, breaching third parties during a lab's training or evaluation (the "lab leak" incidents of 2026) |
| `ai-enabled attack` | threat actors using AI to attack others — LLM-written or LLM-operated malware, AI-orchestrated intrusions, deepfake and voice-clone fraud, LLM grooming / disinformation, state actors abusing AI services |
| `model leak` | unauthorised release of model weights, system prompts, unreleased-model details or AI-lab source code |
| `safety incident` | harmful model behaviour in production that is not primarily a security flaw (non-consensual imagery at scale, unauthorised system-prompt changes causing harmful output, dangerous advice) — use sparingly |

## Getting Started
This project is made of Next.js and deployed on Netlify, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The site is a **static export** (`output: "export"` in `next.config.mjs`) with no
server-side code, so `next start` does not apply — use `bun run build` and then
`bun run start` to preview the generated `out/` directory.

### Use bun 1.3.x — not 1.4

This project pins **bun 1.3.14** (see `BUN_VERSION` in [netlify.toml](netlify.toml)).

bun 1.4 writes `bun.lock` with `"lockfileVersion": 2`, which Dependabot cannot
read yet — every Dependabot PR fails with:

```
Unsupported bun.lock 'lockfileVersion' 2 in /bun.lock.
The bun version Dependabot runs supports up to 1.
```

bun 1.3.14 writes `lockfileVersion: 1`, which Dependabot accepts. Running
`bun install` with bun 1.4+ will silently rewrite the lockfile to version 2 and
break Dependabot again, so check `bun.lock` still starts with
`"lockfileVersion": 1` before committing. Drop the pin once Dependabot supports
version 2.

The lockfile is plaintext by design — `saveTextLockfile = true` in
[bunfig.toml](bunfig.toml) keeps it as a reviewable `bun.lock` rather than a
binary `bun.lockb`.

## License
Copyright (C) 2024-2026 Subrosa Software Pty Ltd

This project is licensed under the **GNU Affero General Public License v3.0 or
later** (AGPL-3.0-or-later) - see the [LICENSE](LICENSE.md) file for details.

The AGPL adds [section 13](LICENSE.md) to the GPL: if you run a modified version
of this project as a network service, you must offer its users the Corresponding
Source of your version. Deploying an unmodified copy, or using it privately,
carries no such obligation.

Source files carry [SPDX](https://spdx.dev/) headers identifying the copyright
holder and license. Files under `src/components/ui/`, along with
`src/lib/utils.ts` and `src/hooks/use-toast.ts`, are generated by
[shadcn/ui](https://ui.shadcn.com/) (MIT) and are intentionally left unstamped.
