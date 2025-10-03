import React from "react";
import "./widget.css";

interface Props {
    isMinimized: boolean;
    onClick: () => void;
}

const WidgetMinimizedButton: React.FC<Props> = ({ isMinimized, onClick }) => (
    <div
        className={`widget-minimized widget-fixed${isMinimized ? " animate-pulse-scale" : ""}`}
        onClick={onClick}
        style={{ zIndex: 1003 }}
    >
        {isMinimized ? (
            <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="20" fill="url(#chatGradient)" />
                <g>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" x="8" y="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                        <path d="M8 12h.01" />
                        <path d="M12 12h.01" />
                        <path d="M16 12h.01" />
                    </svg>
                </g>
                <defs>
                    <linearGradient id="chatGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#7B6EF6" />
                        <stop offset="1" stopColor="#8F5FE8" />
                    </linearGradient>
                </defs>
            </svg>
        ) : (
            // X icon
            <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="20" fill="url(#chatGradient)" />
                <g>
                    <line x1="14" y1="14" x2="26" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="26" y1="14" x2="14" y2="26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </g>
                <defs>
                    <linearGradient id="chatGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#7B6EF6" />
                        <stop offset="1" stopColor="#8F5FE8" />
                    </linearGradient>
                </defs>
            </svg>
        )}
    </div>
);

export default React.memo(WidgetMinimizedButton);
