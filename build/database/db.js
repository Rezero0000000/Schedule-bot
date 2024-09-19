"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const knex_1 = __importDefault(require("knex"));
const database = (0, knex_1.default)({
    client: "sqlite3",
    connection: {
        filename: "./database/dev.sqlite3"
    },
    useNullAsDefault: true
});
exports.db = database;
