import { describe, expect, it } from "vitest";
import { labelTable } from "./rehype-table-labels";

const el = (tagName: string, children: any[] = [], properties: Record<string, unknown> = {}) => ({
  type: "element",
  tagName,
  properties,
  children,
});
const txt = (value: string) => ({ type: "text", value });

describe("rehype-table-labels", () => {
  it("labels every body cell with its column header and marks the table", () => {
    const table: any = el("table", [
      el("thead", [el("tr", [el("th", [txt("Level")]), el("th", [el("strong", [txt("When")]), txt(" it fits")])])]),
      el("tbody", [el("tr", [el("td", [txt("A")]), el("td", [txt("Coupled files")])])]),
    ]);
    labelTable(table);
    expect(table.properties["data-stack"]).toBe("true");
    expect(table.properties["data-cols"]).toBe("2");
    const [a, b] = table.children[1].children[0].children;
    expect(a.properties["data-label"]).toBe("Level");
    expect(b.properties["data-label"]).toBe("When it fits");
    // content is untouched: nothing dropped or duplicated
    expect(b.children).toEqual([txt("Coupled files")]);
  });

  it("leaves header-less tables alone", () => {
    const table: any = el("table", [el("tbody", [el("tr", [el("td", [txt("x")])])])]);
    labelTable(table);
    expect(table.properties["data-stack"]).toBeUndefined();
  });
});
