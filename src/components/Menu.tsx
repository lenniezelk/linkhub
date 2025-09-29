import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { User, UserProfile } from "@/lib/types";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface MenuProps {
    user?: User | null;
    userProfile?: UserProfile
}

function Menu({ user }: MenuProps) {
    const { location: { pathname } } = useRouterState();

    return (
        <nav className="flex items-center justify-between py-3">
            {/* Logo (left) */}
            <Link to="/" className="flex items-center gap-2">
                <Logo className="h-8 w-8" />
                <span className="text-lg font-semibold text-slate-900">LinkHub</span>
            </Link>

            {/* Navigation Menu (right) */}
            <NavigationMenu>
                <NavigationMenuList className="gap-2">
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild className="text-lg font-medium text-slate-800 hover:text-slate-950 px-3 py-2">
                            <Link
                                to="/Pricing"

                            >
                                Pricing
                            </Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                    {!user && (
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className="text-lg font-medium text-slate-800 hover:text-slate-950 px-3 py-2">
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

                    {user && !pathname.toLowerCase().startsWith('/app') && (
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
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild className={cn(
                                "inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-base font-semibold text-white shadow hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400",
                                "transition-colors"
                            )}>
                                <Link
                                    to="/Logout"
                                >
                                    Logout
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    )}
                </NavigationMenuList>
            </NavigationMenu>
        </nav>
    )
}

export default Menu;