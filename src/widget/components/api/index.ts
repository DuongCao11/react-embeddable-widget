const INBOX_IDENTIFIER = 'JELyeKak6T3ASTXqoXzrqMer';
const API_URL = 'https://cs.obacker.com/public/api/v1';
const API_URL_1 = 'https://cs.obacker.com/api/v1';
const ACCOUNT_ID = 1;

interface ContactInput {
  name: string;
  email: string;
  phone: string;
}

export async function createContact({ name, email, phone }: ContactInput) {
  const res = await fetch(`${API_URL}/inboxes/${INBOX_IDENTIFIER}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone_number: phone }),
  });
  return res.json();
}

export async function createConversation(contactIdentifier: string) {
  const res = await fetch(
    `${API_URL}/inboxes/${INBOX_IDENTIFIER}/contacts/${contactIdentifier}/conversations`,
    { method: 'POST' },
  );
  return res.json();
}

interface SendMessageInput {
  contactIdentifier: string;
  conversationId: string;
  content: string;
  attachments?: File[];
}

export async function sendMessage({
  contactIdentifier,
  conversationId,
  content,
  attachments,
}: SendMessageInput) {
  const formData = new FormData();
  formData.append('content', content);
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append('attachments[]', file);
    });
  }
  const res = await fetch(
    `${API_URL}/inboxes/${INBOX_IDENTIFIER}/contacts/${contactIdentifier}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: formData,
    },
  );
  return res.json();
}

export async function getConversation(
  contactIdentifier: string,
  conversationId: string,
) {
  const res = await fetch(
    `${API_URL}/inboxes/${INBOX_IDENTIFIER}/contacts/${contactIdentifier}/conversations/${conversationId}`,
    { method: 'GET' },
  );
  return res.json();
}

export async function getAgents() {
  const res = await fetch(`${API_URL_1}/accounts/${ACCOUNT_ID}/agents`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      api_access_token: 'VGjRtEhTY7YW6foG1zj8f2TN',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  const data = await res.json();
  return data;
}

export async function getMessages(
  contactIdentifier: string,
  conversationId: string,
  beforeId?: number,
) {
  let url = `${API_URL}/inboxes/${INBOX_IDENTIFIER}/contacts/${contactIdentifier}/conversations/${conversationId}/messages`;
  if (beforeId) url += `?before=${beforeId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}

export async function updateContact(
  contactIdentifier: string,
  { name, email, phone }: ContactInput,
) {
  const res = await fetch(
    `${API_URL}/inboxes/${INBOX_IDENTIFIER}/contacts/${contactIdentifier}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone_number: phone,
      }),
    },
  );
  return res.json();
}

export async function getContact(contactIdentifier: string) {
  const res = await fetch(
    `${API_URL}/inboxes/${INBOX_IDENTIFIER}/contacts/${contactIdentifier}`,
    { method: 'GET' },
  );
  return res.json();
}

export async function getAllConversation(contactId: string) {
  const res = await fetch(
    `${API_URL_1}/accounts/${ACCOUNT_ID}/contacts/${contactId}/conversations`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        api_access_token: 'VGjRtEhTY7YW6foG1zj8f2TN',
      },
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return res.json();
}
