import convexPlugin from "@convex-dev/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "convex/_generated/**",
      "scripts/**",
    ],
  },
  ...tseslint.configs.recommended,
  ...convexPlugin.configs.recommended,
);
