import React from "react";

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

    const addNotification = (notification: Omit<Notification, 'id' | 'timerId'>) => {
        setNotifications((prev) => [...prev, { ...notification, id: generateId() }]);
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const clearNotifications = () => setNotifications([]);

    const value = React.useMemo<InPageNotificationsContextType>(() => ({
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
    }), [notifications]);

    return (
        <InPageNotificationsContext.Provider value={value}>
            {children}
        </InPageNotificationsContext.Provider>
    );
}

export function InPageNotifications() {
    const { notifications, clearNotifications } = useInPageNotifications();

    React.useEffect(() => {
        clearNotifications();
    }, []);

    if (notifications.length === 0) return null;

    return (
        <div className="flex flex-col justify-center py-1 px-3 gap-1 transition-all duration-300 ease-in-out overflow-hidden w-full max-w-md">
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