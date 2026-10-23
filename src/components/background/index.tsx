import { FC } from 'react'
import { getImageProps } from 'next/image'
import NarrowImage from 'assets/images/gallows-narrow.jpg'
import WideImage from 'assets/images/gallows-wide.jpg'
import { combineClassNames } from 'helpers/utils/styles'

// Phones get the narrow art; the 600px column on larger screens and landscape get the wider one.
// Both layers use the same sizes so the browser downloads one file.
const COMMON_IMAGE_PROPS = { alt: '', sizes: '(max-width: 600px) 100vw, 600px' }
const WIDE_MEDIA = '(min-width: 600px), (orientation: landscape)'

const {
  props: { srcSet: wideSrcSet },
} = getImageProps({ ...COMMON_IMAGE_PROPS, src: WideImage })
const {
  props: { srcSet: narrowSrcSet, ...narrowImgProps },
} = getImageProps({ ...COMMON_IMAGE_PROPS, src: NarrowImage })

type TPictureProps = {
  className: string
  imgClassName: string
  fetchPriority?: 'high'
}

const BackgroundPicture: FC<TPictureProps> = ({ className, imgClassName, fetchPriority }) => (
  <picture className={className}>
    <source media={WIDE_MEDIA} srcSet={wideSrcSet} />
    {/* eslint-disable-next-line jsx-a11y/alt-text -- decorative art; alt="" comes from getImageProps */}
    <img
      {...narrowImgProps}
      srcSet={narrowSrcSet}
      fetchPriority={fetchPriority}
      className={combineClassNames('block size-full object-cover', imgClassName)}
    />
  </picture>
)

// Rendered on the server. The art is clear behind the start screen and blurred behind the others; CSS tells them
// apart, so the picture doesn't wait for the game to load.
export const Background: FC = () => (
  <div className='fixed inset-0 -z-1 overflow-hidden bg-[#8c8c8c]' aria-hidden='true'>
    {/* Fills the screen beside the game column on wide screens */}
    <BackgroundPicture
      className='absolute inset-0 hidden min-[600px]:block'
      imgClassName='scale-110 blur-[18px] brightness-75'
    />
    <BackgroundPicture
      className='absolute top-0 bottom-0 left-1/2 block w-[min(100%,var(--column-width))] -translate-x-1/2 bg-white min-[600px]:shadow-[0_0_48px_8px_rgba(0,0,0,0.35)]'
      imgClassName='opacity-80 blur-[10px] [body:has([data-start-screen])_&]:opacity-100 [body:has([data-start-screen])_&]:filter-none'
      fetchPriority='high'
    />
  </div>
)
