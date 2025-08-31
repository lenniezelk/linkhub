// @ts-check
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    {
        ignores: [
            "**/routeTree.gen.ts"
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
