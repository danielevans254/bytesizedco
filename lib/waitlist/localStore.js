/* Local file fallback for the waitlist, used when the Beehiiv env vars are
   absent: data/waitlist.json (gitignored). A dev convenience only. Writes are
   serialised through queue() so concurrent signups cannot clobber the file. */

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "waitlist.json");

let chain = Promise.resolve();
export function queue(task) {
  const run = chain.then(task, task);
  chain = run.then(() => undefined, () => undefined);
  return run;
}

export async function readStore() {
  try {
    const json = JSON.parse(await fs.readFile(FILE, "utf8"));
    if (!Array.isArray(json.entries)) json.entries = [];
    return json;
  } catch {
    return { entries: [] };
  }
}

/* Reports failure instead of throwing. This fallback is a dev convenience, but it
   also runs in production whenever the Beehiiv env vars are absent, and on Vercel
   everything outside /tmp is read-only. An uncaught EROFS here 500s the request and
   takes the whole waitlist down, which is exactly what happened on 2026-10-08. */
export async function writeStore(store) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(store, null, 2));
    return true;
  } catch (e) {
    console.error(
      "[waitlist] cannot persist signup: Beehiiv is not configured and the filesystem is read-only. " +
        "Set BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID in this environment.",
      String(e?.message || e)
    );
    return false;
  }
}
