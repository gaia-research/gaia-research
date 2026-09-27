import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { PluggableList } from "unified";

// This post discusses prices, not inline formulae. Keep block math available,
// but don't treat ordinary single-dollar currency as an opening math delimiter.
export const reflexPostRemarkPlugins: PluggableList = [
  remarkGfm,
  [remarkMath, { singleDollarTextMath: false }],
];
