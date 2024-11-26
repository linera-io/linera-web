/*
 * Generated type guards for "message.ts".
 * WARNING: Do not manually change this file.
 */
import { Message } from "./message";

export function isMessage(obj: unknown): obj is Message {
    const typedObj = obj as Message
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["target"] === "string" &&
        typeof typedObj["type"] === "string"
    )
}
