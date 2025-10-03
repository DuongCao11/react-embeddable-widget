import { Message, MessageGroup, Sender } from '../components/types';

export function formatUnixDate(unix: number): string {
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatUnixDateParts(unix: number): [string, string, number] {
  const d = new Date(unix * 1000);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return [day, month, year];
}

export function groupMessages(messages: Message[]) {
  if (!messages.length) return [];
  const groups: {
    senderId: string | number | undefined;
    minute: number;
    sender: Sender;
    messages: Message[];
  }[] = [];
  let currentGroup: MessageGroup | null = null;

  for (const msg of messages) {
    const senderId =
      msg.sender?.id ?? (msg.message_type === 0 ? 'me' : 'other');
    // Group by 2 minutes
    const minute = msg.created_at ? Math.floor(msg.created_at / 120) : 0;
    if (
      currentGroup &&
      currentGroup.senderId === senderId &&
      currentGroup.minute === minute
    ) {
      currentGroup.messages.push(msg);
    } else {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = {
        senderId,
        minute,
        sender: msg.sender,
        messages: [msg],
      };
    }
  }
  if (currentGroup) groups.push(currentGroup);
  return groups;
}

export interface MessageDayGroup {
  date: string; // YYYY-MM-DD
  messages: Message[];
}

export function groupMessagesByDay(messages: Message[]): MessageDayGroup[] {
  if (!messages.length) return [];
  const groups: MessageDayGroup[] = [];
  let currentDate = '';
  let currentGroup: MessageDayGroup | null = null;

  // Get today's date string in the same format
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  for (const msg of messages) {
    const d = new Date(msg.created_at * 1000);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // If date is today, use "today" as the key
    const groupKey = dateStr === todayStr ? 'today' : dateStr;
    if (groupKey !== currentDate) {
      if (currentGroup) groups.push(currentGroup);
      currentDate = groupKey;
      currentGroup = { date: groupKey, messages: [msg] };
    } else {
      currentGroup!.messages.push(msg);
    }
  }
  if (currentGroup) groups.push(currentGroup);
  return groups;
}

export function formatConversationTime(unix: number): string {
  const now = Date.now() / 1000;
  const diff = now - unix;
  if (diff < 60 * 60) {
    // dưới 1 giờ
    const mins = Math.floor(diff / 60);
    return `${mins > 0 ? mins : 1} phút trước`;
  }
  if (diff < 60 * 60 * 24) {
    // dưới 24 giờ
    const hours = Math.floor(diff / 3600);
    return `${hours} giờ trước`;
  }
  if (diff < 60 * 60 * 48) {
    return '1 ngày trước';
  }
  const d = new Date(unix * 1000);
  const nowDate = new Date();
  if (d.getFullYear() === nowDate.getFullYear()) {
    return `${d.getDate()} tháng ${d.getMonth() + 1}`;
  }
  return `${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
}
