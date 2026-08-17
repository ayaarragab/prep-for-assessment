import baseConfig from "../../eslint.config.js";

export default [
  ...baseConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
    languageOptions: {
      parserOptions: {
        // Explicitly overriding to ensure no conflict
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
