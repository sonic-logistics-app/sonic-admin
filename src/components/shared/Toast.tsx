"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";

export interface ToastMessage {
  severity: "success" | "error" | "warn" | "info";
  summary: string;
  detail: string;
  life?: number;
}

export interface ToastRef {
  show: (message: ToastMessage) => void;
}

interface ToastItemProps {
  message: ToastMessage;
  onRemove: () => void;
}

function ToastItem({ message, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto remove
    const removeTimer = setTimeout(() => {
      handleRemove();
    }, message.life || 3000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, [message.life]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(onRemove, 300); // Wait for exit animation
  };

  const getStyles = () => {
    switch (message.severity) {
      case "success":
        return {
          bg: "bg-[#D1FAE5]",
          border: "border-[#059669]",
          icon: "pi-check-circle",
          iconColor: "text-[#059669]",
        };
      case "error":
        return {
          bg: "bg-[#FEE2E2]",
          border: "border-[#DC2626]",
          icon: "pi-times-circle",
          iconColor: "text-[#DC2626]",
        };
      case "warn":
        return {
          bg: "bg-[#FEF3C7]",
          border: "border-[#D97706]",
          icon: "pi-exclamation-triangle",
          iconColor: "text-[#D97706]",
        };
      case "info":
        return {
          bg: "bg-[#DBEAFE]",
          border: "border-[#2563EB]",
          icon: "pi-info-circle",
          iconColor: "text-[#2563EB]",
        };
      default:
        return {
          bg: "bg-[#F3F4F6]",
          border: "border-[#6B7280]",
          icon: "pi-info-circle",
          iconColor: "text-[#6B7280]",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border-l-4 rounded-lg p-4 mb-3 shadow-md
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isRemoving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div className="flex items-start gap-3">
        <i className={`pi ${styles.icon} ${styles.iconColor} text-lg flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-semibold text-[#111827] mb-1">
            {message.summary}
          </h4>
          <p className="text-[12px] text-[#525866] leading-relaxed">
            {message.detail}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
        >
          <i className="pi pi-times text-[#525866] text-xs" />
        </button>
      </div>
    </div>
  );
}

const Toast = forwardRef<ToastRef>((_, ref) => {
  const [messages, setMessages] = useState<(ToastMessage & { id: string })[]>([]);

  useImperativeHandle(ref, () => ({
    show: (message: ToastMessage) => {
      const id = Date.now().toString();
      setMessages(prev => [...prev, { ...message, id }]);
    },
  }));

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      {messages.map(message => (
        <ToastItem
          key={message.id}
          message={message}
          onRemove={() => removeMessage(message.id)}
        />
      ))}
    </div>
  );
});

Toast.displayName = "Toast";

export default Toast;