/*
 * Generated type guards for "message.ts".
 * WARNING: Do not manually change this file.
 */
import { GetWalletRequest, SetWalletRequest, CallRequest } from "./message";

export function isGetWalletRequest(obj: unknown): obj is GetWalletRequest {
    const typedObj = obj as GetWalletRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["target"] === "string" &&
        typedObj["type"] === "get_wallet"
    )
}

export function isSetWalletRequest(obj: unknown): obj is SetWalletRequest {
    const typedObj = obj as SetWalletRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["target"] === "string" &&
        typedObj["type"] === "set_wallet" &&
        typeof typedObj["wallet"] === "string"
    )
}

export function isCallRequest(obj: unknown): obj is CallRequest {
    const typedObj = obj as CallRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["target"] === "string" &&
        typedObj["type"] === "client_call" &&
        typeof typedObj["function"] === "string" &&
        Array.isArray(typedObj["arguments"])
    )
}
