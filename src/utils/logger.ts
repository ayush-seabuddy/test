import { env } from "@/src/config/env";
import { SeverityNumber, logs } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import * as Application from "expo-application";

const POSTHOG_API_KEY = env.posthogKey;
const POSTHOG_HOST = env.posthogHost;
const POSTHOG_LOGS_ENDPOINT = `${POSTHOG_HOST.replace(/\/$/, "")}/i/v1/logs`;

// 2. Create the LoggerProvider and register it globally
const loggerProvider = new LoggerProvider();
if (env.posthogEnabled) {
	const exporter = new OTLPLogExporter({
		url: POSTHOG_LOGS_ENDPOINT,
		headers: {
			Authorization: `Bearer ${POSTHOG_API_KEY}`,
		},
	});

	loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(exporter));
}
logs.setGlobalLoggerProvider(loggerProvider);

// 3. Get a named logger for your app
const logger = logs.getLogger(
	"SeaBuddy",
	Application.nativeApplicationVersion ?? "1.0.0",
);

// 4. Helper functions matching common log levels
export const Logger = {
	info: (message: string, attributes?: Record<string, string>) => {
		logger.emit({
			severityNumber: SeverityNumber.INFO,
			severityText: "INFO",
			body: message,
			attributes,
		});
	},

	warn: (message: string, attributes?: Record<string, string>) => {
		logger.emit({
			severityNumber: SeverityNumber.WARN,
			severityText: "WARN",
			body: message,
			attributes,
		});
	},

	error: (message: string, attributes?: Record<string, string> | null) => {
		console.log("🪵 Logger.error called");
		console.log("🪵 Raw attributes:", attributes);

		const safeAttributes = attributes && typeof attributes === "object" ? attributes : {};

		console.log("🪵 Safe attributes:", safeAttributes);

		try {
			logger.emit({
				severityNumber: SeverityNumber.ERROR,
				severityText: "ERROR",
				body: message,
				attributes: safeAttributes,
			});
		} catch (e) {
			console.log("🔥 LOGGER EMIT FAILED:", e);
		}
	},

	debug: (message: string, attributes?: Record<string, string>) => {
		logger.emit({
			severityNumber: SeverityNumber.DEBUG,
			severityText: "DEBUG",
			body: message,
			attributes,
		});
	},
};
