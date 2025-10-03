import {
  useState,
  useEffect,
  FC,
  useCallback,
  useRef
} from "react";
import "./widget.css";
import WidgetMinimizedButton from "./WidgetMinimizedButton";
import ChatPage from "./chat/ChatPage";
import StaredChat from "./start/StaredChat";
import GuestPage from "./guest-start/GuestPage";
import {
  Agent,
  Message,
  UserStatusMap,
  wsToMessage
} from "./types";
import {
  useChatwootRealtime
} from "./api/useChatwootRealtime";
import {
  getMessages,
  getContact
} from "./api";
import Header from "./header/Header";
import InfoUser from "./Info/InfoUser";
import History from "./history/History";
const ChatWidget: FC = () => {
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [step, setStep] = useState<"start" | "guest" | "chat">("start");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<UserStatusMap>();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isHistoryEnd, setIsHistoryEnd] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [previewMsg, setPreviewMsg] = useState<Message | null>(null);
  const [name, setName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const pubsubToken = localStorage.getItem("cw_pubsub_token");
  const accountId = 1;


  useEffect(() => {
    const contact = localStorage.getItem("cw_contact");
    const conversation = localStorage.getItem("cw_conversation");
    if (contact && conversation) {
      setStep("chat");
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    const res = await fetch("https://chatwoot-service-62171746835.asia-southeast1.run.app/agents");
    const data = await res.json();
    setAgents(data);
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const fetchAgentsRef = useRef(fetchAgents);
  useEffect(() => {
    fetchAgentsRef.current = fetchAgents;
  }, [fetchAgents]);

  const contactIdentifier = localStorage.getItem("cw_contact") || "";
  const conversationId = localStorage.getItem("cw_conversation") || "";

  useEffect(() => {
    async function fetchConversation() {
      if (contactIdentifier && conversationId) {
        const messages = await getMessages(contactIdentifier, conversationId);
        setMessages(messages);
        const myMsg = messages.find((m: Message) => m.message_type === 0 && m.sender?.name);
        if (myMsg) setName(myMsg.sender.name);
      }
    }
    fetchConversation();
  }, [contactIdentifier, conversationId, setMessages]);



  useChatwootRealtime(pubsubToken, accountId, useCallback((msg: Message) => {
    const newMsg = wsToMessage(msg);
    const hasAttachment = Array.isArray(newMsg.attachments) && newMsg.attachments.length > 0;
    const allAttachmentsReady = hasAttachment ? newMsg.attachments.every(att => !!att.data_url) : true;
    if (allAttachmentsReady) {
      if (hasAttachment) {
        setTimeout(() => {
          setMessages(prev => {
            const exists = prev.some(
              m => m.id === newMsg.id || (m.created_at && m.created_at === newMsg.created_at)
            );
            if (exists) return prev;
            return [...prev, newMsg];
          });

          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 1000);

        }, 2000);
      } else {
        setMessages(prev => {
          const exists = prev.some(
            m => m.id === newMsg.id || (m.created_at && m.created_at === newMsg.created_at)
          );
          if (exists) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
          });
          if (isMinimized) {
            setHasNewMessage(true);
            setPreviewMsg(newMsg);
          }
        }, 0);
      }
    }
  }, [isMinimized]), useCallback((status: UserStatusMap) => {
    setStatus(status);
  }, []));

  const handleStartChat = () => {
    if (localStorage.getItem("cw_contact") && localStorage.getItem("cw_conversation")) {
      setStep("chat");
    } else {
      setStep("guest");
    }
  };
  const handleGuestSubmit = () => {
    setStep("chat");
  };
  const handleClosePreview = () => {
    setHasNewMessage(false);
    setPreviewMsg(null);
  };
  const toggleWidget = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setHasNewMessage(false);
      setPreviewMsg(null);
    }
  };


  useEffect(() => {
    const contactIdentifier = localStorage.getItem("cw_contact") || "";
    if (contactIdentifier && profileOpen) {
      getContact(contactIdentifier).then((data) => {
        setUserInfo({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone_number || "",
        });
      });
    }
  }, [profileOpen]);

  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobileScreen(window.innerWidth <= 666.1);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <>
      {(!isMobileScreen || isMinimized) && (
        <WidgetMinimizedButton
          isMinimized={isMinimized}
          onClick={toggleWidget}
        />
      )}
      {isMinimized && hasNewMessage && previewMsg && (
        <div className="widget-preview-message">
          <div className="widget-preview-close-row">
            <button className="widget-preview-close-btn" onClick={handleClosePreview}>
              <span style={{ fontSize: 16, marginRight: 2 }}>✕</span>
            </button>
          </div>
          <div className="widget-preview-content" onClick={toggleWidget}>
            <div className="widget-preview-header">
              <div className="widget-preview-avatar">
                {previewMsg.sender.name ? previewMsg.sender.name[0].toUpperCase() : "A"}
                <span className="widget-preview-dot" />
              </div>
              <div>
                <span className="widget-preview-name">{previewMsg.sender.name || "Agent"}</span>
                <span className="widget-preview-from">from oBacker</span>
              </div>
            </div>
            <div className="widget-preview-text">{previewMsg.content}</div>
          </div>
        </div>
      )}
      {!isMinimized && (
        <div
          className="widget-container widget-fixed"
          style={{
            background: "#fff",
            boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
            zIndex: 2147483647,
            maxHeight: '80vh',
            height: '80%',
            overflow: 'auto',
          }}
        >
          {step === "start" && (
            <StaredChat
              onStartChat={handleStartChat}
              agents={agents}
              status={status}
              onClose={toggleWidget}
              isMobileScreen={isMobileScreen}
            />
          )}
          {step === "guest" && (
            <GuestPage onSubmit={handleGuestSubmit} onBack={() => setStep("start")} />
          )}
          {step === "chat" && (
            <div className="widget-messages-wrapper" style={{ position: "relative" }}>
              <div className="header-wrap" style={{ position: "relative" }}>
                <Header
                  status={status}
                  userName={userInfo?.name || name}
                  onBack={() => {
                    if (showHistory) {
                      setShowHistory(false);
                    } else if (localStorage.getItem("cw_contact") && localStorage.getItem("cw_conversation")) {
                      setStep("start");
                    } else {
                      setStep("guest");
                    }
                  }}
                  type={true}
                  setProfileOpen={setProfileOpen}
                  profileOpen={profileOpen}
                  userInfo={userInfo}
                  setShowHistory={setShowHistory}
                  showHistory={showHistory}
                />
                {profileOpen && (
                  <div
                    className="header-dim"
                    onClick={() => setProfileOpen(false)}
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      background: "rgba(30,35,93,0.85)",
                      cursor: "pointer"
                    }}
                  />
                )}
              </div>
              {showHistory ? (
                <History
                  onSelectConversation={async () => {
                    setShowHistory(false);
                    await new Promise(resolve => setTimeout(resolve, 400));
                    setStep("chat");
                    setFetchMessage(true);
                  }}
                />
              ) : profileOpen && userInfo ? (
                <div className="sheet-wrap">
                  <InfoUser
                    userInfo={userInfo}
                    onCancel={() => setProfileOpen(false)}
                    onSave={() => setProfileOpen(false)}
                    setUserInfo={setUserInfo}
                  />
                </div>
              ) : (
                <ChatPage
                  messages={messages}
                  setMessages={setMessages}
                  messagesEndRef={messagesEndRef}
                  isHistoryEnd={isHistoryEnd}
                  setIsHistoryEnd={setIsHistoryEnd}
                />
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;