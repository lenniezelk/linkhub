import * as RiveReactCanvas from '@rive-app/react-canvas';
const { useViewModel, useViewModelInstance, useViewModelInstanceBoolean, useRive, decodeImage, useViewModelInstanceImage } = RiveReactCanvas;
import LinkHubRiveFile from '../assets/linkhub.riv'
import React from 'react';


interface ProfileImageProps {
    imageUrl?: string,
}

export default function ProfileImage({ imageUrl }: ProfileImageProps) {
    const { RiveComponent } = useRive({
        src: LinkHubRiveFile,
        artboard: 'Profile Image',
        autoplay: true,
        stateMachines: 'State Machine 1'
    });

    return (
        <>
            {imageUrl ?
                <div className='w-full h-full rounded-full overflow-hidden'>
                    <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
                :
                <div className='w-full h-full'>
                    <RiveComponent />
                </div>
            }
        </>
    )
}