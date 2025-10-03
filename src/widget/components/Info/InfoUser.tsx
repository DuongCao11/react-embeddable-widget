import React, { useEffect, useState } from "react";
import "./index.css";
import { getContact, updateContact } from "../api";
interface InfoUserProps {
    userInfo?: { name: string; email: string; phone: string };
    onCancel?: () => void;
    onSave?: (data: { name: string; email: string; phone: string }) => void;
    setFetchingUserInfo?: boolean;
    setUserInfo?: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string } | null>>;
}

const InfoUser: React.FC<InfoUserProps> = ({
    userInfo,
    onCancel,
    onSave,
    setUserInfo
}) => {
    const [name, setName] = useState(userInfo?.name || "");
    const [email, setEmail] = useState(userInfo?.email || "");
    const [phone, setPhone] = useState(userInfo?.phone || "");
    const [error, setError] = useState<{ email?: string; name?: string }>({});

    useEffect(() => {
        setName(userInfo?.name || "");
        setEmail(userInfo?.email || "");
        setPhone(userInfo?.phone || "");
    }, [userInfo]);

    const handleSave = async () => {
        const newError: { email?: string; name?: string } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newError.email = "Vui lòng nhập email";
        } else if (!emailRegex.test(email.trim())) {
            newError.email = "Email không hợp lệ";
        }
        if (!name.trim()) newError.name = "Vui lòng nhập tên";
        setError(newError);
        if (newError.email || newError.name) return;
        const contactIdentifier = localStorage.getItem("cw_contact") || "";
        if (contactIdentifier) {
            await updateContact(contactIdentifier, { name, email, phone });
        }
        onSave?.({ name, email, phone });

        getContact(contactIdentifier).then(data => {
            if (setUserInfo) setUserInfo(
                { name: data.name, email: data.email, phone: data.phone }
            );
        }).catch(() => {

        });

    };

    return (
        <div className="info-user-container">
            <p className="info-user-header">Thông tin cơ bản</p>
            <div className="info-user-form">
                <div className="info-user-input">
                    <label htmlFor="email">
                        Email <span style={{ color: "#ff4d4f" }}>*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={e => {
                            setEmail(e.target.value);
                            if (error.email) setError(prev => ({ ...prev, email: undefined }));
                        }}
                        className="info-user-input-field"
                        required
                    />
                    {error.email && <p className="info-user-error">{error.email}</p>}
                </div>
                <div className="info-user-input">
                    <label htmlFor="name">
                        Tên của bạn <span style={{ color: "#ff4d4f" }}>*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Nhập tên của bạn"
                        value={name}
                        onChange={e => {
                            setName(e.target.value);
                            if (error.name) setError(prev => ({ ...prev, name: undefined }));
                        }}
                        className="info-user-input-field"
                        required
                    />
                    {error.name && <p className="info-user-error">{error.name}</p>}
                </div>
                <div className="info-user-input">
                    <label htmlFor="sdt" >Số điện thoại</label>
                    <input
                        type="text"
                        placeholder="Nhập số điện thoại của bạn"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="info-user-input-field"
                    />
                </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
                <button
                    className="info-user-cancel-btn"
                    onClick={onCancel}
                >
                    Hủy
                </button>
                <button
                    className="info-user-save-btn"
                    onClick={handleSave}
                >
                    Lưu
                </button>
            </div>
        </div>
    );
};

export default React.memo(InfoUser);
