import { useEffect, useRef } from 'react';
import { Message, UserStatusMap } from '../types';

const CHATWOOT_WS = 'wss://cs.obacker.com/cable';

export function useChatwootRealtime(
  pubsubToken: string | null | undefined,
  accountId: number | null | undefined,
  onMessage?: (msg: Message) => void,
  onStatus?: (status: UserStatusMap) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const hbRef = useRef<number | null>(null);

  useEffect(() => {
    if (!pubsubToken || !accountId) return;
    console.log('Starting Chatwoot WS...', { pubsubToken, accountId });
    const ws = new WebSocket(CHATWOOT_WS);
    wsRef.current = ws;

    const identifier = JSON.stringify({
      channel: 'RoomChannel',
      pubsub_token: pubsubToken,
      account_id: Number(accountId),
    });

    const sendPresence = () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            command: 'message',
            identifier,
            data: JSON.stringify({ action: 'update_presence' }),
          }),
        );
      }
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          command: 'subscribe',
          identifier,
        }),
      );
      // gửi presence ban đầu + heartbeat mỗi 25s
      sendPresence();
      hbRef.current = window.setInterval(sendPresence, 25_000);
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const evt = parsed?.message?.event;
        if (evt === 'message.created' && parsed.message.data) {
          onMessage?.(parsed.message.data);
        }

        if (evt === 'presence.update' && parsed.message.data) {
          onStatus?.(parsed.message.data.users);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = (e) => {
      console.warn('Chatwoot WS error:', e);
    };

    ws.onclose = (e) => {
      console.warn('Chatwoot WS closed:', e.code, e.reason);
    };

    return () => {
      if (hbRef.current) clearInterval(hbRef.current);
      try {
        ws.close(1000, 'unmount');
      } catch {
        // ignore if already closed
      }
      wsRef.current = null;
    };
  }, [pubsubToken, accountId, onMessage, onStatus]);
}
