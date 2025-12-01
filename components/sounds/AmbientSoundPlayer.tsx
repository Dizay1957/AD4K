"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react"

interface Sound {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

const sounds: Sound[] = [
  { id: "white-noise", name: "White Noise", description: "Constant and soothing sound", icon: "⚪", color: "bg-gray-100" },
  { id: "brown-noise", name: "Brown Noise", description: "Deeper than white noise", icon: "🟤", color: "bg-amber-100" },
  { id: "forest", name: "Forest", description: "Birds and nature", icon: "🌲", color: "bg-green-100" },
  { id: "rain", name: "Rain", description: "Soft and relaxing rain", icon: "🌧️", color: "bg-blue-100" },
  { id: "ocean", name: "Ocean", description: "Soothing waves", icon: "🌊", color: "bg-cyan-100" },
  { id: "cafe", name: "Cafe", description: "Cafe ambiance", icon: "☕", color: "bg-yellow-100" },
  { id: "instrumental", name: "Soft Music", description: "Instrumental music", icon: "🎵", color: "bg-purple-100" },
]

interface SoundData {
  audioContext: AudioContext
  oscillator: OscillatorNode
  gainNode: GainNode
  volume: number
}

export function AmbientSoundPlayer() {
  const [activeSounds, setActiveSounds] = useState<Map<string, SoundData>>(new Map())
  const [isMuted, setIsMuted] = useState(false)

  const toggleSound = (sound: Sound) => {
    const isActive = activeSounds.has(sound.id)

    if (isActive) {
      // Stop sound
      const soundData = activeSounds.get(sound.id)!
      try {
        soundData.oscillator.stop()
        soundData.audioContext.close()
      } catch (e) {
        // Already stopped or closed
      }
      const newMap = new Map(activeSounds)
      newMap.delete(sound.id)
      setActiveSounds(newMap)
    } else {
      // Start sound
      // Create a simple tone using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different frequencies for different sounds
      const frequencies: Record<string, number> = {
        "white-noise": 200,
        "brown-noise": 150,
        "forest": 300,
        "rain": 250,
        "ocean": 180,
        "cafe": 220,
        "instrumental": 400,
      }

      oscillator.frequency.value = frequencies[sound.id] || 200
      oscillator.type = sound.id.includes("noise") ? "sawtooth" : "sine"
      gainNode.gain.value = isMuted ? 0 : 0.3

      oscillator.start()

      // Store audio context and nodes
      const newMap = new Map(activeSounds)
      newMap.set(sound.id, {
        audioContext,
        oscillator,
        gainNode,
        volume: 0.3,
      })
      setActiveSounds(newMap)
    }
  }

  const handleVolumeChange = (soundId: string, volume: number) => {
    const soundData = activeSounds.get(soundId)
    if (soundData) {
      soundData.volume = volume
      if (soundData.gainNode) {
        soundData.gainNode.gain.value = isMuted ? 0 : volume
      }
      setActiveSounds(new Map(activeSounds))
    }
  }

  const handleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    activeSounds.forEach((soundData) => {
      if (soundData.gainNode) {
        soundData.gainNode.gain.value = newMutedState ? 0 : soundData.volume
      }
    })
  }

  const stopAll = () => {
    activeSounds.forEach((soundData) => {
      try {
        soundData.oscillator.stop()
        soundData.audioContext.close()
      } catch (e) {
        // Already stopped or closed
      }
    })
    setActiveSounds(new Map())
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Controls</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMute}>
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={stopAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Stop All
            </Button>
          </div>
        </div>
        {activeSounds.size > 0 && (
          <div className="space-y-3">
            {Array.from(activeSounds.entries()).map(([soundId, soundData]) => {
              const sound = sounds.find((s) => s.id === soundId)!
              return (
                <div key={soundId} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 w-32">{sound.name}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundData.volume}
                    onChange={(e) => handleVolumeChange(soundId, parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">{Math.round(soundData.volume * 100)}%</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Sound Library */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sounds.map((sound) => {
          const isActive = activeSounds.has(sound.id)
          return (
            <Card
              key={sound.id}
              variant="elevated"
              className={`cursor-pointer transition-all hover:scale-105 ${
                isActive ? "ring-2 ring-primary-500" : ""
              }`}
              onClick={() => toggleSound(sound)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${sound.color} rounded-xl flex items-center justify-center text-3xl`}>
                  {sound.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{sound.name}</h3>
                  <p className="text-sm text-gray-600">{sound.description}</p>
                </div>
                <Button variant="ghost" size="sm">
                  {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <Card variant="outlined" className="p-4 bg-blue-50">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> You can play multiple sounds at the same time to create your own mix!
        </p>
      </Card>
    </div>
  )
}

