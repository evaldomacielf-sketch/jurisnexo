"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeCodeSchema = exports.RequestCodeSchema = void 0;
const zod_1 = require("zod");
exports.RequestCodeSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.ExchangeCodeSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
});
//# sourceMappingURL=auth.dto.js.map