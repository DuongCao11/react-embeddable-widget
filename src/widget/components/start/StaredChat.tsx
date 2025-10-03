import React from "react";
import "./index.css";
import { Agent, UserStatusMap } from "../types";

interface StaredChatProps {
    onStartChat: () => void;
    agents?: Agent[];
    status?: UserStatusMap;
    onClose?: () => void;
    isMobileScreen?: boolean;
}

const StaredChat: React.FC<StaredChatProps> = ({
    onStartChat,
    agents = [],
    status,
    onClose,
    isMobileScreen
}) => {

    const userOnline = agents.filter(agent => agent.availability_status === "online");
    let onlineAgents: Agent[] = [];
    if (status && agents.length > 0) {
        const onlineIds = Object.entries(status)
            .filter(([_, v]) => v === "online")
            .map(([id]) => Number(id));
        onlineAgents = agents.filter(agent => onlineIds.includes(agent.id));
    }


    const displayAgents = onlineAgents.length > 0 ? onlineAgents : userOnline.length > 0 ? userOnline : [];

    const maxShow = 3;
    const showAgents = displayAgents.slice(0, maxShow);
    const extraCount = displayAgents.length > maxShow ? displayAgents.length - maxShow : 0;

    return (
        <div className="guest-container">
            <div className="guest-header" style={{ position: "relative" }}>
                <div className="guest-logo" />
                {isMobileScreen && (
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: 20,
                            right: 12,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#888",
                        }}
                        aria-label="Đóng"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                )
                }

                <div className="guest-title">Hi there!</div>
                <div className="guest-subtitle">We make it simple to connect with us. Feel free to ask us anything or share your feedback.</div>
            </div>

            <div className="guest-content">
                <div className="guest-status">
                    <div className="status-row">
                        <div className="status-info">
                            <div className="status-title">We are away at the moment</div>
                            <div className="status-subtitle">Chúng tôi sẽ trả lời bạn trong vài phút</div>
                        </div>
                        <div className="agent-avatar-group">
                            {showAgents.map((agent, idx) => {
                                const firstChar = agent.name ? agent.name.trim().charAt(0).toUpperCase() : "A";
                                return (
                                    <img
                                        key={agent.id || idx}
                                        src={agent?.thumbnail || `https://ui-avatars.com/api/?name=${firstChar}&background=E5E7EB&color=193CB8&size=48`}
                                        alt={agent.name}
                                        className="agent-avatar"
                                    />
                                );
                            })}
                            {extraCount > 0 && (
                                <button
                                    className="agent-avatar-extra"
                                    type="button"
                                    tabIndex={-1}
                                    disabled
                                >
                                    +{extraCount}
                                </button>
                            )}
                        </div>
                    </div>
                    <button className="start-chat-btn" onClick={onStartChat}>
                        Bắt đầu trò chuyện &rarr;
                    </button>
                </div>

            </div>
        </div>
    );
};

export default React.memo(StaredChat);
