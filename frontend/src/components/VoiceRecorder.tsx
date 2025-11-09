import { useState, useRef } from 'react'

import { Button } from './Button'
import { Mic, Square, Loader2 } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onError?: (error: string) => void
}

export function VoiceRecorder({ onRecordingComplete, onError }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        
        // Reset
        setRecordingTime(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error accessing microphone:', error)
      onError?.('Could not access microphone. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center space-x-4">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Mic className="w-4 h-4" />
          <span>Start Recording</span>
        </Button>
      ) : (
        <>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording</span>
            </div>
            <span className="text-sm text-gray-600 font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>
          <Button
            onClick={stopRecording}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </Button>
        </>
      )}
    </div>
  )
}

interface VoiceInputProps {
  onTranscriptReady: (transcript: string) => void
}

export function VoiceInput({ onTranscriptReady }: VoiceInputProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError(null)

    try {
      // Convert to File for upload
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
      
      // Send to backend for transcription
      const formData = new FormData()
      formData.append('file', audioFile)
      formData.append('audio_format', 'webm')

      const response = await fetch('/api/upload/voice', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process recording')
      }

      const data = await response.json()
      
      if (data.success && data.extracted_data?.summary) {
        onTranscriptReady(data.extracted_data.summary)
      } else {
        throw new Error('No transcript available')
      }
    } catch (err) {
      setError('Failed to process recording. Please try again.')
      console.error('Error processing recording:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-3">
      {isProcessing ? (
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing your voice input...</span>
        </div>
      ) : (
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onError={setError}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}



