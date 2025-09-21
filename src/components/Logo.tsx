import logoUrl from '@/assets/logo.svg'

type LogoProps = {
    className?: string
    alt?: string
}

export function Logo({ className, alt = 'LinkHub' }: Readonly<LogoProps>) {
    return <img src={logoUrl} alt={alt} className={className} />
}
