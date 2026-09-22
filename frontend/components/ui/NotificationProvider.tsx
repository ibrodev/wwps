"use client";

import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  XCircle,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: number;
  type: NotificationType;
  title?: string;
  message: string;
  duration: number;
}

interface NotifyOptions {
  title?: string;
  duration?: number;
}

interface NotificationContextType {
  notify: {
    success: (message: string, options?: NotifyOptions) => void;
    error: (message: string, options?: NotifyOptions) => void;
    warning: (message: string, options?: NotifyOptions) => void;
    info: (message: string, options?: NotifyOptions) => void;
  };
  dismiss: (id: number) => void;
  clearAll: () => void;
}

const NotificationContext =
  createContext<NotificationContextType | null>(null);

let notificationId = 0;

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  }, []);

  const show = useCallback(
    (
      type: NotificationType,
      message: string,
      options?: NotifyOptions
    ) => {
      const id = ++notificationId;

      const duration = options?.duration ?? 4000;

      setNotifications((current) => [
        ...current,
        {
          id,
          type,
          message,
          title: options?.title,
          duration,
        },
      ]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const notify = useMemo(
    () => ({
      success: (message: string, options?: NotifyOptions) =>
        show("success", message, options),

      error: (message: string, options?: NotifyOptions) =>
        show("error", message, options),

      warning: (message: string, options?: NotifyOptions) =>
        show("warning", message, options),

      info: (message: string, options?: NotifyOptions) =>
        show("info", message, options),
    }),
    [show]
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notify,
        dismiss,
        clearAll,
      }}
    >
      {children}

      <div
        className="
          fixed
          right-5
          top-5
          z-[9999]
          flex
          w-[calc(100%-2.5rem)]
          max-w-md
          flex-col
          gap-3
        "
      >
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => dismiss(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const config = {
    success: {
      icon: CheckCircle,
      iconClass: "text-green-600",
      bgClass: "bg-green-50",
      borderClass: "border-green-200",
      titleClass: "text-green-800",
      messageClass: "text-green-700",
      progressClass: "bg-green-500",
    },

    error: {
      icon: XCircle,
      iconClass: "text-red-600",
      bgClass: "bg-red-50",
      borderClass: "border-red-200",
      titleClass: "text-red-800",
      messageClass: "text-red-700",
      progressClass: "bg-red-500",
    },

    warning: {
      icon: AlertTriangle,
      iconClass: "text-yellow-600",
      bgClass: "bg-yellow-50",
      borderClass: "border-yellow-200",
      titleClass: "text-yellow-800",
      messageClass: "text-yellow-700",
      progressClass: "bg-yellow-500",
    },

    info: {
      icon: Info,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-50",
      borderClass: "border-blue-200",
      titleClass: "text-blue-800",
      messageClass: "text-blue-700",
      progressClass: "bg-blue-500",
    },
  }[notification.type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`
        relative
        overflow-hidden
        rounded-lg
        border
        p-4
        shadow-lg
        ${config.bgClass}
        ${config.borderClass}
        animate-in
        slide-in-from-right-5
        fade-in
        duration-300
      `}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`
            mt-0.5
            h-5
            w-5
            shrink-0
            ${config.iconClass}
          `}
        />

        <div className="min-w-0 flex-1">
          {notification.title && (
            <p
              className={`
                text-sm
                font-semibold
                ${config.titleClass}
              `}
            >
              {notification.title}
            </p>
          )}

          <p
            className={`
              text-sm
              ${notification.title ? "mt-1" : ""}
              ${config.messageClass}
            `}
          >
            {notification.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`
            shrink-0
            rounded-md
            p-1
            ${config.iconClass}
            hover:bg-black/5
            focus:outline-none
            focus:ring-2
            focus:ring-current/30
          `}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {notification.duration > 0 && (
        <div
          className={`
            absolute
            bottom-0
            left-0
            h-0.5
            ${config.progressClass}
          `}
          style={{
            animation: `notification-progress ${notification.duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used inside NotificationProvider"
    );
  }

  return context;
}