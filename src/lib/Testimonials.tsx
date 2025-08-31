import { useRive, useViewModel, useViewModelInstance, useViewModelInstanceEnum, useViewModelInstanceImage, useViewModelInstanceString, decodeImage, useViewModelInstanceBoolean } from '@rive-app/react-canvas'
import LinkHubRiveFile from '../assets/linkhub.riv'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FetchState } from './types';

interface Testimonial {
    name: string;
    link: string;
    image: string;
}

interface TestimonialsData {
    testimonials: Testimonial[];
}

// type TestimonialsAnimationState = 'IDLE' | 'LOADING' | 'TESTIMONIALS' | 'ERROR';


const TestimonialsData: TestimonialsData = {
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

const loadData = async (): Promise<TestimonialsData> => {
    await wait(500) // Simulate loading
    return TestimonialsData
}

const getTestimonialImage = async (data: Testimonial) => {
    const response = await fetch(data.image);
    const buffer = await response.arrayBuffer();
    return await decodeImage(new Uint8Array(buffer));
}

const getAllTestimonialImages = (data: Testimonial[]) => {
    return Promise.all(data.map(getTestimonialImage))
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
    const [testimonialsDataFetchState, setTestimonialsDataFetchState] = useState<FetchState>('IDLE')
    const [testimonialDataIndices, setTestimonialDataIndices] = useState<[number, number]>([0, 2])
    const [testimonialsData, setTestimonialsData] = useState<Testimonial[]>([])
    const [componentIsVisible, setComponentIsVisible] = useState(false)

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
                setComponentIsVisible(!!entry?.isIntersecting)
            },
            { threshold: 0.2 }
        )

        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [viewModelInstance, setComponentIsVisible])

    const setTestimonialItemsVisibility = useCallback((visible: boolean) => {
        setTestimonial1Visible(visible)
        setTestimonial2Visible(visible)
        setTestimonial3Visible(visible)
    }, [setTestimonial1Visible, setTestimonial2Visible, setTestimonial3Visible])

    const dataIndices = useMemo(() => {
        const dataIndices: number[] = []
        for (let i = testimonialDataIndices[0]; i <= testimonialDataIndices[1]; i++) {
            dataIndices.push(i)
        }
        return dataIndices
    }, [testimonialDataIndices])

    const canShowAnimationItem = useCallback((index: number) => {
        return dataIndices[index] != undefined && testimonialsData[dataIndices[index]] != undefined
    }, [dataIndices, testimonialsData])

    const setTestimonialsAnimationData = useCallback(async (data: Testimonial[]) => {
        if (canShowAnimationItem(0)) {
            setTestimonial1Name(data[dataIndices[0]].name)
            setTestimonial1Link(data[dataIndices[0]].link)
        }
        if (canShowAnimationItem(1)) {
            setTestimonial2Name(data[dataIndices[1]].name)
            setTestimonial2Link(data[dataIndices[1]].link)
        }
        if (canShowAnimationItem(2)) {
            setTestimonial3Name(data[dataIndices[2]].name)
            setTestimonial3Link(data[dataIndices[2]].link)
        }

        const [decodedImage1, decodedImage2, decodedImage3] = await getAllTestimonialImages(data)
        if (decodedImage1) {
            setTestimonial1Image(decodedImage1)
            decodedImage1.unref()
        }
        if (decodedImage2) {
            setTestimonial2Image(decodedImage2)
            decodedImage2.unref()
        }
        if (decodedImage3) {
            setTestimonial3Image(decodedImage3)
            decodedImage3.unref()
        }
    }, [
        setTestimonial1Name,
        setTestimonial1Link,
        setTestimonial1Image,
        setTestimonial2Name,
        setTestimonial2Link,
        setTestimonial2Image,
        setTestimonial3Name,
        setTestimonial3Link,
        setTestimonial3Image,
        canShowAnimationItem,
        dataIndices
    ])

    useEffect(() => {
        const setAnimationState = async () => {
            if (!componentIsVisible) {
                setTestimonialsAnimationState('IDLE')
                return
            }

            switch (testimonialsDataFetchState) {
                case 'FETCHING':
                    setTestimonialsAnimationState('LOADING')
                    break;
                case 'SUCCESS':
                    setTestimonialItemsVisibility(false)
                    try {
                        setTestimonialsAnimationState('TESTIMONIALS')
                        setTestimonialItemsVisibility(true)
                    } catch (error) {
                        console.error('Failed to set testimonials animation data: ', error)
                        setTestimonialsAnimationState('ERROR')
                    }
                    break;
                case 'ERROR':
                    setTestimonialsAnimationState('ERROR')
                    break;
                default:
                    setTestimonialsAnimationState('IDLE');
                    break;
            }
        }

        setAnimationState()
    }, [
        testimonialsDataFetchState,
        setTestimonialItemsVisibility,
        setTestimonialsAnimationData,
        componentIsVisible,
        setTestimonialsAnimationState
    ])

    useEffect(() => {
        const loadTestimonials = async () => {
            setTestimonialsDataFetchState('FETCHING')
            try {
                const data = await loadData()
                await setTestimonialsAnimationData(data.testimonials)
                setTestimonialsData(data.testimonials)
                setTestimonialsDataFetchState('SUCCESS')
            } catch (error) {
                setTestimonialsData([])
                setTestimonialsDataFetchState('ERROR')
                console.error('Failed to fetch testimonial data: ', error)
            }
        }

        loadTestimonials()
    }, [
        setTestimonialsDataFetchState,
        setTestimonialsData,
        setTestimonialsAnimationData
    ])

    return (
        <div ref={containerRef} className='w-full h-full'>
            <RiveComponent />
        </div>
    )
}
