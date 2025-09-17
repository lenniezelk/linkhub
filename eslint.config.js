// @ts-check
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    {
        ignores: [
            // Generated files
            "**/routeTree.gen.ts",
            "**/worker-configuration.d.ts",
            // Build/dist folders
            "**/dist/**",
            "**/build/**",
            "**/.wrangler/**",
            "**/.nitro/**",
            "**/.output/**",
            // Cache/temp folders
            "**/.tanstack/**",
            "**/node_modules/**",
            "**/.vite/**",
            "**/.turbo/**",
            "**/.next/**",
            // Config/tooling
            "**/coverage/**",
            "**/public/**",
            "**/.env*",
            "**/wrangler.toml",
            "**/drizzle/**"
        ]
    },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: { jsx: true }
            },
            globals: { ...globals.browser, ...globals.node }
        },
        plugins: {
            "react-hooks": reactHooks
        },
        rules: {
            // React hooks safety
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": [
                "warn",
                {
                    additionalHooks: "(useMemoOne|useEvent)"
                }
            ]
        }
    }
];
