"use client";

/**
 * components/labs/craft/CraftTooltip.tsx
 *
 * Lightweight, accessible tooltip for Infinite Skill Craft.
 * Supports hover, keyboard focus, and mobile tap toggle with proper
 * ARIA relationships (aria-describedby) and clean DOM nesting.
 */

import { useState, useRef, useEffect, useId } from "react";

interface CraftTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  align?: "center" | "left" | "right";
  as?: "span" | "div";
  ariaLabel?: string;
}

export function CraftTooltip({
  content,
  children,
  align = "center",
  as: Component = "span",
  ariaLabel,
}: CraftTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteractiveChild, setHasInteractiveChild] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipId = useId();

  // Detect if children contain interactive elements (buttons, inputs, links)
  useEffect(() => {
    if (triggerRef.current) {
      const hasFocusable = !!triggerRef.current.querySelector(
        "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      setHasInteractiveChild(hasFocusable);
    }
  }, [children]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleTooltip = (e: React.MouseEvent) => {
    // Only toggle tooltip on container click if target is not an interactive child button/input/link
    const target = e.target as HTMLElement;
    const isInteractiveTarget =
      target.tagName === "BUTTON" ||
      target.tagName === "A" ||
      target.tagName === "INPUT" ||
      target.closest("button, a, input");

    if (!isInteractiveTarget) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <Component
      ref={triggerRef as any}
      className={`craft-tooltip-trigger ${isOpen ? "is-active" : ""}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      onClick={toggleTooltip}
      tabIndex={hasInteractiveChild ? undefined : 0}
      role={hasInteractiveChild ? undefined : "button"}
      aria-expanded={hasInteractiveChild ? undefined : isOpen}
      aria-describedby={isOpen ? tooltipId : undefined}
      aria-label={ariaLabel}
    >
      {children}
      {isOpen && (
        <span
          id={tooltipId}
          className={`craft-tooltip craft-tooltip-${align}`}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </Component>
  );
}
