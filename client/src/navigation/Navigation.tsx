import { NavLink, useLocation } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";
import { Badge } from "../components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { http } from "../lib/api";

interface NavLinkItem {
    to: string;
    label: string;
    badge?: number;
}

interface NavigationProps {
    role: "admin" | "client";
    links: NavLinkItem[];
}


export default function Navigation({ role, links }: NavigationProps) {

    const [unreadCount, setUnreadCount] = useState(0);
    const { user, token } = useAuth();
    const location = useLocation();

    const activeTab = location.pathname.split("/").pop() || "";


    const loadUnreadCount = async () => {
        try {
            const count = await http.messages.getTotalUnreadCount();
            console.log("UNREAD NUMBER: " + count);
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to load unread count:', err);
        }
    };

    // 1) Load the number of unread messages when mounting + every 30 seconds
    useEffect(() => {
        console.log("USER FRONTEND: " + user?.id);
        console.log("TOKEN FRONTEND: " + token);
        if (!user?.id || !token) return;
        
        loadUnreadCount();

        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [user?.id, token]);

    // 2) Listen to an internal event to force an update after reading/sending
    useEffect(() => {
        if (!user?.id) return;

        const onRefresh = () => loadUnreadCount();
        window.addEventListener('messages:refreshCounts', onRefresh);
        return () => window.removeEventListener('messages:refreshCounts', onRefresh);
    }, [user?.id]);

    // 3) If you opened the Messages tab, we also update it
    useEffect(() => {
        if (!user?.id) return;
        if (activeTab === 'messages') loadUnreadCount();
    }, [activeTab, user?.id]);

    const updatedLinks = links.map((link) =>
        link.to === "messages" ? { ...link, badge: unreadCount } : link
    );


    return (
        <>
            {/* Desktop links */}
            <NavigationBar role={role}>
                {updatedLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={`/${role}/${link.to}`}
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-md text-sm font-medium transition 
              ${isActive ? "bg-[#F97316] text-white" : "hover:bg-muted"}`
                        }
                    >
                        {link.label}
                        {link.badge && link.badge > 0 ? (
                            <Badge className="ml-2 bg-red-600">{link.badge}</Badge>
                        ) : null}
                    </NavLink>
                ))}
            </NavigationBar>

            {/* Mobile links */}
            <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-2 border-t bg-background sticky top-16 z-40">
                {updatedLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={`/${role}/${link.to}`}
                        className={({ isActive }) =>
                            `px-3 py-1 rounded-full text-sm ${isActive
                                ? "bg-[#F97316] text-white"
                                : "bg-muted text-foreground"
                            }`
                        }
                    >
                        {link.label}
                        {link.badge && link.badge > 0 ? (
                            <Badge className="ml-2 bg-red-600">{link.badge}</Badge>
                        ) : null}
                    </NavLink>
                ))}
            </div>
        </>
    );
}
