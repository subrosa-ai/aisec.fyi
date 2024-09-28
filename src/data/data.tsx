import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "@radix-ui/react-icons"

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
