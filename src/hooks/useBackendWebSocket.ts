import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from "../store/storeHook.ts";
import { addStatusMessage } from "../store/statusSlice.ts";

function isValidWebSocketUrl(url?: string): url is string {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
    } catch {
        return false;
    }
}

export const useBackendWebSocket = (url?: string) => {
    const wsRef = useRef<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<unknown>(null);
    const [connectionReady, setConnectionReady] = useState(false);
    const dispatch = useAppDispatch();

    const waitForOpenConnection = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            const iv = setInterval(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    clearInterval(iv);
                    resolve();
                }
            }, 100);
        });
    }, []);

    const connect = useCallback(() => {
        // We know url is valid here
        const ws = new WebSocket(url!);
        ws.onopen = () => {
            console.log("[WS] Connected to backend websocket:", url);
            setConnectionReady(true);
        };
        ws.onmessage = (ev) => {
            try {
                const msg = JSON.parse(ev.data);
                if (msg.type === "status_update") {
                    dispatch(addStatusMessage(msg));
                }
                setLastMessage({ ...msg });
            } catch (err) {
                console.error("[WS] parse error", err);
            }
        };
        ws.onerror = (ev) => console.error("[WS] error", ev);
        ws.onclose = (ev) => {
            console.log("[WS] closed", ev);
            setConnectionReady(false);
            setTimeout(connect, 3000);
        };
        wsRef.current = ws;
    }, [url, dispatch]);

    useEffect(() => {
        let poller: ReturnType<typeof setInterval> | null = null;

        if (isValidWebSocketUrl(url)) {
            connect();
        } else {
            console.warn("[WS] waiting for a valid URL before connecting…");
            poller = window.setInterval(() => {
                if (isValidWebSocketUrl(url)) {
                    clearInterval(poller!);
                    connect();
                }
            }, 1000);
        }

        return () => {
            if (poller) clearInterval(poller);
            wsRef.current?.close();
        };
    }, [url, connect]);

    const sendOperation = useCallback(async (operation: string, data: unknown) => {
        await waitForOpenConnection();
        const payload = { operation, data };
        return new Promise<unknown>((resolve, reject) => {
            const handler = (ev: MessageEvent) => {
                try {
                    resolve(JSON.parse(ev.data));
                } catch {
                    reject("Invalid JSON in response");
                }
            };
            wsRef.current!.addEventListener("message", handler, { once: true });
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
