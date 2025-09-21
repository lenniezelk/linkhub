import React, { useCallback } from "react";

interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number; // in milliseconds
    keepForever?: boolean;
    timerId?: NodeJS.Timeout;
}

interface InPageNotificationsContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timerId'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

const generateId = () => Math.random().toString(36).slice(0, 9);

const InPageNotificationsContext = React.createContext<InPageNotificationsContextType | undefined>(undefined);

export const useInPageNotifications = () => {
    const context = React.useContext(InPageNotificationsContext);
    if (!context) {
        throw new Error('useInPageNotifications must be used within an InPageNotificationsProvider');
    }
    return context;
};

export function InPageNotificationsProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timerId'>) => {
        setNotifications((prev) => [...prev, { ...notification, id: generateId() }]);
    }, [setNotifications]);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, [setNotifications]);

    const clearNotifications = useCallback(() => setNotifications([]), [setNotifications]);

    const value = React.useMemo<InPageNotificationsContextType>(() => ({
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
    }), [notifications, addNotification, removeNotification, clearNotifications]);

    return (
        <InPageNotificationsContext.Provider value={value}>
            {children}
        </InPageNotificationsContext.Provider>
    );
}

export function InPageNotifications() {
    const { notifications, clearNotifications } = useInPageNotifications();
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        clearNotifications();
    }, [clearNotifications]);

    React.useEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current;

            if (notifications.length === 0) {
                // Animate to height 0 when no notifications
                container.style.height = '0px';
                container.style.paddingTop = '0px';
                container.style.paddingBottom = '0px';
            } else {
                // Reset padding first
                container.style.paddingTop = '';
                container.style.paddingBottom = '';

                // Measure the natural height
                container.style.height = 'auto';
                const height = container.scrollHeight;

                // Animate to the measured height
                container.style.height = '0px';
                requestAnimationFrame(() => {
                    container.style.height = `${height}px`;
                });

                // Reset to auto after animation
                const timeout = setTimeout(() => {
                    if (container.style.height === `${height}px`) {
                        container.style.height = 'auto';
                    }
                }, 300);

                return () => clearTimeout(timeout);
            }
        }
    }, [notifications.length]);

    return (
        <div
            ref={containerRef}
            className="flex flex-col justify-center px-3 gap-1 transition-all duration-300 ease-in-out overflow-hidden w-full max-w-md"
            style={{
                height: notifications.length === 0 ? '0px' : 'auto',
                paddingTop: notifications.length === 0 ? '0px' : '0.25rem',
                paddingBottom: notifications.length === 0 ? '0px' : '0.25rem'
            }}
        >
            {notifications.map((notification) => (
                <NotificationContainer key={notification.id} notification={notification} />
            ))}
        </div>
    );
}

function NotificationContainer({ notification }: { notification: Notification }) {
    const { removeNotification } = useInPageNotifications();

    return (
        <div className={`text-center mb-1 rounded-md p-3 text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-800' : notification.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
            <div className="flex justify-end font-bold cursor-pointer" onClick={() => removeNotification(notification.id)}>x</div>
            <p className="mt-0.5">{notification.message}</p>
        </div>
    )
}

export default InPageNotifications;