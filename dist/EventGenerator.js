"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventGenerator = {
    getStartEvent() {
        let startEvent = {
            type: "system",
            code: 200,
            message: "Stream Starting."
        };
        return "data:" + JSON.stringify(startEvent) + '\n\n';
    },
    getErrorEvent(code, message) {
        let startEvent = {
            type: "system",
            code: code,
            message: message,
        };
        return "data:" + JSON.stringify(startEvent) + '\n\n';
    }
};
//# sourceMappingURL=EventGenerator.js.map