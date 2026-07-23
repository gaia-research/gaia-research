"use client";

/**
 * components/labs/craft/CraftTooltip.tsx
 *
 * Lightweight, accessible tooltip for Infinite Skill Craft.
 * Supports hover, keyboard focus, and mobile tap toggle.
 */

import { useState, useRef, useEffect } from "react";

interface CraftTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  align?: "center" | "left" | "right";
}

export function CraftTooltip({ content, children, align = "center" }: CraftTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);

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
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <span
      ref={triggerRef}
      className={`craft-tooltip-trigger ${isOpen ? "is-active" : ""}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      onClick={toggleTooltip}
      tabIndex={0}
      role="button"
      aria-expanded={isOpen}
    >
      {children}
      {isOpen && (
        <span className={`craft-tooltip craft-tooltip-${align}`} role="tooltip">
          {content}
        </span>
      )}
    </span>
  );
}
