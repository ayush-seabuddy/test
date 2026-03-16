/** @type {import('@expo/fingerprint').Config} */
const config = {
	sourceSkips: [
		// runtimeVersion is derived/managed, not a static string
		"ExpoConfigRuntimeVersionIfString",
		// version/versionCode/buildNumber bumps don't affect native code
		"ExpoConfigVersions",
		// Stable fingerprint before and after expo prebuild
		"PackageJsonAndroidAndIosScriptsIfNotContainRun",
		// EAS projectId/owner don't affect native runtime
		"ExpoConfigEASProject",
		// .gitignore changes are non-native
		"GitIgnore",
	],
};
module.exports = config;
