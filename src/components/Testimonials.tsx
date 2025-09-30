// import { useRive, useViewModel, useViewModelInstance, useViewModelInstanceEnum, useViewModelInstanceImage, useViewModelInstanceString, decodeImage, useViewModelInstanceBoolean, useViewModelInstanceList, useViewModelInstanceNumber, useViewModelInstanceTrigger } from '@rive-app/react-canvas'
import LinkHubRiveFile from '../assets/linkhub.riv'
import { useEffect, useRef, useState } from 'react'
import * as RiveReactCanvas from '@rive-app/react-canvas';
import type { FetchState } from '@/lib/types';
const { decodeImage, useViewModel, useViewModelInstance, useViewModelInstanceEnum, useViewModelInstanceList, useViewModelInstanceNumber, useViewModelInstanceTrigger, useRive } = RiveReactCanvas;

interface Testimonial {
    name: string;
    link: string;
    imageUrl: string;
    decodedImageData?: Awaited<ReturnType<typeof decodeImage>>;
}

interface TestimonialsData {
    testimonials: Testimonial[];
}

const TestimonialsData: TestimonialsData = {
    testimonials: [
        {
            name: 'Lena Quill',
            link: 'linkhub.link/lena',
            imageUrl: '/testimonials/lena.png'
        },
        {
            name: 'Asha Ndlovu',
            link: 'linkhub.link/asha',
            imageUrl: '/testimonials/asha.png'
        },
        {
            name: 'Sora Kim',
            link: 'linkhub.link/sora',
            imageUrl: '/testimonials/sora.png'
        },
        {
            name: 'Vera Singh',
            link: 'linkhub.link/vera',
            imageUrl: '/testimonials/vera.png'
        },
        {
            name: 'Zeno Alvarez',
            link: 'linkhub.link/zeno',
            imageUrl: '/testimonials/zeno.png'
        },
        {
            name: 'Mira Patel',
            link: 'linkhub.link/mira',
            imageUrl: '/testimonials/patel.png'
        }
    ]
}

const loadData = async (): Promise<TestimonialsData> => {
    return TestimonialsData
}

const getTestimonialImage = async (data: Testimonial) => {
    const response = await fetch(data.imageUrl);
    const buffer = await response.arrayBuffer();
    return await decodeImage(new Uint8Array(buffer));
}

const getAllTestimonialImages = (data: Testimonial[]) => {
    return Promise.all(data.map(getTestimonialImage))
}

const SCROLL_DELAY = 3000 // 3 seconds

function Testimonials() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const { rive, RiveComponent } = useRive({
        src: LinkHubRiveFile,
        artboard: 'Testimonials',
        autoBind: false,
        autoplay: true,
        stateMachines: 'State Machine 1'
    })
    const [testimonialsDataFetchState, setTestimonialsDataFetchState] = useState<FetchState>('IDLE')
    const [testimonialsData, setTestimonialsData] = useState<Testimonial[]>([])
    const [componentIsVisible, setComponentIsVisible] = useState(false)

    const viewModel = useViewModel(rive, { name: 'Testimonials' })
    const viewModelInstance = useViewModelInstance(viewModel, { rive })
    const { setValue: setTestimonialsAnimationState } = useViewModelInstanceEnum('state', viewModelInstance)
    const listItemVM = useViewModel(rive, { name: 'Testimonial' })
    const { addInstance } = useViewModelInstanceList("list", viewModelInstance)
    const { value: scrollIndexValue, setValue: setScrollIndexValue } = useViewModelInstanceNumber("scroll index", viewModelInstance)
    const [isScrolling, setIsScrolling] = useState(true)
    useViewModelInstanceTrigger(
        "clicked",
        viewModelInstance,
        {
            onTrigger: () => {
                setIsScrolling(false)
            }
        }
    )

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


    useEffect(() => {
        if (!listItemVM || testimonialsData.length === 0) return

        testimonialsData.forEach((testimonial) => {
            const listItemVMInstance = listItemVM.instance()

            if (!listItemVMInstance) return

            const nameProp = listItemVMInstance.string("name")
            const linkProp = listItemVMInstance.string("link")
            const profileImageProp = listItemVMInstance.image("profile")

            if (!nameProp || !linkProp || !profileImageProp) return

            nameProp.value = testimonial.name
            linkProp.value = testimonial.link
            profileImageProp.value = testimonial.decodedImageData || null

            addInstance(listItemVMInstance)
        })
    }, [listItemVM, addInstance, testimonialsData.length, testimonialsData])

    // set animation state
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
                    setTestimonialsAnimationState('TESTIMONIALS')
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
        componentIsVisible,
        setTestimonialsAnimationState
    ])

    // fetch testimonials data
    useEffect(() => {
        const loadTestimonials = async () => {
            setTestimonialsDataFetchState('FETCHING')
            try {
                const data = await loadData()

                // Only decode images if they haven't been decoded yet
                const needsDecoding = data.testimonials.some(t => !t.decodedImageData)
                if (needsDecoding) {
                    const decodedImages = await getAllTestimonialImages(data.testimonials)
                    data.testimonials.forEach((testimonial, index) => {
                        if (!testimonial.decodedImageData) {
                            testimonial.decodedImageData = decodedImages[index]
                            testimonial.decodedImageData.unref()
                        }
                    })
                }

                setTestimonialsData(data.testimonials)
                setTestimonialsDataFetchState('SUCCESS')
            } catch (error) {
                setTestimonialsData([])
                setTestimonialsDataFetchState('ERROR')
                console.error('Failed to fetch testimonial data: ', error)
            }
        }

        // Only load if we don't have data yet
        if (testimonialsData.length === 0 && testimonialsDataFetchState === 'IDLE') {
            loadTestimonials()
        }
    }, [
        testimonialsData.length,
        testimonialsDataFetchState
    ])

    useEffect(() => {
        if (!componentIsVisible) return

        const interval = setInterval(() => {
            if (testimonialsData.length === 0 || scrollIndexValue === null) return
            const newScrollIndex = (scrollIndexValue + 1) % testimonialsData.length
            setScrollIndexValue(newScrollIndex)
        }, SCROLL_DELAY)

        if (!isScrolling) {
            clearInterval(interval)
        }

        return () => clearInterval(interval)
    }, [testimonialsData.length, scrollIndexValue, setScrollIndexValue, isScrolling, componentIsVisible])

    return (
        <div ref={containerRef} className='w-full h-full'>
            <RiveComponent />
        </div>
    )
}

export default Testimonials;