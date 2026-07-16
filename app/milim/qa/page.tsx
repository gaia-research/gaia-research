import type { Metadata } from "next";
import { MilimQaConsole } from "@/components/MilimQaConsole/MilimQaConsole";
import { parseMilimQaQuery } from "@/lib/milim-qa";

export const metadata: Metadata = {
  title: "Milim QA Console",
  robots: { index: false, follow: false },
};

export default async function MilimQaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") params.set(key, value);
  }
  return <MilimQaConsole query={parseMilimQaQuery(params)} />;
}
