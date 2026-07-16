"use client";

import type { CSSProperties, ReactNode } from "react";
import MilimLive, { MILIM_RELEASE_VERSION } from "@/components/MilimLive";

const FALLBACK_SRC = "/assets/north-star-live/milim-live-full-body-sprite-v01.webp";

export function MilimHero({ children }: { children: ReactNode }) {
  const style = {
    "--milim-lab-scene": `url("/milim/releases/${MILIM_RELEASE_VERSION}/scenes/cyber-slime-lab-v1/layers/background.webp")`,
  } as CSSProperties;
  return (
    <section className="milim-hero" aria-labelledby="hero-title" style={style}>
      <MilimLive
        className="milim-hero-stage"
        fallbackSrc={FALLBACK_SRC}
        fallbackAlt="Milim, Gaia Research's Chief Capability Scout, standing in a laboratory hoodie."
        width={1024}
        height={1536}
        sizes="100vw"
        initialState={{ scene: "cyber-slime-lab-v1", expression: "neutral" }}
      />
      <div className="milim-hero-content">{children}</div>
    </section>
  );
}
