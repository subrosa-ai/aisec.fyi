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
})

export type aiSecNewschemaType = z.infer<typeof aiSecNewschema>
