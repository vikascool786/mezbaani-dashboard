import React, { useEffect } from "react";
import "./RightSidebar.css";

interface RightSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
    isOpen,
    onClose,
    title = "Details",
    children,
}) => {
    // optional: close on ESC
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    return (
        <>
            {/* ALWAYS render overlay and sidebar so CSS can animate them.
          Toggle 'open' class to animate. */}
            <div
                className={`right-sidebar-overlay ${isOpen ? "open" : ""}`}
                onClick={onClose}
                aria-hidden={!isOpen}
            />

            <aside
                className={`right-sidebar ${isOpen ? "open" : ""}`}
                aria-hidden={!isOpen}
                role="dialog"
                aria-label={title}
            >
                <div className="sidebar-header">
                    <h5 className="mb-0">{title}</h5>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="sidebar-body">{children}</div>
            </aside>
        </>
    );
};

export default RightSidebar;
