import React, { useState, useEffect, useRef } from "react";
import "./index.css";
import { getMessages, sendMessage } from "../api";
import { Message } from "../types";
import { formatUnixDate, groupMessages, groupMessagesByDay } from "../../shared/common";

interface ChatPageProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    isHistoryEnd: boolean;
    setIsHistoryEnd: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatPage: React.FC<ChatPageProps> = ({ messages, setMessages,
    messagesEndRef, isHistoryEnd, setIsHistoryEnd }) => {
    const [input, setInput] = useState<string>("");
    const msgContainerRef = useRef<HTMLDivElement | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileLoading, setFileLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const contactIdentifier = localStorage.getItem("cw_contact") || "";
    const conversationId = localStorage.getItem("cw_conversation") || "";

    const allowedExtensions = [
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        ".txt", ".rtf", ".odt", ".ods", ".odp",
        ".csv", ".json", ".xml",
        ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif",
        ".zip", ".rar", ".7z"
    ];

    const isFileAllowed = (file: File) => {
        const ext = "." + file.name.split('.').pop()?.toLowerCase();
        return allowedExtensions.includes(ext);
    };

    const handleScroll = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
        if (
            e.currentTarget.scrollTop === 0 &&
            !loadingMore &&
            !isHistoryEnd &&
            messages.length >= 20
        ) {
            setLoadingMore(true);
            const oldestId = messages[0].id;
            const more = await getMessages(contactIdentifier, conversationId, oldestId);
            if (more.length === 0) {
                setIsHistoryEnd(true);
            } else {
                setMessages(prev => [...more, ...prev]);
            }
            setLoadingMore(false);
        }
    };

    // console.log("Render ChatPage, messages:", messages);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

    const sendMsg = async (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;
        const contactIdentifier = localStorage.getItem("cw_contact") || "";
        const conversationId = localStorage.getItem("cw_conversation") || "";
        setInput("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "24px";
        }
        if (contactIdentifier && conversationId) {
            await sendMessage({
                contactIdentifier,
                conversationId,
                content: input,
            });
        }

    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleSendFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const contactIdentifier = localStorage.getItem("cw_contact") || "";
        const conversationId = localStorage.getItem("cw_conversation") || "";
        if (files && files.length > 0 && contactIdentifier && conversationId) {
            const fileExts = Array.from(files).map(file => {
                const ext = file.name.split('.').pop()?.toLowerCase();
                return ext ? `.${ext}` : "";
            });
            const validFiles = Array.from(files).filter(isFileAllowed);
            if (validFiles.length === 0) {
                setErrorMsg("Không hỗ trợ file với đuôi: " + fileExts.join(", "));
                setTimeout(() => setErrorMsg(null), 4000);
                e.target.value = "";
                return;
            }
            setFileLoading(true);
            await sendMessage({
                contactIdentifier,
                conversationId,
                content: "",
                attachments: validFiles,
            });
            setTimeout(() => setFileLoading(false), 2000);
        }
        e.target.value = "";
    };

    // Thêm hàm format ngày kiểu "31 tháng 12, 2024" hoặc "Hôm nay"
    function formatDateVN(dateStr: string) {
        if (dateStr === "today") return "Hôm nay";
        const [year, month, day] = dateStr.split("-");
        return `${parseInt(day)} tháng ${parseInt(month)}, ${year}`;
    }

    return (
        <div className="widget-messages-container">
            <div className="widget-messages" style={{ position: "relative" }}>
                {errorMsg && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 10,
                            background: "#ffebee",
                            color: "#d32f2f",
                            padding: "8px 12px",
                            textAlign: "center",
                            fontSize: 14,
                            fontWeight: 500,
                            borderRadius: "6px 6px 0 0"
                        }}
                    >
                        {errorMsg}
                    </div>
                )}
                {/* <div className="tabs-outer">
                    <div className="tabs-inner">
                        <button className="tab-btn tab-active">Chat</button>
                        <button className="tab-btn">Files</button>
                    </div>
                </div> */}
                <div className="msg-list-container" ref={msgContainerRef} onScroll={handleScroll}>
                    {loadingMore && (
                        <div style={{ textAlign: "center", padding: "4px", color: "#292929" }}>
                            Đang tải thêm...
                        </div>
                    )}
                    {groupMessagesByDay(
                        messages.filter(msg => !(msg.content_attributes && msg.content_attributes.deleted))
                    ).map((dayGroup) => (
                        <React.Fragment key={dayGroup.date}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                margin: "18px 0 18px 0"
                            }}>
                                <div className="chat-driver" />
                                <span style={{
                                    color: "#595959",
                                    fontWeight: 500,
                                    fontSize: 16,
                                    whiteSpace: "nowrap"
                                }}>
                                    {formatDateVN(dayGroup.date)}
                                </span>
                                <div className="chat-driver" />
                            </div>
                            {groupMessages(dayGroup.messages).map((group, groupIdx) => {
                                const isMyMessage = group.messages[0].message_type === 0;
                                return (
                                    <div key={groupIdx} className={`msg-group ${isMyMessage ? "me" : "other"}`}>
                                        {group.messages.map((msg, i) => {
                                            const fileAttachments = (msg.attachments || []).filter(att => att.file_type === "file");
                                            const imageAttachments = (msg.attachments || []).filter(att => att.file_type === "image");
                                            const showAvatar = i === 0 && !isMyMessage;
                                            const showMeta = i === group.messages.length - 1;
                                            return (
                                                <div
                                                    key={msg.id || msg.created_at || i}
                                                    className={[
                                                        "msg-row",
                                                        isMyMessage ? "me" : "other",
                                                        i > 0 ? "msg-row-in-group" : ""
                                                    ].filter(Boolean).join(" ")}
                                                >
                                                    <div className="msg-bubble-wrap">
                                                        {/* Always render avatar area for alignment */}
                                                        {(!isMyMessage) && (
                                                            showAvatar ? (
                                                                (() => {
                                                                    const firstChar = group.sender?.available_name
                                                                        ? group.sender.available_name.trim().charAt(0).toUpperCase()
                                                                        : "A";
                                                                    return (
                                                                        <img
                                                                            key={group.sender?.id || i}
                                                                            src={group.sender?.thumbnail || `https://ui-avatars.com/api/?name=${firstChar}&background=E5E7EB&color=193CB8&size=48`}
                                                                            alt={group.sender?.name}
                                                                            className="chat-avatar"
                                                                        />
                                                                    );
                                                                })()
                                                            ) : (
                                                                // Placeholder avatar for alignment
                                                                <span className="chat-avatar" />
                                                            )
                                                        )}
                                                        <div className={`${isMyMessage ? "msg-bubble-meta-wrap-me" : "msg-bubble-meta-wrap-other"}`}>
                                                            <div className={[
                                                                "msg-bubble",
                                                                isMyMessage ? "me-bubble" : "other-bubble",
                                                                (fileAttachments.length > 0 || imageAttachments.length > 0) ? "has-attachment" : ""
                                                            ].filter(Boolean).join(" ")}>
                                                                {fileAttachments.map((att, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="attachment-file"
                                                                    >
                                                                        <div className="attachment-icon">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-icon lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
                                                                        </div>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div className={`${isMyMessage ? "attachment-filename-me" : "attachment-filename-other"} attachment-filename`}>
                                                                                {decodeURIComponent(att.data_url.split('/').pop() || "")}
                                                                            </div>
                                                                            <a
                                                                                href={att.data_url}
                                                                                download
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className={`${isMyMessage ? "attachment-download-me" : "attachment-download-other"} attachment-download`}
                                                                            >
                                                                                Download
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {/* Render image attachments */}
                                                                {imageAttachments.map((att, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="attachment-image"
                                                                        style={{ alignItems: "flex-start" }}
                                                                    >

                                                                        <div >
                                                                            <div className="attachment-image-wrap">
                                                                                <a
                                                                                    href={att.data_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="attachment-image-link"
                                                                                >
                                                                                    <img
                                                                                        src={att.thumb_url || att.data_url}
                                                                                        className="attachment-image"
                                                                                        alt={decodeURIComponent(att.data_url.split('/').pop() || "")}
                                                                                    />
                                                                                </a>
                                                                            </div>

                                                                            <div className="attachment-image-info">
                                                                                <div className="attachment-icon">
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-icon lucide-file"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
                                                                                </div>
                                                                                <div className="attachment-image-info-name">
                                                                                    <div className={`${isMyMessage ? "attachment-filename-me" : "attachment-filename-other"} attachment-filename`}>
                                                                                        {decodeURIComponent(att.data_url.split('/').pop() || "")}
                                                                                    </div>
                                                                                    <a
                                                                                        href={att.data_url}
                                                                                        download
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className={`${isMyMessage ? "attachment-download-me" : "attachment-download-other"} attachment-download`}
                                                                                    >
                                                                                        Download
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Nội dung tin nhắn */}
                                                                <div className={`${isMyMessage ? "msg-content-me" : "msg-content-other"}`}>
                                                                    {(typeof msg.content === "string" && msg.content)
                                                                        ? msg.content.split('\n').map((line, idx) => (
                                                                            <React.Fragment key={idx} >
                                                                                {line}
                                                                                {idx < msg.content.split('\n').length - 1 && <br />}
                                                                            </React.Fragment>
                                                                        ))
                                                                        : null}
                                                                </div>
                                                            </div>
                                                            {showMeta && (
                                                                <div className={`${isMyMessage ? "me-meta" : "other-meta"} msg-meta-wrap`}>
                                                                    {!isMyMessage && (
                                                                        <span className="msg-sender-name">
                                                                            {group.sender?.available_name || group.sender?.name || "Agent"}
                                                                        </span>
                                                                    )}
                                                                    {msg.created_at && (
                                                                        <span className={`msg-meta `}>
                                                                            {formatUnixDate(msg.created_at)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {/* Input */}
                <form
                    className="chat-input-bar"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (input.trim()) sendMsg();
                    }}
                >
                    <button
                        className="input-btn circle-btn gray-hover"
                        onClick={handleFileButtonClick}
                        type="button"
                        disabled={fileLoading}
                    >
                        {fileLoading ? (
                            <svg width="20" height="20" viewBox="0 0 50 50">
                                <circle
                                    cx="25"
                                    cy="25"
                                    r="20"
                                    fill="none"
                                    stroke="#bdbdbd"
                                    strokeWidth="4"
                                    strokeDasharray="31.4 31.4"
                                    strokeDashoffset="0"
                                >
                                    <animateTransform
                                        attributeName="transform"
                                        type="rotate"
                                        from="0 25 25"
                                        to="360 25 25"
                                        dur="0.7s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            </svg>
                        ) : (
                            <svg width="20" height="20" fill="#bdbdbd" viewBox="0 0 24 24">
                                <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                            </svg>
                        )}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleSendFile}
                    />

                    <textarea
                        ref={textareaRef}
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        rows={1}
                        className="input-textarea"
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            const value = target.value;
                            const lineCount = value.split("\n").length;
                            target.style.height = "auto";
                            target.style.height = Math.min(lineCount * 24, 70) + "px";
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                e.currentTarget.form?.requestSubmit();
                            }
                        }}
                    />

                    <button
                        className="input-btn circle-btn-send orange-hover"
                        type="submit"
                        disabled={!input.trim()}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M23.4848 11.5125L1.07853 0.278547C0.987459 0.233011 0.882995 0.222297 0.783887 0.246404C0.673893 0.273596 0.579155 0.343266 0.520417 0.440158C0.46168 0.53705 0.443728 0.653269 0.470494 0.763368L2.77942 10.1973C2.81424 10.3393 2.91871 10.4544 3.05799 10.5L7.01424 11.858L3.06067 13.216C2.92139 13.2643 2.81692 13.3768 2.78478 13.5187L0.470494 22.966C0.446387 23.0652 0.457102 23.1696 0.502637 23.258C0.607102 23.4696 0.864245 23.5553 1.07853 23.4509L23.4848 12.2812C23.5678 12.241 23.6348 12.1714 23.6776 12.091C23.7821 11.8768 23.6964 11.6196 23.4848 11.5125ZM3.11157 20.2821L4.45889 14.775L12.366 12.0616C12.4276 12.0402 12.4785 11.9919 12.5 11.9277C12.5375 11.8152 12.4785 11.6946 12.366 11.6544L4.45889 8.94373L3.11692 3.45801L19.9384 11.8928L3.11157 20.2821Z"
                                fill="#193CB8"
                            />
                        </svg>
                    </button>
                </form>

            </div>
        </div>
    );
};

export default React.memo(ChatPage);

