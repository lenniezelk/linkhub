interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

function Button(props: ButtonProps) {
    const { className, variant = 'primary', ...rest } = props
    const baseClasses = `cursor-pointer inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${variant === 'primary'
        ? 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-400'
        : 'bg-white/80 text-slate-900 hover:bg-white/90 focus:ring-slate-400'
        }`

    return (
        <button
            {...rest}
            className={className ? `${baseClasses} ${className}` : baseClasses}
        />
    )
}

export default Button
