import colors from "../colors";
import spacing from "../spacing";
import radius from "../radius";
import shadows from "../shadows";

export const tokens = {
  colors,
  spacing,
  radius,
  shadows,
} as const;

export default tokens;
export * from "../colors";
export * from "../spacing";
export * from "../radius";
export * from "../shadows";
