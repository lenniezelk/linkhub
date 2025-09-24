interface ContainerProps {
    children: React.ReactNode;
    gradientClass?: string;
}

function Container({ children, gradientClass = 'bg-gradient-to-br from-rose-200 via-fuchsia-200 to-sky-200' }: ContainerProps) {
    return (
        <div className={`min-h-screen w-full ${gradientClass} pt-10`}>
            <div className="mx-auto max-w-6xl  px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    )
}

export default Container