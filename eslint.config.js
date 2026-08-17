import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        projectService: true, // Recommended for modern TS
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-console": "warn",
      "react/react-in-jsx-scope": "off",
    },
  },
);
