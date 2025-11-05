import { NavLink } from "react-router-dom";
import { NavigationBar } from "./NavigationBar";


interface NavLinkItem {
    to: string;
    label: string;
}

interface NavigationProps {
    role: "admin" | "client";
    links: NavLinkItem[];
}


export default function Navigation({ role, links }: NavigationProps) {
    return (
        <>
            {/* Desktop links */}
            <NavigationBar role={role}>
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={`/${role}/${link.to}`}
                        className={({ isActive }) =>
                            `px-3 py-2 rounded-md text-sm font-medium transition 
              ${isActive ? "bg-[#F97316] text-white" : "hover:bg-muted"}`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </NavigationBar>

            {/* Mobile links */}
            <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-2 border-t bg-background sticky top-16 z-40">
                {links.map((link) => (
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
                    </NavLink>
                ))}
            </div>
        </>
    );
}
