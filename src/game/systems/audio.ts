export class AudioSystem {
  private context: AudioContext | null = null

  private getContext() {
    if (!this.context) {
      this.context = new AudioContext()
    }
    return this.context
  }

  playTone(frequency: number, duration = 0.12, type: OscillatorType = 'sine') {
    const context = this.getContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.value = 0.05

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start()
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration)
    oscillator.stop(context.currentTime + duration)
  }

  playDice() {
    this.playTone(240, 0.06, 'square')
    window.setTimeout(() => this.playTone(330, 0.05, 'square'), 70)
  }

  playStep() {
    this.playTone(180, 0.04, 'triangle')
  }

  playGood() {
    this.playTone(440, 0.12, 'sine')
    window.setTimeout(() => this.playTone(660, 0.16, 'sine'), 120)
  }

  playDanger() {
    this.playTone(120, 0.16, 'sawtooth')
    window.setTimeout(() => this.playTone(80, 0.18, 'sawtooth'), 130)
  }

  playVictory() {
    ;[392, 523, 659, 784].forEach((note, index) => {
      window.setTimeout(() => this.playTone(note, 0.18, 'sine'), index * 130)
    })
  }
}
