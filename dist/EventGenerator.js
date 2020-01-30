"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventGenerator = {
    getStartEvent() {
        let startEvent = {
            type: "system",
            code: 200,
            message: "Stream Starting."
        };
        return JSON.stringify(startEvent);
    },
    getErrorEvent(code, message) {
        let startEvent = {
            type: "system",
            code: code,
            message: message,
        };
        return JSON.stringify(startEvent);
    }
};
//# sourceMappingURL=EventGenerator.js.map