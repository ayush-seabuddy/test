const { defineConfig, globalIgnores } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const prettierRecommended = require("eslint-plugin-prettier/recommended");
const globals = require("globals");

module.exports = defineConfig([
	// Ignore heavy folders
	globalIgnores(["node_modules/*", ".expo/*", "dist/*", "build/*", "android/*", "ios/*"]),

	// Expo base config (React + RN + TS + Hooks)
	expoConfig,

	// Prettier integration
	prettierRecommended,

	{
		plugins: {
			"simple-import-sort": require("eslint-plugin-simple-import-sort"),
			"unused-imports": require("eslint-plugin-unused-imports"),
		},

		rules: {
			/*
      -------------------------
      GENERAL
      -------------------------
      */

			"no-console": ["warn", { allow: ["warn", "error"] }],
			"no-debugger": "warn",

			/*
      -------------------------
      IMPORTS
      -------------------------
      */

			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",

			"import/order": "off", // replaced by simple-import-sort

			/*
      -------------------------
      UNUSED
      -------------------------
      */

			"unused-imports/no-unused-imports": "error",

			"unused-imports/no-unused-vars": [
				"warn",
				{
					vars: "all",
					varsIgnorePattern: "^_",
					args: "after-used",
					argsIgnorePattern: "^_",
				},
			],

			/*
      -------------------------
      REACT
      -------------------------
      */

			"react/react-in-jsx-scope": "off",
			"react/jsx-uses-react": "off",

			/*
      -------------------------
      TYPESCRIPT
      -------------------------
      */

			"@typescript-eslint/no-explicit-any": "warn",

			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
				},
			],

			/*
      -------------------------
      REACT HOOKS
      -------------------------
      */

			"react-hooks/exhaustive-deps": "warn",
		},
	},

	/*
  -------------------------
  NODE ENV FILES
  -------------------------
  */

	{
		files: ["babel.config.js", "metro.config.js", "app.config.js", "eslint.config.js"],
		languageOptions: {
			globals: globals.node,
		},
	},
]);
