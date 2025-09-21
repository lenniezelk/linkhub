// import { useRive, useViewModel, useViewModelInstance, useViewModelInstanceBoolean } from '@rive-app/react-canvas'
import LinkHubRiveFile from '../assets/linkhub.riv'
import { useEffect, useRef } from 'react'
import * as RiveReactCanvas from '@rive-app/react-canvas';
const { useViewModel, useViewModelInstance, useViewModelInstanceBoolean, useRive } = RiveReactCanvas;

interface RivePlayOnVisibleProps {
    artboardName: string,
    viewModelName: string,
    stateMachineName?: string,
    switchName?: string
}

function RivePlayOnVisible({ artboardName, viewModelName, switchName = 'playing', stateMachineName = 'State Machine 1' }: RivePlayOnVisibleProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const { rive, RiveComponent } = useRive({
        src: LinkHubRiveFile,
        artboard: artboardName,
        autoBind: false,
        autoplay: true,
        stateMachines: stateMachineName
    })

    const viewModel = useViewModel(rive, { name: viewModelName })
    const viewModelInstance = useViewModelInstance(viewModel, { rive })
    const { setValue: setPlaying } = useViewModelInstanceBoolean(switchName, viewModelInstance)

    useEffect(() => {
        if (!viewModelInstance || !containerRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                const isVisible = !!entry?.isIntersecting
                setPlaying(isVisible)
            },
            { threshold: 0.2 }
        )

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [viewModelInstance, setPlaying])

    return (
        <div ref={containerRef} className='w-full h-full'>
            <RiveComponent />
        </div>
    )
}

export default RivePlayOnVisible;
