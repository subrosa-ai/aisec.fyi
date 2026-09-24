// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "@radix-ui/react-icons"

// Category taxonomy — see README.md ("Categories") for definitions.
// Values must match the `category` field in updates.json exactly.
export const category = [
  {
    value: "data leak",
    label: "Data Leak",
  },
  {
    value: "vulnerability",
    label: "Vulnerability",
  },
  {
    value: "hack",
    label: "Hack",
  },
  {
    value: "privacy breach",
    label: "Privacy Breach",
  },
  {
    value: "prompt injection",
    label: "Prompt Injection",
  },
  {
    value: "jailbreak",
    label: "Jailbreak",
  },
  {
    value: "supply chain",
    label: "Supply Chain",
  },
  {
    value: "rogue agent",
    label: "Rogue Agent",
  },
  {
    value: "ai-enabled attack",
    label: "AI-Enabled Attack",
  },
  {
    value: "model leak",
    label: "Model Leak",
  },
  {
    value: "safety incident",
    label: "Safety Incident",
  },
]

export const regions = [
  {
    value: "US",
    label: "🇺🇸 US",
  },
  {
    value: "Global",
    label: "🌎 Global",
  },
  {
    value: "South Korea",
    label: "🇰🇷 South Korea",
  },
  {
    value: "UK",
    label: "🇬🇧 UK",
  },
  {
    value: "Italy",
    label: "🇮🇹 Italy",
  },
  {
    value: "European Union",
    label: "🇪🇺 European Union",
  },
  {
    value: "Australia",
    label: "🇦🇺 Australia",
  },
  {
    value: "Brazil",
    label: "🇧🇷 Brazil",
  },
  {
    value: "China",
    label: "🇨🇳 China",
  },
  {
    value: "Hong Kong",
    label: "🇭🇰 Hong Kong",
  },
  {
    value: "Japan",
    label: "🇯🇵 Japan",
  },
  {
    value: "Singapore",
    label: "🇸🇬 Singapore",
  },
  {
    value: "India",
    label: "🇮🇳 India",
  },
  {
    value: "Pakistan",
    label: "🇵🇰 Pakistan",
  },
  {
    value: "Israel",
    label: "🇮🇱 Israel",
  },
  {
    value: "Turkey",
    label: "🇹🇷 Turkey",
  },
  {
    value: "Russia",
    label: "🇷🇺 Russia",
  },
  {
    value: "Ukraine",
    label: "🇺🇦 Ukraine",
  },
  {
    value: "Germany",
    label: "🇩🇪 Germany",
  },
  {
    value: "France",
    label: "🇫🇷 France",
  },
  {
    value: "Netherlands",
    label: "🇳🇱 Netherlands",
  },
  {
    value: "Ireland",
    label: "🇮🇪 Ireland",
  },
  {
    value: "Spain",
    label: "🇪🇸 Spain",
  },
  {
    value: "Greece",
    label: "🇬🇷 Greece",
  },
  {
    value: "Sweden",
    label: "🇸🇪 Sweden",
  },
  {
    value: "Norway",
    label: "🇳🇴 Norway",
  },
]

export const serverity = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
]
