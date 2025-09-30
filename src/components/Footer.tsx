import { Logo } from "@/components/Logo";
import { Link } from "@tanstack/react-router";

function Footer() {
    return (
        <footer className="mt-24 border-t border-white/60 py-10">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                    <Logo className="h-7 w-7" />
                    <span className="text-base font-semibold text-slate-900">LinkHub</span>
                    <span className="text-sm text-slate-700">© {new Date().getFullYear()} LinkHub</span>
                </div>
                <nav className="flex items-center gap-4">
                    <Link to="/pricing" className="text-sm font-medium text-slate-800 hover:text-slate-950">Pricing</Link>
                </nav>
            </div>
        </footer>
    )
}

export default Footer;