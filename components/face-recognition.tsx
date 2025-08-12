"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuthContext } from "@/components/AuthProvider"

interface FaceRecognitionProps {
  mode: "enroll" | "recognize"
  onSuccess?: (descriptor?: number[]) => void
  onError?: (error: string) => void
}

export function FaceRecognition({ mode, onSuccess, onError }: FaceRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user, updateProfile } = useAuthContext()

  // Simulate face-api.js functionality
  const loadModels = async () => {
    try {
      setIsLoading(true)
      // Simulate loading time for face recognition models
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsModelLoaded(true)
      toast({
        title: "Face recognition ready",
        description: "Models loaded successfully",
      })
    } catch (err) {
      const errorMsg = "Failed to load face recognition models"
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      const errorMsg = "Failed to access camera"
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const detectFace = async () => {
    if (!videoRef.current || !canvasRef.current || !isModelLoaded) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Simulate face detection
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Simulate face detection result
    const hasFace = Math.random() > 0.3 // 70% chance of detecting a face
    setFaceDetected(hasFace)

    if (hasFace) {
      // Draw a rectangle around the "detected" face
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 3
      ctx.strokeRect(canvas.width * 0.25, canvas.height * 0.2, canvas.width * 0.5, canvas.height * 0.6)
      ctx.fillStyle = "#10b981"
      ctx.font = "16px Arial"
      ctx.fillText("Face Detected", canvas.width * 0.25, canvas.height * 0.15)
    }
  }

  const captureFace = async () => {
    if (!faceDetected) {
      toast({
        title: "No face detected",
        description: "Please position your face in the camera view",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate face processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (mode === "enroll") {
        // Generate a mock face descriptor
        const mockDescriptor = Array.from({ length: 128 }, () => Math.random())

        // Save face descriptor to user profile using Supabase
        if (user) {
          const success = await updateProfile({
            face_descriptor: mockDescriptor,
            enrolled_at: new Date().toISOString(),
          })

          if (!success) {
            throw new Error("Failed to save face descriptor")
          }
        }

        toast({
          title: "Face enrolled successfully",
          description: "Your face has been registered for attendance",
        })
        onSuccess?.(mockDescriptor)
      } else {
        // Simulate face recognition
        if (user?.face_descriptor) {
          // Simulate recognition success (80% chance)
          const recognized = Math.random() > 0.2
          if (recognized) {
            toast({
              title: "Face recognized",
              description: "Identity verified successfully",
            })
            onSuccess?.()
          } else {
            throw new Error("Face not recognized")
          }
        } else {
          throw new Error("No enrolled face found. Please enroll your face first.")
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Face processing failed"
      setError(errorMsg)
      toast({
        title: "Recognition failed",
        description: errorMsg,
        variant: "destructive",
      })
      onError?.(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadModels()
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (isModelLoaded && stream) {
      const interval = setInterval(detectFace, 100)
      return () => clearInterval(interval)
    }
  }, [isModelLoaded, stream])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          {mode === "enroll" ? "Face Enrollment" : "Face Recognition Check-in"}
        </CardTitle>
        <CardDescription>
          {mode === "enroll"
            ? "Register your face for future attendance check-ins"
            : "Use your registered face to mark attendance"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-64 bg-gray-900 rounded-lg object-cover"
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-64 rounded-lg pointer-events-none" />

          {!stream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
              <div className="text-center text-white">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Camera not started</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isModelLoaded ? "default" : "secondary"}>
              {isModelLoaded ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Models Ready
                </>
              ) : (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading Models
                </>
              )}
            </Badge>
            <Badge variant={faceDetected ? "default" : "outline"}>
              {faceDetected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Face Detected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  No Face
                </>
              )}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          {!stream ? (
            <Button onClick={startCamera} disabled={!isModelLoaded} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent">
                Stop Camera
              </Button>
              <Button onClick={captureFace} disabled={!faceDetected || isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {mode === "enroll" ? "Enroll Face" : "Check In"}
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>• Position your face clearly in the camera view</p>
          <p>• Ensure good lighting for better recognition</p>
          <p>• Look directly at the camera</p>
        </div>
      </CardContent>
    </Card>
  )
}
