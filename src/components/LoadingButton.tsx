import Loading from "./Loading";

function LoadingButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button
        {...props}
        className="cursor-pointer inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white/80 w-72 h-16">
        <Loading />
    </button>;
}

export default LoadingButton;
