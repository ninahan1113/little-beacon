// Web Audio API sound effects - no external files needed
const audioCtx = () => {
  if (!window._audioCtx) {
    window._audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return window._audioCtx
}

// Ensure audio context is resumed (needed after user interaction on mobile)
const ensureAudio = () => {
  const ctx = audioCtx()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Camera shutter click
export const playShutter = () => {
  try {
    const ctx = ensureAudio()
    const noise = ctx.createBufferSource()
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 8)
    }
    noise.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.value = 0.3
    noise.connect(gain).connect(ctx.destination)
    noise.start()
  } catch {}
}

// Success chime (task submitted)
export const playSuccess = () => {
  try {
    const ctx = ensureAudio()
    const now = ctx.currentTime
    const notes = [523, 659, 784] // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.15, now + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.12)
      osc.stop(now + i * 0.12 + 0.4)
    })
  } catch {}
}

// Celebration fanfare (approval / gem earned)
export const playCelebration = () => {
  try {
    const ctx = ensureAudio()
    const now = ctx.currentTime
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.2, now + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.5)
    })
  } catch {}
}

// Coin / gem sound
export const playGem = () => {
  try {
    const ctx = ensureAudio()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(987, now) // B5
    osc.frequency.exponentialRampToValueAtTime(1319, now + 0.1) // E6
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.3)
  } catch {}
}

// Button tap
export const playTap = () => {
  try {
    const ctx = ensureAudio()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 800
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  } catch {}
}
