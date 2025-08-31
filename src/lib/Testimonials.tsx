import { useRive, useViewModel, useViewModelInstance, useViewModelInstanceEnum, useViewModelInstanceImage, useViewModelInstanceString, decodeImage, useViewModelInstanceBoolean } from '@rive-app/react-canvas'
import LinkHubRiveFile from '../assets/linkhub.riv'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Testimonial {
    name: string;
    link: string;
    image: string;
}

interface TestimonialsArray {
    testimonials: Testimonial[];
}

type TestimonialsAnimationState = 'IDLE' | 'LOADING' | 'TESTIMONIALS' | 'ERROR';

type TestimonialsDataLoadingState = 'IDLE' | 'FETCHING' | 'LOADED' | 'ERROR';

const TestimonialsArray: TestimonialsArray = {
    testimonials: [
        {
            name: 'Lena Quill',
            link: 'linkhub.link/lena',
            image: '/testimonials/lena.png'
        },
        {
            name: 'Asha Ndlovu',
            link: 'linkhub.link/asha',
            image: '/testimonials/asha.png'
        },
        {
            name: 'Sora Kim',
            link: 'linkhub.link/sora',
            image: '/testimonials/sora.png'
        },
        {
            name: 'Vera Singh',
            link: 'linkhub.link/vera',
            image: '/testimonials/vera.png'
        },
        {
            name: 'Zeno Alvarez',
            link: 'linkhub.link/zeno',
            image: '/testimonials/zeno.png'
        },
        {
            name: 'Mira Patel',
            link: 'linkhub.link/mira',
            image: '/testimonials/patel.png'
        }
    ]
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const loadData = async (): Promise<TestimonialsArray> => {
    await wait(500) // Simulate loading
    return TestimonialsArray
}

const getTestimonialImage = async (data: Testimonial) => {
    const response = await fetch(data.image);
    const buffer = await response.arrayBuffer();
    return await decodeImage(new Uint8Array(buffer));
}

const getAllTestimonialImages = (data: TestimonialsArray) => {
    return Promise.all(data.testimonials.map(getTestimonialImage))
}

export function Testimonials() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const { rive, RiveComponent } = useRive({
        src: LinkHubRiveFile,
        artboard: 'Testimonials',
        autoBind: false,
        autoplay: true,
        stateMachines: 'State Machine 1'
    })
    const [testimonialsDataLoadingState, setTestimonialsDataLoadingState] = useState<TestimonialsDataLoadingState>('IDLE')

    const viewModel = useViewModel(rive, { name: 'Testimonials' })
    const viewModelInstance = useViewModelInstance(viewModel, { rive })
    const { setValue: setTestimonialsAnimationState } = useViewModelInstanceEnum('state', viewModelInstance)
    const { setValue: setTestimonial1Name } = useViewModelInstanceString('testimonial-1/name', viewModelInstance)
    const { setValue: setTestimonial1Link } = useViewModelInstanceString('testimonial-1/link', viewModelInstance)
    const { setValue: setTestimonial1Image } = useViewModelInstanceImage('testimonial-1/image', viewModelInstance)
    const { setValue: setTestimonial1Visible } = useViewModelInstanceBoolean('testimonial-1/visible', viewModelInstance)
    const { setValue: setTestimonial2Name } = useViewModelInstanceString('testimonial-2/name', viewModelInstance)
    const { setValue: setTestimonial2Link } = useViewModelInstanceString('testimonial-2/link', viewModelInstance)
    const { setValue: setTestimonial2Image } = useViewModelInstanceImage('testimonial-2/image', viewModelInstance)
    const { setValue: setTestimonial2Visible } = useViewModelInstanceBoolean('testimonial-2/visible', viewModelInstance)
    const { setValue: setTestimonial3Name } = useViewModelInstanceString('testimonial-3/name', viewModelInstance)
    const { setValue: setTestimonial3Link } = useViewModelInstanceString('testimonial-3/link', viewModelInstance)
    const { setValue: setTestimonial3Image } = useViewModelInstanceImage('testimonial-3/image', viewModelInstance)
    const { setValue: setTestimonial3Visible } = useViewModelInstanceBoolean('testimonial-3/visible', viewModelInstance)

    useEffect(() => {
        if (!viewModelInstance || !containerRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                const isVisible = !!entry?.isIntersecting
                if (isVisible) {
                    switch (testimonialsDataLoadingState) {
                        case 'LOADED':
                            setTestimonialsAnimationState('TESTIMONIALS')
                            break;
                        case 'FETCHING':
                            setTestimonialsAnimationState('LOADING')
                            break;
                        case 'ERROR':
                            setTestimonialsAnimationState('ERROR')
                            break;
                        default:
                            setTestimonialsAnimationState('IDLE')
                    }
                } else {
                    setTestimonialsAnimationState('IDLE')
                }
            },
            { threshold: 0.2 }
        )

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [viewModelInstance, setTestimonialsAnimationState, testimonialsDataLoadingState])

    const setTestimonialItemsVisibility = useCallback((visible: boolean) => {
        setTestimonial1Visible(visible)
        setTestimonial2Visible(visible)
        setTestimonial3Visible(visible)
    }, [setTestimonial1Visible, setTestimonial2Visible, setTestimonial3Visible])

    const setTestimonialsData = useCallback(async (data: TestimonialsArray) => {
        setTestimonial1Name(data.testimonials[0].name)
        setTestimonial1Link(data.testimonials[0].link)
        setTestimonial2Name(data.testimonials[1].name)
        setTestimonial2Link(data.testimonials[1].link)
        setTestimonial3Name(data.testimonials[2].name)
        setTestimonial3Link(data.testimonials[2].link)
        const [decodedImage1, decodedImage2, decodedImage3] = await getAllTestimonialImages(data)
        setTestimonial1Image(decodedImage1)
        setTestimonial2Image(decodedImage2)
        setTestimonial3Image(decodedImage3)
        decodedImage1.unref()
        decodedImage2.unref()
        decodedImage3.unref()
    }, [setTestimonial1Name, setTestimonial1Link, setTestimonial1Image, setTestimonial2Name, setTestimonial2Link, setTestimonial2Image, setTestimonial3Name, setTestimonial3Link, setTestimonial3Image])

    useEffect(() => {
        const loadTestimonials = async () => {
            setTestimonialItemsVisibility(false)
            setTestimonialsDataLoadingState('FETCHING')
            try {
                const testimonialsData = await loadData()
                await setTestimonialsData(testimonialsData)
                setTestimonialsDataLoadingState('LOADED')
                setTestimonialItemsVisibility(true)
            } catch (error) {
                console.error('Failed to load testimonials: ', error)
                setTestimonialsDataLoadingState('ERROR')
            }
        }

        loadTestimonials()
    }, [setTestimonialsDataLoadingState, setTestimonialItemsVisibility, setTestimonialsData])

    return (
        <div ref={containerRef} className='w-full h-full'>
            <RiveComponent />
        </div>
    )
}
