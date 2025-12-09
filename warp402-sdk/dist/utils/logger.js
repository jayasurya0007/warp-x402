"use strict";
/**
 * Simple logger utility
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        this.level = LogLevel.INFO;
    }
    setLevel(level) {
        this.level = level;
    }
    error(message, ...args) {
        if (this.level >= LogLevel.ERROR) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    }
    warn(message, ...args) {
        if (this.level >= LogLevel.WARN) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }
    info(message, ...args) {
        if (this.level >= LogLevel.INFO) {
            console.log(`[INFO] ${message}`, ...args);
        }
    }
    debug(message, ...args) {
        if (this.level >= LogLevel.DEBUG) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    }
}
exports.logger = new Logger();
//# sourceMappingURL=logger.js.map