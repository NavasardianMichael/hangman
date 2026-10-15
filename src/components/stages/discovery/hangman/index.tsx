'use client'

import { FC, useId, useState } from 'react'
import { MAX_MISTAKES } from 'helpers/constants/app'
import { combineClassNames } from 'helpers/utils/styles'
import styles from './styles.module.css'

export type THangmanStatus = 'playing' | 'won' | 'lost'

type TProps = {
  // Number of mistakes so far; each one adds a body part
  step: number
  status: THangmanStatus
}

// Body parts in the order they appear, drawn in the 240×240 viewBox
const BODY_PARTS = [
  // torso with shoulders
  'M159 112 C162 109 170 109 173 112 M166 103 C165.2 116 165.6 131 166.4 146',
  // left arm and hand
  'M159.5 112.5 C155.5 120 153.2 126 152.2 131.5 C151.2 137 151.6 142 152.6 147 C151.2 149.6 151.8 151.2 153.8 151.6',
  // right arm and hand
  'M172.5 112.5 C176.5 120 178.8 126 179.8 131.5 C180.8 137 180.4 142 179.4 147 C180.8 149.6 180.2 151.2 178.2 151.6',
  // left leg and foot
  'M165.6 146 C163.2 158 161.2 168 160.2 176 C159.6 184 159.6 190 160 196 C157.2 197.6 154.6 198 152.8 197.4',
  // right leg and foot
  'M167.2 146 C169.6 158 171.6 168 172.6 176 C173.2 184 173.2 190 172.8 196 C175.6 197.6 178.2 198 180 197.4',
] as const

const FACE = {
  playing: {
    eyes: <path d='M162.2 89.6 h0.01 M169.8 89.6 h0.01' strokeWidth={2.6} />,
    calmMouth: <path d='M163 96.4 C165 97.4 167 97.4 169 96.4' />,
    worriedMouth: <ellipse cx={166} cy={97} rx={1.8} ry={1.5} />,
    calmBrows: <path d='M159.8 86.2 L163.8 85.8 M168.2 85.8 L172.2 86.2' />,
    worriedBrows: <path d='M159.8 87.4 L163.8 85.4 M168.2 85.4 L172.2 87.4' />,
  },
  won: (
    <>
      <path d='M160.4 90.4 C161.4 88.6 163 88.6 164 90.4 M168 90.4 C169 88.6 170.6 88.6 171.6 90.4' />
      <path d='M162 95.2 C164 98.8 168 98.8 170 95.2' />
    </>
  ),
  lost: (
    <>
      <path d='M160.6 88.2 L163.6 91.2 M163.6 88.2 L160.6 91.2 M168.4 88.2 L171.4 91.2 M171.4 88.2 L168.4 91.2' />
      <path d='M162.4 98.6 C164.4 96.4 167.6 96.4 169.6 98.6' />
    </>
  ),
}

// An ink-pen gallows that matches the background illustration; parts are "drawn" as mistakes add up
export const Hangman: FC<TProps> = ({ step, status }) => {
  const filterId = `ink-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const visibleParts = status === 'lost' ? MAX_MISTAKES : Math.min(step, MAX_MISTAKES)
  // Parts present when the round is restored (e.g. after a reload) appear without re-drawing
  const [initialVisibleParts] = useState(visibleParts)

  const partClass = (index: number) =>
    combineClassNames(styles.part, index < visibleParts && styles.shown, index < initialVisibleParts && styles.instant)

  const isHeadShown = visibleParts > 0
  const isWorried = step >= 4

  return (
    <svg
      className={styles.hangman}
      viewBox='0 0 240 240'
      role='img'
      aria-label={`Կախաղան՝ ${Math.min(step, MAX_MISTAKES + 1)} սխալ ${MAX_MISTAKES + 1}-ից`}
    >
      <defs>
        {/* Slight wobble so lines look hand-drawn */}
        <filter id={filterId} x='-5%' y='-5%' width='110%' height='110%'>
          <feTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves={2} seed={7} result='noise' />
          <feDisplacementMap in='SourceGraphic' in2='noise' scale={1.6} xChannelSelector='R' yChannelSelector='G' />
        </filter>
      </defs>

      <g filter={`url(#${filterId})`} className={styles.ink}>
        {/* Gallows */}
        <g className={combineClassNames(styles.gallows, initialVisibleParts > 0 && styles.instant)}>
          {/* platform planks */}
          <path className={styles.wood} d='M6 223 L234 222 L234 233 L6 234 Z' pathLength={1} />
          <path
            className={styles.grain}
            d='M64 223 L64 233.5 M122 222.6 L122 233.2 M182 222.4 L182 232.8 M14 227.4 C30 226.8 44 228 58 227.4 M72 228.6 C88 228 100 229 116 228.4 M130 227 C146 226.6 160 227.6 176 227 M190 229 C204 228.4 216 229.2 228 228.6'
          />
          {/* base struts */}
          <path className={styles.wood} d='M42 186 L47 190 L23 223 L16 222 Z M50 186 L55 183.6 L82 222 L75 223 Z' pathLength={1} />
          {/* upright post */}
          <path className={styles.wood} d='M38 26 L53 25.4 L54.6 223 L39.6 223.4 Z' pathLength={1} />
          <path
            className={styles.grain}
            d='M42.4 36 C43.6 76 41.4 116 43.2 156 C44.2 186 42.4 204 43.4 218 M48.6 32 C47.8 68 50 108 48.4 148 C47.4 182 49.4 198 48.8 214'
          />
          <ellipse className={styles.grain} cx={46.4} cy={118} rx={2.2} ry={4.4} />
          <ellipse className={styles.grain} cx={45.2} cy={172} rx={1.5} ry={3} />
          {/* tally marks scratched into the post */}
          <path className={styles.grain} d='M41.6 140 L41.8 147 M43.6 139.6 L43.8 146.6 M45.6 139.4 L45.8 146.4 M40.6 145 L47 141.2' />
          {/* top beam */}
          <path className={styles.wood} d='M26 15.6 L202 13.4 L203 27 L27 28.8 Z' pathLength={1} />
          <path
            className={styles.grain}
            d='M34 19.4 C62 18.4 84 20 108 19.2 M118 18.8 C142 18 166 19.4 196 18.2 M40 24.6 C70 23.8 96 25.2 124 24.4 M134 24.2 C156 23.6 178 24.6 198 23.6'
          />
          <ellipse className={styles.grain} cx={196.6} cy={20.4} rx={2.2} ry={2.4} />
          {/* diagonal brace lashed with rope */}
          <path className={styles.wood} d='M52.6 74 L56.6 81 L101 27.6 L93 27.4 Z' pathLength={1} />
          <path className={styles.grain} d='M56 75.4 L96.4 28.6' />
          <path
            className={styles.rope}
            d='M51.8 70 C55 70.6 58 72.4 59.6 75 M52 73.6 C55.2 74.2 57.8 75.8 59 78.2 M89.6 26.6 C91 29.6 93.6 31.6 96.6 32.2 M93.4 26.2 C94.6 28.8 96.8 30.6 99.6 31.2'
          />
          {/* crow on the beam, a nod to the background art */}
          <path
            className={styles.crow}
            d='M62 14.6 C61.4 10.6 64.6 7.4 68.8 7.6 C70.4 6 73.6 6 75.2 7.6 L79.6 8.2 L75.8 9.6 C76.4 12.2 74.6 14.6 71 15.4 L72.8 16.4 L64.6 16.2 C63.2 16 62.2 15.6 62 14.6 Z M66.4 16 L65.8 18 M69.6 16 L69.4 18'
          />
        </g>

        {/* Rope, noose and figure sway together from the beam */}
        <g className={combineClassNames(styles.hanging, status === 'lost' && styles.still)}>
          <ellipse className={styles.rope} cx={166} cy={21.2} rx={4.6} ry={8.6} />
          <path
            className={styles.rope}
            d='M164.6 29 C167.4 32 167.4 35 164.6 38 C161.8 41 161.8 44 164.6 47 C167.4 50 167.4 53 164.6 56 C162.6 58.2 162.8 60.2 164.6 62 M167.4 29 C164.6 32 164.6 35 167.4 38 C170.2 41 170.2 44 167.4 47 C164.6 50 164.6 53 167.4 56 C169.4 58.2 169.2 60.2 167.4 62'
          />
          {/* noose coils and loop */}
          <path
            className={styles.rope}
            d='M160.6 62.4 C162.4 60.8 169.6 60.8 171.4 62.4 M160.6 65.6 C162.4 64 169.6 64 171.4 65.6 M160.6 68.8 C162.4 67.2 169.6 67.2 171.4 68.8 M160.6 72 C162.4 70.4 169.6 70.4 171.4 72 M160.6 75.2 C162.4 73.6 169.6 73.6 171.4 75.2 M160.6 62.4 L160.9 75.4 M171.4 62.4 L171.1 75.4'
          />
          <path className={styles.rope} d='M161.6 76 C156.2 86 158 103.6 166 105.6 C174 103.6 175.8 86 170.4 76' />

          {/* head with hair and face */}
          <g className={combineClassNames(styles.head, status === 'lost' && styles.drooped)}>
            <ellipse
              className={combineClassNames(styles.headFill, isHeadShown && styles.shown, initialVisibleParts > 0 && styles.instant)}
              cx={166}
              cy={90.4}
              rx={10.6}
              ry={12.2}
            />
            <ellipse className={partClass(0)} cx={166} cy={90.4} rx={10.6} ry={12.2} pathLength={1} />
            <g className={combineClassNames(styles.features, isHeadShown && styles.shown, initialVisibleParts > 0 && styles.instant)}>
              <path
                className={styles.hair}
                d='M156.6 85 C158.6 78.6 163.6 77 168.6 77.8 C172.4 78.6 175 81.2 176 85.4 M159.4 82.2 L161 79.4 M162.8 80.4 L164 77.8 M166.8 79.8 L167.4 77.6 M170.6 80.6 L171.6 78.6 M173.6 82.6 L175 80.8'
              />
              {status === 'playing' && (
                <>
                  {FACE.playing.eyes}
                  {isWorried ? FACE.playing.worriedBrows : FACE.playing.calmBrows}
                  {isWorried ? FACE.playing.worriedMouth : FACE.playing.calmMouth}
                </>
              )}
              {status === 'won' && FACE.won}
              {status === 'lost' && FACE.lost}
            </g>
          </g>

          {BODY_PARTS.map((d, i) => (
            <path key={d} className={combineClassNames(partClass(i + 1), styles.limb)} d={d} pathLength={1} />
          ))}
        </g>
      </g>
    </svg>
  )
}
