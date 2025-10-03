import React, { useState, useEffect } from "react";
import "./index.css";
import { Conversation } from "../types/conversation";
import { formatConversationTime } from "../../shared/common";

interface HistoryProps {
    onSelectConversation: () => void;
}

const History: React.FC<HistoryProps> = ({ onSelectConversation }) => {
    const [tab, setTab] = useState<"all" | "unread">("all");
    const [search, setSearch] = useState("");
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        const fetchConversations = async () => {
            const contactId = localStorage.getItem("contact_id");
            if (!contactId) {
                setConversations([]);
                return;
            }

            try {
                const res = await fetch(`http://localhost:4000/conversations?contact_id=${contactId}`);
                const data = await res.json();
                if (data && Array.isArray(data.payload)) {
                    setConversations(data.payload);
                } else {
                    setConversations([]);
                }
            } catch {
                setConversations([]);
            }
        };

        fetchConversations();
    }, []);

    const handleConversationClick = (conversationId: number, contactId: string) => {
        localStorage.setItem("cw_conversation", conversationId.toString());
        localStorage.setItem("cw_contact", contactId.toString());
        if (onSelectConversation) {
            onSelectConversation();
        }
    }

    console.log("Render History, conversations:", conversations);
    return (
        <div className="history-container">
            {/* Tabs */}
            <div className="history-tabs">
                <button
                    className="history-tab-button"
                    style={{
                        background: tab === "all" ? "#fff" : "none",
                    }}
                    onClick={() => setTab("all")}
                >
                    All<span>(10)</span>
                </button>
                <button
                    className="history-tab-button"
                    style={{
                        background: tab === "unread" ? "#fff" : "none",
                    }}
                    onClick={() => setTab("unread")}
                >
                    Unread<span>(10)</span>

                </button>
            </div>
            {/* Search */}
            <div className="history-search-container">
                <div className="history-search-icon" >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M6.41667 11.0833C8.994 11.0833 11.0833 8.994 11.0833 6.41667C11.0833 3.83934 8.994 1.75 6.41667 1.75C3.83934 1.75 1.75 3.83934 1.75 6.41667C1.75 8.994 3.83934 11.0833 6.41667 11.0833Z" stroke="#A1A1A8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12.2499 12.2499L9.7124 9.7124" stroke="#A1A1A8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="history-search-input"

                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="history-clear-button"
                        aria-label="Clear"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M10.5 3.5L3.5 10.5" stroke="#A1A1A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3.5 3.5L10.5 10.5" stroke="#A1A1A8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="history-conversation-list">
                {conversations.map(conv => {
                    const assignee = conv.meta?.assignee;
                    const displayName = assignee?.name || "Obacker";
                    const avatar = assignee?.thumbnail;
                    const lastMessage =
                        conv.last_non_activity_message?.content ||
                        conv.messages?.[conv.messages.length - 1]?.content ||
                        "";
                    const contactId = conv.last_non_activity_message?.conversation.contact_inbox.source_id;
                    console.log("Conversation:", conv.id, "contactId:", contactId);
                    const type = conv.last_non_activity_message?.message_type;
                    return (
                        <div key={conv.id} className="history-conversation-item" onClick={() => handleConversationClick(conv.id, conv.last_non_activity_message.conversation.contact_inbox.source_id)}>
                            <div className="history-conversation-avatar">
                                {avatar ? (
                                    <img
                                        src={avatar}
                                        alt={displayName}
                                        style={{ width: 36, height: 36, borderRadius: "50%" }}
                                    />
                                ) : (
                                    <span>
                                        {displayName
                                            .split(" ")
                                            .map((w: string) => w[0])
                                            .join("")
                                            .toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {/* Info */}
                            <div className="history-conversation-info">
                                <p className="history-conversation-name">{type === 0 ? "Bạn" : displayName}</p>
                                <div className="history-conversation-message-time">
                                    <div className="history-conversation-message">{lastMessage}</div>
                                    <p className="history-conversation-time">{formatConversationTime(conv.last_non_activity_message.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default History;
