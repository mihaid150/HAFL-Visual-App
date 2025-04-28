// src/hooks/useBackendWebSocket.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from "../store/storeHook.ts";
import { addStatusMessage } from "../store/statusSlice.ts";

export const useBackendWebSocket = (url: string) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<unknown>(null);
    const [connectionReady, setConnectionReady] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    // Wait for the connection to be open (without timing out)
    const waitForOpenConnection = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }, []);

    const connect = useCallback(() => {
        if (!url) {
            // If no URL, don't attempt a connection.
            console.log("No URL provided to WebSocket hook. Skipping connection.");
            return;
        }
        const ws = new WebSocket(url);
        ws.onopen = () => {
            console.log("[WS] Connected to backend websocket:", url);
            setConnectionReady(true);
        };
        ws.onmessage = (event) => {
            console.log("[WS] Message received:", event.data);
            try {
                const message = JSON.parse(event.data);
                if (message.type === "status_update") {
                    dispatch(addStatusMessage({
                        status: message.status,
                        message: message.message,
                        timestamp: message.timestamp,
                        code: message.code
                    }));
                }
                // Force a new object (if needed) before updating state
                setLastMessage({ ...message });
            } catch (error) {
                console.error("[WS] Error parsing WebSocket message", error);
            }
        };
        ws.onerror = (event) => {
            console.error("[WS] WebSocket error:", event);
        };
        ws.onclose = (event) => {
            console.log("[WS] WebSocket connection closed:", event);
            setConnectionReady(false);
            // Reconnect after 3 seconds
            setTimeout(() => {
                connect();
            }, 3000);
        };
        wsRef.current = ws;
    }, [url, dispatch]);

    useEffect(() => {
        // When the URL changes, establish a new connection.
        connect();

        // Cleanup: close the existing connection when the URL changes.
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [url, connect]);

    const sendOperation = useCallback(async (operation: string, data: unknown): Promise<unknown> => {
        await waitForOpenConnection();
        const payload = { operation, data };
        return new Promise((resolve, reject) => {
            const handleMessage = (event: MessageEvent) => {
                try {
                    const response = JSON.parse(event.data);
                    resolve(response);
                } catch {
                    reject("Error parsing WebSocket message");
                }
            };
            wsRef.current!.addEventListener("message", handleMessage, { once: true });
            wsRef.current!.send(JSON.stringify(payload));
        });
    }, [waitForOpenConnection]);

    return { sendOperation, lastMessage, connectionReady };
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
            ws.send(JSON.stringify(payload));
            ws.onmessage = (event) => {
                try {
                    const response = JSON.parse(event.data);
                    resolve(response);
                } catch {
                    reject("Error parsing WebSocket message");
                }
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
