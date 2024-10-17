import { NextApiRequest, NextApiResponse } from 'next'; 
import https from 'https';

const REPO_OWNER = 'subrosa-ai'; 
const REPO_NAME = 'aisec.fyi'; 
const FILE_PATH = 'src/data/updates.json'; 


export default async function handler(req: NextApiRequest, res: NextApiResponse) { 
  try {
    const commitDate = await getLatestCommitDate();
    const dateString = new Date(commitDate).toDateString()
    res.status(200).json({ lastUpdated: dateString });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch last updated time" });
  }
}
// Function to get the latest commit date from GitHub
function getLatestCommitDate(): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?path=${FILE_PATH}`;
    const options = {
      headers: {
        'User-Agent': 'Node.js'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      // Collect data chunks
      res.on('data', (chunk) => {
        data += chunk;
      });

      // On end of response
      res.on('end', () => {
        const commits = JSON.parse(data);
        if (commits.length > 0) {
          resolve(commits[0].commit.committer.date);
        } else {
          resolve('No commits found for this file.');
        }
      });
    }).on('error', (err) => {
      reject('Error fetching data from Github: ' + err.message);
    });
  });
}
