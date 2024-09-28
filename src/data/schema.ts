import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const leakSchema = z.object({
  title: z.string(),
  region: z.string(),
  date: z.string(),
  link: z.string(),
  summary: z.string(),
  category: z.string(),
})

export type Task = z.infer<typeof leakSchema>
