export interface Agent {
  account_id: number;
  auto_offline: boolean;
  availability_status: string;
  available_name: string;
  confirmed: boolean;
  custom_role_id: number | null;
  email: string;
  id: number;
  name: string;
  role: string;
  thumbnail?: string;
}

export interface UserStatusMap {
  [id: number]: 'online' | 'offline' | 'busy';
}

export interface Attachment {
  id: number;
  account_id: number;
  message_id: number;
  data_url: string;
  file_type: string;
  file_size: number;
  extension: string | null;
  thumb_url: string;
  width: number | null;
  height: number | null;
}

export interface Sender {
  id?: number;
  name?: string;
  available_name?: string;
  avatar_url?: string;
  type?: string;
  email?: string;
  phone_number?: string;
  thumbnail?: string;
  blocked?: boolean;
  additional_attributes?: { [key: string]: unknown };
  custom_attributes?: { [key: string]: unknown };
  identifier?: string | null;
}

export interface Message {
  id: number;
  content: string;
  message_type: number;
  content_type: string;
  content_attributes: { [key: string]: unknown };
  attachments: Attachment[];

  created_at: number;
  conversation_id: number;
  sender: Sender;
}

export interface RawMessage {
  id: number;
  content: string;
  message_type: number;
  content_type: string;
  content_attributes?: { [key: string]: unknown };
  created_at: number;
  conversation_id: number;
  sender?: Sender;
  attachments?: Attachment[];
}

export function wsToMessage(msg: RawMessage): Message {
  return {
    id: msg.id,
    content: msg.content,
    message_type: msg.message_type,
    content_type: msg.content_type,
    content_attributes: msg.content_attributes ?? {},
    created_at: msg.created_at,
    conversation_id: msg.conversation_id,
    sender: {
      id: msg.sender?.id,
      name: msg.sender?.name,
      available_name: msg.sender?.available_name,
      avatar_url: msg.sender?.avatar_url,
      type: msg.sender?.type,
      email: msg.sender?.email,
      phone_number: msg.sender?.phone_number,
      thumbnail: msg.sender?.thumbnail,
      blocked: msg.sender?.blocked,
      additional_attributes: msg.sender?.additional_attributes ?? {},
      custom_attributes: msg.sender?.custom_attributes ?? {},
      identifier: msg.sender?.identifier ?? null,
    },
    attachments: msg.attachments ?? [],
  };
}

export interface MessageGroup {
  senderId: string | number | undefined;
  minute: number;
  sender: Sender;
  messages: Message[];
}
