/*
 * Generated type guards for "message.ts".
 * WARNING: Do not manually change this file.
 */
import { GetWalletRequest, SetWalletRequest, QueryApplicationRequest } from "./message";

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

export function isQueryApplicationRequest(obj: unknown): obj is QueryApplicationRequest {
    const typedObj = obj as QueryApplicationRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["target"] === "string" &&
        typedObj["type"] === "query_application" &&
        typeof typedObj["applicationId"] === "string" &&
        typeof typedObj["query"] === "string"
    )
}
