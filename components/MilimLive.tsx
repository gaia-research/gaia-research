"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  loadMilimRelease,
  type MilimController,
  type MilimDurableState,
} from "@/lib/milim-player-loader";
import { createCoalescedMilimPointerDriver } from "@/lib/milim-live-runtime";

/** Integrators change this one explicit pin when the immutable 0.2.0 release is promoted. */
export const MILIM_RELEASE_VERSION = "milim-web-0.1.2";
export const MILIM_RELEASE_URL = `/milim/releases/${MILIM_RELEASE_VERSION}/release.json`;

export type MilimLiveMode = "live" | "fallback" | "reduced-motion" | "missing-release";
export type MilimLifecycle = {
  running: boolean;
  visible: boolean;
  documentHidden: boolean;
};

export interface MilimLiveProps {
  fallbackSrc: string;
  fallbackAlt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  releaseUrl?: string;
  initialState?: Partial<MilimDurableState>;
  mode?: MilimLiveMode;
  onReady?: (controller: MilimController) => void;
  onLifecycle?: (lifecycle: MilimLifecycle) => void;
  onStatus?: (status: unknown) => void;
}

/**
 * Website-only adapter around the six-method Milim Player interface:
 * mountMilim(), set(), drive(), perform(), setRunning(), and destroy().
 * It deliberately knows nothing about meshes, effects, scenes, or motion data.
 */
export default function MilimLive({
  fallbackSrc,
  fallbackAlt,
  width,
  height,
  sizes,
  className,
  releaseUrl = MILIM_RELEASE_URL,
  initialState,
  mode = "live",
  onReady,
  onLifecycle,
  onStatus,
}: MilimLiveProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<MilimController | null>(null);
  const initialStateRef = useRef(initialState);
  const [playerState, setPlayerState] = useState<"loading" | "ready" | "fallback">(
    mode === "live" ? "loading" : "fallback",
  );

  useEffect(() => {
    if (mode !== "live") {
      setPlayerState("fallback");
      return;
    }

    setPlayerState("loading");
    let cancelled = false;
    let visible = true;
    let documentHidden = document.hidden;
    let observer: IntersectionObserver | null = null;
    let pointerTarget: HTMLElement | null = null;
    let pointerDriver: ReturnType<typeof createCoalescedMilimPointerDriver> | null = null;

    const reportLifecycle = () => {
      const lifecycle = { running: visible && !documentHidden, visible, documentHidden };
      stageRef.current?.setRunning(lifecycle.running);
      onLifecycle?.(lifecycle);
    };

    const onVisibilityChange = () => {
      documentHidden = document.hidden;
      reportLifecycle();
    };

    void (async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { mountMilim } = await loadMilimRelease(releaseUrl);
        if (cancelled) return;
        const controller = await mountMilim(canvas, {
          src: releaseUrl,
          reducedMotion: false,
          onStatus(status) {
            onStatus?.(status);
            if (!cancelled && typeof status === "object" && status !== null && "type" in status && status.type === "decoded") {
              setPlayerState("ready");
            }
          },
        });
        if (cancelled) {
          controller.destroy();
          return;
        }
        stageRef.current = controller;
        if (initialStateRef.current) controller.set(initialStateRef.current);
        onReady?.(controller);
        observer = new IntersectionObserver((entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          reportLifecycle();
        }, { threshold: 0.05 });
        if (wrapRef.current) observer.observe(wrapRef.current);
        document.addEventListener("visibilitychange", onVisibilityChange);
        pointerTarget = wrapRef.current;
        if (pointerTarget) {
          pointerDriver = createCoalescedMilimPointerDriver({
            element: canvas,
            drive: controller.drive,
            isActive: () => !cancelled && visible && !documentHidden && stageRef.current === controller,
            requestFrame: window.requestAnimationFrame.bind(window),
            cancelFrame: window.cancelAnimationFrame.bind(window),
          });
          pointerTarget.addEventListener("pointermove", pointerDriver.onPointerMove, { passive: true });
        }
        reportLifecycle();
      } catch (error) {
        if (!cancelled) {
          onStatus?.({ type: "error", error });
          setPlayerState("fallback");
        }
      }
    })();

    return () => {
      cancelled = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (pointerTarget && pointerDriver) pointerTarget.removeEventListener("pointermove", pointerDriver.onPointerMove);
      pointerDriver?.destroy();
      stageRef.current?.destroy();
      stageRef.current = null;
    };
  }, [mode, onLifecycle, onReady, onStatus, releaseUrl]);

  return (
    <div
      ref={wrapRef}
      className={["live-stage", className].filter(Boolean).join(" ")}
      data-transition-src={fallbackSrc}
      data-player={playerState}
      data-milim-mode={mode}
    >
      <Image
        className="milim-sprite"
        src={fallbackSrc}
        alt={fallbackAlt}
        width={width}
        height={height}
        priority
        sizes={sizes}
        data-live={playerState === "ready" ? "hidden" : "shown"}
      />
      <canvas ref={canvasRef} className="milim-live-canvas" aria-hidden="true" data-live={playerState === "ready" ? "shown" : "hidden"} />
    </div>
  );
}
