import { GAME_STAGES } from 'helpers/constants/app'
import { STAGE_PATHS, stageFromPath } from 'helpers/constants/routes'

type TStage = (typeof GAME_STAGES)[keyof typeof GAME_STAGES]

/*
 * Browser history for the game, kept to at most three entries so device back gestures behave predictably:
 *   level 0 — the start screen ("/")
 *   level 1 — the current game screen (replaced as the game moves on, so back never replays old rounds)
 *   level 2 — an open dialog (back closes it)
 * History calls go through Next.js's patched pushState/replaceState, so the URL changes without a page load.
 */

const LEVEL_KEY = 'hangmanLevel'

type TRouterOptions = {
  // Decides the first screen from the URL (validating it against the saved game)
  resolveInitialStage: (urlStage: TStage) => TStage
  // The player went back from a game screen to the start entry
  onUserBack: (from: TStage) => void
  // The player went forward to a game screen
  onUserForward: (to: TStage) => void
  onReady: () => void
}

let options: TRouterOptions | null = null
let currentStage: TStage = GAME_STAGES.start
const pendingBacks: Array<() => void> = []
const overlays: Array<{ close: () => void }> = []

let markReady: () => void = () => {}
const readyPromise = new Promise<void>((resolve) => {
  markReady = resolve
})
let queue: Promise<void> = readyPromise

// History operations run one at a time, after the router has started
const enqueue = (operation: () => void | Promise<void>) => {
  queue = queue.then(operation).catch((error) => console.error('Game router error', error))
  return queue
}

const getLevel = () => {
  const level = window.history.state?.[LEVEL_KEY]
  return typeof level === 'number' ? level : undefined
}

const pushEntry = (level: number, path: string) => window.history.pushState({ [LEVEL_KEY]: level }, '', path)

const replaceEntry = (level: number, path: string) => window.history.replaceState({ [LEVEL_KEY]: level }, '', path)

// A programmatic back step; resolves when the browser reports it
const goBack = () =>
  new Promise<void>((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      resolve()
    }
    pendingBacks.push(finish)
    window.history.back()
    // Nothing to go back to: no popstate will arrive
    setTimeout(() => {
      const index = pendingBacks.indexOf(finish)
      if (index !== -1) pendingBacks.splice(index, 1)
      finish()
    }, 600)
  })

const handlePopState = () => {
  const ownBack = pendingBacks.shift()
  if (ownBack) return ownBack()

  // Back closes the top dialog first
  const overlay = overlays.pop()
  if (overlay) return overlay.close()

  const level = getLevel() ?? 0
  const stage = stageFromPath(window.location.pathname)

  // Forward onto an entry of a dialog that is no longer open
  if (level >= 2) return void enqueue(goBack)
  if (stage === currentStage) return

  const from = currentStage
  currentStage = stage
  if (stage === GAME_STAGES.start) options?.onUserBack(from)
  else options?.onUserForward(stage)
}

// Resolves once every queued history change has been applied
export const whenNavigationSettles = () => queue

// Shows a game screen: pushed above start, otherwise replacing the current screen entry
export const navigate = (stage: TStage) =>
  enqueue(async () => {
    // Dialogs don't survive a screen change
    while (overlays.length) overlays.pop()?.close()
    let level = getLevel() ?? 0
    while (level >= 2) {
      await goBack()
      level = getLevel() ?? 0
    }

    if (stage === GAME_STAGES.start) {
      if (level === 1) await goBack()
      else replaceEntry(0, STAGE_PATHS.start)
    } else if (level === 0) {
      pushEntry(1, STAGE_PATHS[stage])
    } else {
      replaceEntry(1, STAGE_PATHS[stage])
    }
    currentStage = stage
  })

// Puts a screen back after the player's back gesture was intercepted (e.g. to ask before leaving a game)
export const restoreStage = (stage: TStage) =>
  enqueue(() => {
    pushEntry(1, STAGE_PATHS[stage])
    currentStage = stage
  })

// Registers an open dialog so the back gesture closes it; returns the cleanup for when it closes otherwise
export const openOverlay = (close: () => void) => {
  const overlay = { close }
  overlays.push(overlay)
  enqueue(() => {
    if (overlays.includes(overlay)) pushEntry(2, window.location.pathname)
  })

  return () => {
    const index = overlays.indexOf(overlay)
    if (index === -1) return
    overlays.splice(index, 1)
    enqueue(async () => {
      if ((getLevel() ?? 0) >= 2) await goBack()
    })
  }
}

export const initGameRouter = (routerOptions: TRouterOptions) => {
  options = routerOptions
  window.addEventListener('popstate', handlePopState)

  // Next.js patches the history API in an effect that runs after ours; wait for it
  const timeoutId = setTimeout(() => {
    // Entries from before a page load belong to the old document: going back to them reloads the page instead of
    // firing popstate. So the start entry is always (re)created in this document, with the game screen above it.
    const stage = routerOptions.resolveInitialStage(stageFromPath(window.location.pathname))
    replaceEntry(0, STAGE_PATHS.start)
    if (stage !== GAME_STAGES.start) pushEntry(1, STAGE_PATHS[stage])
    currentStage = stage
    markReady()
    routerOptions.onReady()
  }, 0)

  return () => {
    clearTimeout(timeoutId)
    window.removeEventListener('popstate', handlePopState)
  }
}
