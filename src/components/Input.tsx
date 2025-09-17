interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

function Input(props: InputProps) {
    const { className, error, ...rest } = props
    const baseClasses = `w-full rounded-md bg-white/80 py-2 px-4 text-slate-900 shadow-sm ring-1 ring-white/60 backdrop-blur placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 ${error ? 'ring-red-500 focus:ring-red-400' : ''}`

    return (
        <div>
            <input
                {...rest}
                className={className ? `${baseClasses} ${className}` : baseClasses}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    )
}

export default Input
