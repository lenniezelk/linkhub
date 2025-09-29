import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { User, UserProfile } from "@/lib/types";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuTrigger,
    NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import ProfileImage from "./ProfileImage";
import { useState } from "react";

interface MenuContext {
    user?: User | null;
    userProfile?: UserProfile | null;
}

interface MenuProps {
    context?: MenuContext;
}

function Menu({ context }: MenuProps) {
    const { user, userProfile } = context || {};
    const { location: { pathname } } = useRouterState();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="flex items-center justify-between py-3 relative">
            {/* Logo (left) */}
            <Link to="/" className="flex items-center gap-2">
                <Logo className="h-8 w-8" />
                <span className="text-lg font-semibold text-slate-900">LinkHub</span>
            </Link>

            {/* Mobile hamburger button */}
            <button
                className="md:hidden flex flex-col gap-1 p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                <span className={cn(
                    "w-6 h-0.5 bg-slate-900 transition-transform duration-200",
                    isMobileMenuOpen && "rotate-45 translate-y-1.5"
                )}></span>
                <span className={cn(
                    "w-6 h-0.5 bg-slate-900 transition-opacity duration-200",
                    isMobileMenuOpen && "opacity-0"
                )}></span>
                <span className={cn(
                    "w-6 h-0.5 bg-slate-900 transition-transform duration-200",
                    isMobileMenuOpen && "-rotate-45 -translate-y-1.5"
                )}></span>
            </button>

            {/* Desktop Navigation Menu */}
            <NavigationMenu viewport={false} className="hidden md:flex">
                <NavigationMenuList className="gap-2">
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild className="text-lg font-medium text-slate-800 hover:text-slate-950 hover:bg-transparent px-3 py-2">
                            <Link
                                to="/Pricing"

                            >
                                Pricing
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    {!user && (
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className="text-lg font-medium text-slate-800 hover:text-slate-950 hover:bg-transparent px-3 py-2">
                                <Link
                                    to="/Login"
                                >
                                    Login
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )}

                    {!user && (
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={cn(
                                "inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-base font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400",
                                "transition-colors"
                            )}>
                                <Link
                                    to="/Signup"
                                >
                                    Sign Up
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )}

                    {user && pathname.toLowerCase() !== "/app" && (
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={cn(
                                "inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-base font-semibold text-white shadow hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400",
                                "transition-colors"
                            )}>
                                <Link
                                    to="/app"
                                >
                                    Dashboard
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )}

                    {user && (
                        <NavigationMenuItem className="flex items-center">
                            <NavigationMenuTrigger className="!bg-transparent hover:!bg-transparent focus:!bg-transparent data-[state=open]:!bg-transparent data-[highlighted]:!bg-transparent p-0 h-auto flex items-center">
                                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-300">
                                    <ProfileImage imageUrl={userProfile?.profilePicture} />
                                </div>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="right-0 left-auto min-w-max">
                                <div className="flex flex-col gap-2 p-2">
                                    <NavigationMenuLink asChild className="text-lg font-medium text-slate-800 hover:text-white hover:bg-slate-900 px-3 py-2 rounded-md transition-colors">
                                        <Link
                                            to="/app/Profile"

                                        >
                                            Profile
                                        </Link>
                                    </NavigationMenuLink>
                                    <NavigationMenuLink asChild className="text-lg font-medium text-slate-800 hover:text-white hover:bg-slate-900 px-3 py-2 rounded-md transition-colors">
                                        <Link
                                            to="/Logout"

                                        >
                                            Logout
                                        </Link>
                                    </NavigationMenuLink>
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    )}
                </NavigationMenuList>
            </NavigationMenu>

            {/* Mobile Navigation Menu */}
            <div className={cn(
                "absolute top-full left-0 right-0 bg-white border-t border-slate-200 shadow-lg md:hidden transition-all duration-200",
                isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            )}>
                <div className="flex flex-col p-4 gap-2">
                    <Link
                        to="/Pricing"
                        className="text-lg font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 px-3 py-2 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Pricing
                    </Link>

                    {!user && (
                        <>
                            <Link
                                to="/Login"
                                className="text-lg font-medium text-slate-800 hover:text-slate-950 hover:bg-slate-100 px-3 py-2 rounded-md transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/Signup"
                                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-base font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}

                    {user && !pathname.toLowerCase().startsWith('/app') && (
                        <Link
                            to="/app"
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-base font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                    )}

                    {user && (
                        <>
                            <div className="flex items-center gap-3 px-3 py-2">
                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-300">
                                    <ProfileImage imageUrl={userProfile?.profilePicture} />
                                </div>
                                <span className="text-slate-800 font-medium">Profile</span>
                            </div>
                            <Link
                                to="/app/Profile"
                                className="text-lg font-medium text-slate-800 hover:text-white hover:bg-slate-900 px-3 py-2 rounded-md transition-colors ml-4"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Edit Profile
                            </Link>
                            <Link
                                to="/Logout"
                                className="text-lg font-medium text-slate-800 hover:text-white hover:bg-slate-900 px-3 py-2 rounded-md transition-colors ml-4"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Logout
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Menu;