import React, { useState, useRef, useEffect } from "react";
import "./index.css";
import { UserStatusMap } from "../types";


interface HeaderProps {
    onBack?: () => void;
    status?: UserStatusMap;
    profileOpen?: boolean;
    setProfileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    type?: boolean;
    userName?: string;
    userInfo?: { name: string; email: string; phone: string } | null;
    setShowHistory?: React.Dispatch<React.SetStateAction<boolean>>;
    showHistory?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onBack, status, setProfileOpen, type, userName, userInfo, setShowHistory, showHistory }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const moreBtnRef = useRef<HTMLButtonElement>(null);
    const hasOnline = status && Object.values(status).includes("online");

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (!menuOpen) return;
            if (menuRef.current?.contains(target)) return;
            if (moreBtnRef.current?.contains(target)) return;
            setMenuOpen(false);
        }
        window.addEventListener("mousedown", handleClickOutside); // dùng lại "mousedown"
        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);


    return (
        <div className="guest-header-row">
            <div className="guest-header-left">
                <button className="guest-back-btn" aria-label="Back" onClick={onBack}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="15" viewBox="0 0 9 15" fill="none">
                        <path d="M7.25 13.8591L1.25 7.85913L7.25 1.85913" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                {!showHistory &&
                    <div className="guest-header-info">
                        <div className="guest-header-title">
                            <span className="guest-header-brand">Obacker</span>
                            {hasOnline && <span className="guest-header-dot" />}
                        </div>
                        <p className="guest-header-desc">
                            Chúng tôi thường trả lời trong vài phút
                        </p>
                    </div>
                }
                {showHistory &&
                    <div className="guest-header-info">
                        <div className="guest-header-title">
                            <span className="guest-header-brand">Lịch sử trò chuyện</span>
                        </div>

                    </div>
                }
            </div>
            {type && (
                <div className="guest-header-right" style={{ position: "relative" }}>
                    <button className="guest-search-btn" aria-label="Search" >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>
                    </button>
                    {!showHistory && (
                        <button
                            className="guest-search-more"
                            aria-label="More"
                            ref={moreBtnRef}
                            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }} // ngăn mousedown gây toggle ngoài ý muốn
                            onClick={() => {
                                setMenuOpen(prev => !prev);
                                if (setProfileOpen) setProfileOpen(false);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                        </button>
                    )}
                    {menuOpen && (
                        <div
                            ref={menuRef}
                            className="guest-header-menu"
                            onMouseDown={e => e.stopPropagation()}
                        >
                            <div className="guest-header-menu-arrow" onClick={() => {
                                if (setShowHistory) setShowHistory(true);
                                setMenuOpen(false);
                            }}>
                                <p >Lịch sử trò chuyện</p>
                            </div>
                            <div className="guest-header-menu-divider" />
                            <div
                                className="guest-header-menu-arrow"
                                style={{ position: "relative" }}
                                onClick={() => {
                                    if (setProfileOpen) setProfileOpen(true);
                                    setMenuOpen(false);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="guest-header-menu-arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                <p className="guest-header-menu-name">{userInfo?.name || userName}</p>
                            </div>
                            <div
                                className="guest-header-menu-arrow"
                                onClick={() => {
                                    setMenuOpen(false);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="guest-header-menu-arrow-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /></svg>

                                <p className="guest-header-menu-name">Log out</p>
                            </div>
                        </div>
                    )}

                </div>
            )
            }

        </div>

    );
};

export default React.memo(Header);
