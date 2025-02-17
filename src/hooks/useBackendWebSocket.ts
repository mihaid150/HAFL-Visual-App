// src/hooks/useBackendWebSocket.ts
import { useState, useEffect, useRef } from 'react';

export const useBackendWebSocket = (url: string) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<unknown>(null);

    useEffect(() => {
        console.log("[WS] Attempting connection to:", url);
        wsRef.current = new WebSocket(url);

        wsRef.current.onopen = () => {
            console.log("[WS] Connected to backend websocket:", url);
        };

        wsRef.current.onmessage = (event) => {
            console.log("[WS] Message received:", event.data);
            try {
                const message = JSON.parse(event.data);
                setLastMessage(message);
            } catch (error) {
                console.error("[WS] Error parsing WebSocket message", error);
            }
        };

        wsRef.current.onerror = (event) => {
            console.error("[WS] WebSocket error:", event);
        };

        wsRef.current.onclose = (event) => {
            console.log("[WS] WebSocket connection closed:", event);
        };

        return () => {
            console.log("[WS] Closing connection:", url);
            wsRef.current?.close();
        };
    }, [url]);

    const sendOperation = (operation: string, data: unknown): Promise<unknown> => {
        return new Promise((resolve, reject) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                console.error("[WS] Cannot send, WebSocket is not open. ReadyState:", wsRef.current?.readyState);
                reject("WebSocket is not open.");
                return;
            }

            const payload = { operation, data };
            console.log("[WS] Sending payload:", payload);

            const handleMessage = (event: MessageEvent) => {
                console.log("[WS] Received response for operation:", event.data);
                try {
                    const response = JSON.parse(event.data);
                    resolve(response);
                } catch {
                    reject("Error parsing WebSocket message");
                }
            };

            wsRef.current.addEventListener("message", handleMessage, { once: true });
            wsRef.current.send(JSON.stringify(payload));
        });
    };

    return { sendOperation, lastMessage };
};

export const sendOperationToUrl = (
    url: string,
    operation: string,
    data: unknown
): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        console.log("[sendOperationToUrl] Connecting to:", url);
        const ws = new WebSocket(url);
        ws.onopen = () => {
            const payload = { operation, data };
            console.log("[sendOperationToUrl] Connected. Sending payload:", payload);
            ws.send(JSON.stringify(payload));
            ws.onmessage = (event) => {
                console.log("[sendOperationToUrl] Received message:", event.data);
                try {
                    const response = JSON.parse(event.data);
                    resolve(response);
                } catch {
                    reject("Error parsing WebSocket message");
                }
                ws.close();
            };
        };
        ws.onerror = (err) => {
            console.error("[sendOperationToUrl] WebSocket error:", err);
            reject(err);
        };
        ws.onclose = (event) => {
            console.log("[sendOperationToUrl] Connection closed:", event);
        };
    });
};
