"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = {
    getShortUUID: function () {
        return (S4() + S4() + '-' + S4());
    },
    getUUID: function () {
        return (S4() + S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + '-' +
            S4() + S4() + S4());
    },
};
const S4 = function () {
    return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
};
//# sourceMappingURL=util.js.map