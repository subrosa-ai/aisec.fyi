// SPDX-FileCopyrightText: 2024-2026 Subrosa.ai
// SPDX-License-Identifier: AGPL-3.0-or-later

import { z } from "zod"

export const aiSecNewschema = z.object({
  id: z.string(),
  title: z.string(),
  region: z.string(),
  date: z.string(),
  link: z.string(),
  summary: z.string(),
  category: z.string(),
  // Optional enrichment. See README.md ("Entry format").
  // `date` is when the incident became public; `incidentDate` is when it happened.
  incidentDate: z.string().optional(),
  // Corroborating URLs beyond `link`.
  sources: z.array(z.string()).optional(),
  // Ids of other entries that are part of the same story.
  related: z.array(z.string()).optional(),
})

export type aiSecNewschemaType = z.infer<typeof aiSecNewschema>
