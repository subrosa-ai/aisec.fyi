import { z } from "zod"

export const aiSecNewschema = z.object({
  title: z.string(),
  region: z.string(),
  date: z.string(),
  link: z.string(),
  summary: z.string(),
  category: z.string(),
})

export type aiSecNewschemaType = z.infer<typeof aiSecNewschema>
