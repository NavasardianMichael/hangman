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

// Two players: whose turn it is
export const PlayersIcon: FC<TIconProps> = (props) => (
  <Icon {...props}>
    <path d='M8.6 11.2c1.5 0 2.7-1.2 2.7-2.7S10.1 5.7 8.6 5.7 5.9 7 5.9 8.5s1.2 2.7 2.7 2.7Z' />
    <path d='M3.6 18.6c.5-2.9 2.5-4.6 5-4.6s4.5 1.7 5 4.6' />
    <path d='M15.6 10.6c1.3.1 2.4-.9 2.5-2.2.1-1.3-.9-2.4-2.2-2.5' />
    <path d='M15.9 13.8c2.3-.1 4 1.4 4.6 4.3' />
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
