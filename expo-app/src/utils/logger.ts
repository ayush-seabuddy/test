import { SeverityNumber, logs } from "@opentelemetry/api-logs";
import * as Application from "expo-application";
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";

const POSTHOG_API_KEY = "phc_LYxVgQmPQSyrXAv134auG5e5khoPh9GgCDQvmvdjhVH"; 
const POSTHOG_LOGS_ENDPOINT = "https://us.i.posthog.com/i/v1/logs";

// 1. Create the OTLP exporter pointing to PostHog
const exporter = new OTLPLogExporter({
  url: POSTHOG_LOGS_ENDPOINT,
  headers: {
    Authorization: `Bearer ${POSTHOG_API_KEY}`,
  },
});

// 2. Create the LoggerProvider and register it globally
const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(exporter));
logs.setGlobalLoggerProvider(loggerProvider);

// 3. Get a named logger for your app
const logger = logs.getLogger(
  "SeaBuddy",
  Application.nativeApplicationVersion ?? "1.0.0" 
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

  error: (message: string, attributes?: Record<string, string>) => {
    logger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: "ERROR",
      body: message,
      attributes,
    });
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