/*
 * Generated type guards for "message.ts".
 * WARNING: Do not manually change this file.
 */
import { WorkerId, WorkerRequest, NewWorkerRequest, SendMessageRequest, TerminateRequest, WorkerMessage } from "./message";

export function isWorkerId(obj: unknown): obj is WorkerId {
    const typedObj = obj as WorkerId
    return (
        typeof typedObj === "number"
    )
}

export function isWorkerRequest(obj: unknown): obj is WorkerRequest {
    const typedObj = obj as WorkerRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["type"] === "string" &&
        typeof typedObj["target"] === "string" &&
        isWorkerId(typedObj["worker"]) as boolean
    )
}

export function isNewWorkerRequest(obj: unknown): obj is NewWorkerRequest {
    const typedObj = obj as NewWorkerRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["target"] === "string" &&
        typedObj["type"] === "new_worker" &&
        typeof typedObj["url"] === "string"
    )
}

export function isSendMessageRequest(obj: unknown): obj is SendMessageRequest {
    const typedObj = obj as SendMessageRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["target"] === "string" &&
        isWorkerId(typedObj["worker"]) as boolean &&
        typedObj["type"] === "send_message"
    )
}

export function isTerminateRequest(obj: unknown): obj is TerminateRequest {
    const typedObj = obj as TerminateRequest
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["target"] === "string" &&
        isWorkerId(typedObj["worker"]) as boolean &&
        typedObj["type"] === "terminate"
    )
}

export function isWorkerMessage(obj: unknown): obj is WorkerMessage {
    const typedObj = obj as WorkerMessage
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["target"] === "string" &&
        isWorkerId(typedObj["worker"]) as boolean &&
        typedObj["type"] === "worker_message"
    )
}
