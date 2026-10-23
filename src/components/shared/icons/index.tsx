import { FC, SVGProps } from 'react'

// Hand-drawn style line icons that match the ink illustration; they inherit color from the button
type TIconProps = SVGProps<SVGSVGElement>

const Icon: FC<TIconProps> = ({ children, ...props }) => (
  <svg
    viewBox='0 0 24 24'
    width='1em'
    height='1em'
    fill='none'
    stroke='currentColor'
    strokeWidth={1.8}
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
    focusable='false'
    {...props}
  >
    {children}
  </svg>
)

// A circled "i": whose turn it is and the round's details
export const InfoIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <circle cx='12' cy='12' r='8.6' />
    <path d='M12 11.2v5.2' />
    <path d='M12 7.7h.01' strokeWidth={2.6} />
  </Icon>
)

// Back to the start screen
export const HomeIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <path d='M3.6 11.4 12 4.3l8.4 7.1' />
    <path d='M5.9 9.6v9.9h12.2V9.6' />
    <path d='M10.1 19.5v-5.1h3.8v5.1' />
  </Icon>
)

// An arrow into a tray: install the app
export const DownloadIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <path d='M12 4.2v10.6' />
    <path d='m7.8 10.8 4.2 4.2 4.2-4.2' />
    <path d='M4.6 15.6v2.6a1.6 1.6 0 0 0 1.6 1.6h11.6a1.6 1.6 0 0 0 1.6-1.6v-2.6' />
  </Icon>
)

// A glowing lamp: the round's hint
export const HintIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    {/* Glass, its highlight, then the screw base and tip */}
    <path d='M9.8 15.6c-1.5-1-2.4-2.8-2.4-4.6a4.6 4.6 0 0 1 9.2 0c0 1.8-.9 3.6-2.4 4.6' />
    <path d='M9.7 9.6a2.6 2.6 0 0 1 2-1.9' />
    <path d='M9.8 15.6v2.6a1.2 1.2 0 0 0 1.2 1.2h2a1.2 1.2 0 0 0 1.2-1.2v-2.6Z' />
    <path d='M11.2 21.5h1.6' />
    {/* Rays */}
    <path d='M12 2.2v1.6M5.8 4.8 7 6M18.2 4.8 17 6M3 11h1.6M19.4 11H21' />
  </Icon>
)

const Speaker = () => <path d='M4.2 9.4h3l4.4-3.6v12.5l-4.4-3.6h-3Z' />

export const SoundOnIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <Speaker />
    <path d='M15 9.3c.9.7 1.4 1.7 1.4 2.8s-.5 2.1-1.4 2.8' />
    <path d='M17.5 6.9c1.6 1.3 2.4 3.1 2.4 5.2s-.8 3.9-2.4 5.2' />
  </Icon>
)

export const SoundOffIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <Speaker />
    <path d='m15.2 9.6 4.9 4.9M20.1 9.6l-4.9 4.9' />
  </Icon>
)

export const BackIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <path d='M14.6 5.4 8.2 12l6.4 6.6' />
  </Icon>
)

export const ForwardIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <path d='m9.4 5.4 6.4 6.6-6.4 6.6' />
  </Icon>
)

// Points forward: the bottom bar moves the game ahead
export const ArrowIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <path d='M4.4 12h13.2' />
    <path d='m12.2 6.2 5.8 5.8-5.8 5.8' />
  </Icon>
)

// Three bars on a baseline: the statistics
export const StatsIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <path d='M3.6 20.2h16.8' />
    <path d='M6.6 20.2v-6.4M12 20.2V6.6M17.4 20.2v-9.8' strokeWidth={2.6} />
  </Icon>
)

export const CopyIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <rect x='8.4' y='8.4' width='11.4' height='11.4' rx='1.6' />
    <path d='M15.6 8.4V5.8a1.6 1.6 0 0 0-1.6-1.6H5.8a1.6 1.6 0 0 0-1.6 1.6V14a1.6 1.6 0 0 0 1.6 1.6h2.6' />
  </Icon>
)

// Three linked dots: send the link
export const ShareIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <circle cx='17.6' cy='5.8' r='2.4' />
    <circle cx='6.4' cy='12' r='2.4' />
    <circle cx='17.6' cy='18.2' r='2.4' />
    <path d='m8.5 10.8 7-3.8M8.5 13.2l7 3.8' />
  </Icon>
)

export const CloseIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <path d='m6.4 6.4 11.2 11.2M17.6 6.4 6.4 17.6' />
  </Icon>
)

export const ChevronDownIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <path d='m6.4 9.4 5.6 5.6 5.6-5.6' />
  </Icon>
)

// Filled marks for toasts, readable at a small size
export const SuccessIcon: FC<TIconProps> = (props) => (
  <Icon {...props} stroke='none'>
    <circle cx='12' cy='12' r='10' fill='currentColor' />
    <path d='m7.6 12.2 3 3 5.8-6' fill='none' stroke='#fff' strokeWidth={2.2} />
  </Icon>
)

export const ErrorIcon: FC<TIconProps> = (props) => (
  <Icon {...props} stroke='none'>
    <circle cx='12' cy='12' r='10' fill='currentColor' />
    <path d='m8.6 8.6 6.8 6.8M15.4 8.6l-6.8 6.8' fill='none' stroke='#fff' strokeWidth={2.2} />
  </Icon>
)
