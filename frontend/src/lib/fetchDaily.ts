import fs from "fs/promises";
import path from "path";
import type { DailyData } from "./types";

export async function fetchDaily(date: string): Promise<DailyData | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const filePath = path.join(
    process.cwd(),
    "public",
    "data",
    "daily",
    `${date}.json`
  );
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as DailyData;
  } catch {
    return null;
  }
}
