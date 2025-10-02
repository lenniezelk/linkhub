import * as RiveReactCanvas from '@rive-app/react-canvas';
import LinkHubRiveFile from '@/assets/linkhub.riv'
import { useNavigate } from '@tanstack/react-router';
const { useViewModel, useViewModelInstance, useViewModelInstanceTrigger, useRive } = RiveReactCanvas;

function Hero() {
    const { rive, RiveComponent } = useRive({
        src: LinkHubRiveFile,
        artboard: 'Hero',
        autoBind: false,
        autoplay: true,
        stateMachines: 'State Machine 1'
    })

    const viewModel = useViewModel(rive, { name: 'Hero' })
    const viewModelInstance = useViewModelInstance(viewModel, { rive })
    const navigate = useNavigate();


    useViewModelInstanceTrigger(
        "get started/click",
        viewModelInstance,
        {
            onTrigger: () => {
                navigate({ to: '/auth/signup' });
            }
        }
    )

    return (
        <div className='w-full h-full'>
            <RiveComponent />
        </div>
    );
}

export default Hero;