import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { User } from "@/lib/types";

interface MenuProps {
    user?: User | null;
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

            {/* Menu (right) */}
            <div className="flex items-center gap-4">
                <a href="#" className="text-lg font-medium text-slate-800 hover:text-slate-950">
                    Pricing
                </a>
                {!user && (
                    <Link to="/Login" className="text-lg font-medium text-slate-800 hover:text-slate-950">
                        Login
                    </Link>
                )}
                {!user && (
                    <Link
                        to="/Signup"
                        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-base font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                    >
                        Sign Up
                    </Link>
                )}
                {user && !pathname.toLowerCase().startsWith('/app') && (
                    <Link
                        to="/app"
                        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-base font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                    >
                        Dashboard
                    </Link>
                )}
                {user && (
                    <Link
                        to="/Logout"
                        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-base font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                    >
                        Logout
                    </Link>
                )}
            </div>
        </nav>
    )
}

export default Menu;