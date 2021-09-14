import rTracer from "cls-rtracer";
import { LoggingConfig } from "../config/loggingconfig";
import winston from "winston";

const rTracerFormat = winston.format.printf((info) => {
  const rid = rTracer.id();
  return rid
    ? `[${info.level}][${new Date().toISOString()}][${rid}] ${info.message}`
    : `[${info.level}][${new Date().toISOString()}] ${info.message}`;
});

winston.addColors(LoggingConfig.colors);

export const logger = winston.createLogger({
  level: LoggingConfig.level,
  format: winston.format.combine(winston.format.colorize(), rTracerFormat),
  transports: [new winston.transports.Console()],
});
