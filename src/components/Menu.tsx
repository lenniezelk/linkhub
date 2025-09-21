import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

function Menu() {
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
                <Link to="/Login" className="text-lg font-medium text-slate-800 hover:text-slate-950">
                    Login
                </Link>
                <Link
                    to="/Signup"
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-base font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                >
                    Sign Up
                </Link>
            </div>
        </nav>
    )
}

export default Menu;