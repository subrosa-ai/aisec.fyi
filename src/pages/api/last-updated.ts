import { promises as fs } from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from 'next'; // Import types

export default async function handler(req: NextApiRequest, res: NextApiResponse) { // Explicitly type parameters
  try {
    const filePath = path.join(process.cwd(), "src/data/updates.json");
    const stats = await fs.stat(filePath);
    res.status(200).json({ lastUpdated: stats.mtime.toDateString() });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to fetch last updated time" });
  }
}
