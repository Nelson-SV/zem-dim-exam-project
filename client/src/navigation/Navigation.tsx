import { NavLink, useLocation } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";
import { Badge } from "../components/ui/badge";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { http } from "../lib/api";
import { useTranslation } from "react-i18next";
import MobileSidebar from "./MobileSidebar";
import { useMediaQuery } from "../hooks/useMediaQuery";

interface NavLinkItem {
    to: string;
    label: string;
    badge?: number;
}

interface NavigationProps {
    role: "admin" | "client";
    links: NavLinkItem[];
    mobileLinks?: NavLinkItem[];
}


export default function Navigation({ role, links, mobileLinks }: NavigationProps) {

    const [unreadCount, setUnreadCount] = useState(0);
    const { user, token } = useAuth();
    const location = useLocation();
    const { i18n } = useTranslation();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [darkMode, setDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

    const applyUnreadBadge = (navLinks: NavLinkItem[]) => navLinks.map((link) =>
        link.to === "messages" ? { ...link, badge: unreadCount } : link
    );

    const updatedLinks = applyUnreadBadge(links);
    const updatedMobileLinks = applyUnreadBadge(mobileLinks ?? links);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    useEffect(() => {
        if (isDesktop) {
            setIsMobileMenuOpen(false);
        }
    }, [isDesktop]);


    return (
        <>
            {/* Desktop links */}
            <NavigationBar
                role={role}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
                currentLanguage={i18n.language}
                onChangeLanguage={changeLanguage}
                onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                isMobileMenuOpen={isMobileMenuOpen}
            >
                {isDesktop && updatedLinks.map((link) => (
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

            {!isDesktop && (
                <MobileSidebar
                    isOpen={isMobileMenuOpen}
                    onClose={() => setIsMobileMenuOpen(false)}
                    links={updatedMobileLinks}
                    role={role}
                    darkMode={darkMode}
                    onToggleDarkMode={() => setDarkMode(!darkMode)}
                    currentLanguage={i18n.language}
                    onChangeLanguage={changeLanguage}
                />
            )}
        </>
    );
}
