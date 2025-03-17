import fs from "fs/promises";

/**
 * 🔄 Next.js Cache Issue Explanation:
 * 
 * Next.js aggressively caches imported files, especially static assets and external stylesheets.
 * Even when the source file updates, Next.js might still serve the cached version unless its URL changes.
 * 
 * One common workaround is to **append a query string (`?v=number`)** to force Next.js and the browser
 * to treat the file as a "new" resource. This technique is often called "cache busting."
 * 
 * 🛠 Why This Script is Needed:
 * - This function automatically **increments** the version number in the query string (e.g., `?v=6` → `?v=7`).
 * - Ensures that **Next.js and browsers always load the latest version** of these files.
 * - Prevents stale CSS/JS files from being served, avoiding debugging issues due to outdated assets.
 * 
 * 🚀 How it Works:
 * - Reads the `DesignSystemEmbed.tsx` file.
 * - Finds all `?v=<number>` occurrences.
 * - Increments the version number by 1.
 * - Saves the updated file.
 * 
 * Usage:
 * ```bash
 * node updateVersion.mjs
 * ```
 */
async function updateVersionNumbers(file) {
    try {
        let content = await fs.readFile(file, "utf-8");

        // Increment ?v=NUMBER by 1
        content = content.replace(/\?v=(\d+)/g, (match, num) => `?v=${parseInt(num, 10) + 1}`);

        // Write the updated content back to the file
        await fs.writeFile(file, content, "utf-8");
        console.log(`✅ Updated version numbers in ${file}`);
    } catch (error) {
        console.error(`❌ Error updating file: ${error.message}`);
    }
}

updateVersionNumbers('./components/DesignSystemEmbed/DesignSystemEmbed.tsx');