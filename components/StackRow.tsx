"use client";

import React, { useEffect, useId, useState } from "react";

// A table row that, on phones (where stacked tables become cards), shows its
// first two cells and folds the rest behind a toggle. Desktop CSS ignores the
// fold, and without JavaScript every cell stays visible.
export default function StackRow({ children, ...props }: React.ComponentProps<"tr">) {
  const cells = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<
    React.ComponentProps<"td">
  >[];
  const isHeader = cells.some((c) => c.type === "th" && (c.props as { scope?: string }).scope !== "row") && !cells.some((c) => c.type === "td");
  const foldable = !isHeader && cells.length >= 4;
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => setReady(true), []);

  if (!foldable) return <tr {...props}>{children}</tr>;

  const hidden = cells.length - 2;
  const first = cells[0];
  const firstWithToggle = React.cloneElement(
    first,
    { key: "c0" },
    <>
      {first.props.children}
      {ready && (
        <button
          type="button"
          className="stack-row-toggle"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Show less" : `Show ${hidden} more`}
        </button>
      )}
    </>,
  );

  return (
    <tr {...props} id={id} data-fold={ready && !open ? "true" : "false"}>
      {firstWithToggle}
      {cells.slice(1)}
    </tr>
  );
}
