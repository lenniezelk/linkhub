interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    error?: string;
    inputPrefix?: React.ReactNode; // Element displayed inside the input on the left
}

function Input(props: InputProps) {
    const { className, error, inputPrefix, ...rest } = props
    const baseClasses = `w-full rounded-md bg-white/80 py-2 px-4 text-slate-900 shadow-sm ring-1 ring-white/60 backdrop-blur placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 ${error ? 'ring-red-500 focus:ring-red-400' : ''}`

    // If a prefix is provided and consumer didn't already add left padding, we keep existing padding.
    // Consumers can still override via className (as done for handle field with pl-[14ch]).
    return (
        <div>
            <div className={inputPrefix ? 'relative' : undefined}>
                {inputPrefix && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none z-10">
                        {inputPrefix}
                    </span>
                )}
                <input
                    {...rest}
                    className={className ? `${baseClasses} ${className}` : baseClasses}
                />
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    )
}

export default Input
