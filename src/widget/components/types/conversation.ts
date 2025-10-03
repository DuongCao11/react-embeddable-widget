export interface ConversationResponse {
  payload: Conversation[];
}

export interface Conversation {
  meta: {
    sender: Sender;
    channel: string;
    assignee: Assignee;
    hmac_verified: boolean;
  };
  id: number;
  messages: Message[];
  account_id: number;
  uuid: string;
  additional_attributes: Record<string, unknown>;
  agent_last_seen_at: number;
  assignee_last_seen_at: number;
  can_reply: boolean;
  contact_last_seen_at: number;
  custom_attributes: Record<string, unknown>;
  inbox_id: number;
  labels: string[];
  muted: boolean;
  snoozed_until: string | null;
  status: string;
  created_at: number;
  updated_at: number;
  timestamp: number;
  first_reply_created_at: number;
  unread_count: number;
  last_non_activity_message: Message;
  last_activity_at: number;
  priority: number | null;
  waiting_since: number;
  sla_policy_id: number | null;
}

export interface Sender {
  additional_attributes: Record<string, unknown>;
  availability_status: string;
  email: string;
  id: number;
  name: string;
  phone_number: string;
  blocked: boolean;
  identifier: string | null;
  thumbnail: string;
  custom_attributes: Record<string, unknown>;
  last_activity_at: number;
  created_at: number;
  type?: string;
}

export interface Assignee {
  id: number;
  account_id: number;
  availability_status: string;
  auto_offline: boolean;
  confirmed: boolean;
  email: string;
  available_name: string;
  name: string;
  role: string;
  thumbnail: string;
  custom_role_id: number | null;
}

export interface Message {
  id: number;
  content: string;
  account_id: number;
  inbox_id: number;
  conversation_id: number;
  message_type: number;
  created_at: number;
  updated_at: string;
  private: boolean;
  status: string;
  source_id: string | null;
  content_type: string;
  content_attributes: Record<string, unknown>;
  sender_type: string;
  sender_id: number;
  external_source_ids: Record<string, unknown>;
  additional_attributes: Record<string, unknown>;
  processed_message_content: string;
  sentiment: Record<string, unknown>;
  conversation: MessageConversationDetails;
  sender: Sender;
}

export interface MessageConversationDetails {
  assignee_id: number;
  unread_count: number;
  last_activity_at: number;
  contact_inbox: {
    source_id: string;
  };
}
