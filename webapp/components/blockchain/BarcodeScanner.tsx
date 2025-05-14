"use client"

import React, { useState, useEffect } from 'react'
import { useZxing } from 'react-zxing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Scan, X } from 'lucide-react'
import { useWeb3 } from '@/lib/web3/Web3Provider'

interface BarcodeScannerProps {
  onBarcodeScan?: (data: string) => void
  buttonText?: string
}

export function BarcodeScanner({ onBarcodeScan, buttonText = "Scan Barcode" }: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { setBarcodeData } = useWeb3()

  // Explicitly request camera access when dialog opens
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (isOpen) {
      setIsLoading(true)
      setError(null)
      
      // Explicitly request camera permission
      console.log("Requesting camera access...")
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' 
        } 
      })
      .then(mediaStream => {
        stream = mediaStream;
        console.log("Camera access granted")
        // Don't set loading to false here, the onPlay handler will do that
      })
      .catch(err => {
        console.error("Error accessing camera:", err)
        setIsLoading(false)
        
        if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.')
        } else {
          setError(`Error accessing camera: ${err.message}`)
        }
      });
    }
    
    // Clean up stream when component unmounts or dialog closes
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const { ref } = useZxing({
    onDecodeResult(result) {
      const text = result.getText()
      if (onBarcodeScan) {
        onBarcodeScan(text)
      }
      setBarcodeData(text)
      setIsOpen(false)
    },
    onError(error) {
      console.error("Scanner error:", error)
      setIsLoading(false)
      
      if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.')
      } else if (error.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else {
        setError(`Error accessing camera: ${error.message}`)
      }
    },
    constraints: { 
      video: { 
        facingMode: 'environment',
      } 
    },
    paused: !isOpen
  })

  // Handle camera stream starting
  const handleVideoPlay = () => {
    console.log("Video started playing")
    setIsLoading(false)
  }

  // Function to manually request camera access
  const requestCameraAccess = () => {
    setError(null)
    setIsLoading(true)
    
    // Force dialog to close and reopen to trigger the useEffect again
    setIsOpen(false)
    setTimeout(() => setIsOpen(true), 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 h-9" 
          onClick={() => setIsOpen(true)}
        >
          <Scan size={16} />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 rounded-full" 
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="relative overflow-hidden rounded-md border bg-muted/20 min-h-[300px]">
          {/* Loading indicator */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mb-2"></div>
                <p className="text-sm mb-2">Initializing camera...</p>
                <p className="text-xs text-muted-foreground">You may need to approve camera access</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={requestCameraAccess}
                >
                  Request Camera Access
                </Button>
              </div>
            </div>
          )}
          
          {/* Error message display */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center p-4 max-w-[80%]">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={requestCameraAccess}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Scanner component */}
          <video 
            ref={ref} 
            className="w-full h-[300px] object-cover"
            onPlay={handleVideoPlay}
            autoPlay
            playsInline
            muted
          />
          
          <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white bg-black/50 py-1">
            Position the barcode within the frame
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-2">
          Scanned data will automatically populate the input field
        </p>
      </DialogContent>
    </Dialog>
  )
} 