// src/hooks/useBackendWebSocket.ts

import { useState, useEffect, useRef } from 'react';

export const useBackendWebSocket = (url: string) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<unknown>(null);

    useEffect(() => {
        console.log(url)
        wsRef.current = new WebSocket(url);
        wsRef.current.onopen = () => {
            console.log("Connected to backend websocket.");
        };

        wsRef.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                setLastMessage(message);
            } catch (error) {
                console.error("Error parsing WebSocket message", error);
            }
        };
        wsRef.current.onclose = () => {
            console.log("WebSocket connection closed.");
        };
        return () => {
            wsRef.current?.close();
        };
    }, [url]);

    const sendOperation = (operation: string, data: unknown): Promise<unknown> => {
        return new Promise((resolve, reject) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                reject("WebSocket is not open.");
                return;
            }

            const payload = { operation, data };

            const handleMessage = (event: MessageEvent) => {
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
}

export const sendOperationToUrl = (
    url: string,
    operation: string,
    data: unknown
): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(url);
        ws.onopen = () => {
            const payload = { operation, data };
            console.log(payload);
            ws.send(JSON.stringify(payload));
            ws.onmessage = (event) => {
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
            reject(err);
        };
    });
};
