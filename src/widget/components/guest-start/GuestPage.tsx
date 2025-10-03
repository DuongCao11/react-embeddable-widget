import React, { useState } from "react";
import "./index.css";
import Header from "../header/Header";
import { createContact, createConversation, sendMessage } from "../api";

interface GuestPageProps {
    onSubmit: (name: string, email: string, phone: string, message: string) => void;
    onBack?: () => void;
}

const GuestPage: React.FC<GuestPageProps> = ({ onSubmit, onBack }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState<{ email?: string; name?: string; message?: string; phone?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newError: { email?: string; name?: string; message?: string; phone?: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Validate phone: 02xxxxxxxxx (11 số) hoặc 0xxxxxxxxx (10 số, không phải 02)
        let phoneValid = false;
        if (phone.trim().startsWith("02")) {
            phoneValid = /^02\d{9}$/.test(phone.trim());
        } else if (phone.trim().startsWith("0")) {
            phoneValid = /^0\d{9}$/.test(phone.trim());
        }
        if (!email.trim()) {
            newError.email = "Vui lòng nhập email";
        } else if (!emailRegex.test(email.trim())) {
            newError.email = "Email không hợp lệ";
        }
        if (!name.trim()) newError.name = "Vui lòng nhập tên";
        if (!phone.trim()) {
            newError.phone = "Vui lòng nhập số điện thoại";
        } else if (!phoneValid) {
            newError.phone = "Số điện thoại không hợp lệ (02xxxxxxxxx hoặc 0xxxxxxxxx)";
        }
        if (!message.trim()) newError.message = "Vui lòng nhập nội dung tin nhắn";
        setError(newError);
        if (newError.email || newError.name || newError.message || newError.phone) return;

        let phoneToSend = phone.trim();
        if (/^0\d{9,10}$/.test(phoneToSend)) {
            phoneToSend = "+84" + phoneToSend.substring(1);
        }

        const { contact } = await handleGuestSubmit(name, email, phoneToSend, message);
        onSubmit(contact.name, contact.email, contact.phone_number, message);
    };

    async function handleGuestSubmit(
        name: string,
        email: string,
        phone: string,
        message: string
    ) {
        const contact = await createContact({ name, email, phone });
        const conversation = await createConversation(contact.source_id);
        const sentMessage = await sendMessage({
            contactIdentifier: contact.source_id,
            conversationId: conversation.id,
            content: message
        });
        localStorage.setItem('cw_conversation', conversation.id)
        localStorage.setItem('cw_contact', contact.source_id)
        localStorage.setItem('cw_pubsub_token', contact.pubsub_token)
        localStorage.setItem('contact_id', contact.id)
        return { contact, conversation, sentMessage };
    }

    return (
        <div className="guest-container">
            <Header onBack={onBack} />
            <form className="guest-form-start" onSubmit={handleSubmit}>
                <div className="guest-form-greeting">
                    Xin chào <span role="img" aria-label="wave">👋</span>, vui lòng cho chúng tôi biết thông tin trước khi bắt đầu cuộc trò chuyện.
                </div>
                <div className="guest-form-fields">
                    <div className="guest-form-group">
                        <label className="guest-label">
                            Email <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value);
                                if (error.email) setError(prev => ({ ...prev, email: undefined }));
                            }}
                            className="guest-input"
                        />
                        {error.email && <p className="info-user-error">{error.email}</p>}
                    </div>
                    <div className="guest-form-group">
                        <label className="guest-label">
                            Tên của bạn <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập tên của bạn"
                            value={name}
                            onChange={e => {
                                setName(e.target.value);
                                if (error.name) setError(prev => ({ ...prev, name: undefined }));
                            }}
                            className="guest-input"
                        />
                        {error.name && <p className="info-user-error">{error.name}</p>}
                    </div>
                    <div className="guest-form-group">
                        <label className="guest-label">
                            Số điện thoại <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Số điện thoại"
                            value={phone}
                            onChange={e => {
                                setPhone(e.target.value);
                                if (error.phone) setError(prev => ({ ...prev, phone: undefined }));
                            }}
                            className="guest-input"
                        />
                        {error.phone && <p className="info-user-error">{error.phone}</p>}
                    </div>
                    <div className="guest-form-group">
                        <label className="guest-label">
                            Nội dung tin nhắn <span className="required">*</span>
                        </label>
                        <textarea
                            placeholder="Tôi cần giúp đỡ"
                            value={message}
                            onChange={e => {
                                setMessage(e.target.value);
                                if (error.message) setError(prev => ({ ...prev, message: undefined }));
                            }}
                            className="guest-input"
                            rows={5}
                            style={{ resize: "vertical" }}
                        />
                        {error.message && <p className="info-user-error">{error.message}</p>}
                    </div>
                </div>
                <button type="submit" className="guest-submit-btn-guest">
                    Bắt đầu trò chuyện

                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                        <rect x="0.25" y="0.859131" width="24" height="24" rx="4" fill="white" />
                        <path d="M5.25 12.8591H19.25" stroke="#193CB8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12.25 5.85913L19.25 12.8591L12.25 19.8591" stroke="#193CB8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                </button>
            </form>
        </div>
    );
};

export default React.memo(GuestPage);

