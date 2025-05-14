"use client"

import { useWeb3 } from '@/lib/web3/Web3Provider'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

export function WalletConnect() {
  const { connectWallet, isConnected, account, isLoading, error } = useWeb3()
  const [isAttemptingConnect, setIsAttemptingConnect] = useState(false)

  const handleConnect = async () => {
    setIsAttemptingConnect(true)
    try {
      await connectWallet()
    } catch (err: any) {
      toast.error("Connection Error", {
        description: err.message || "Failed to connect wallet"
      })
    } finally {
      setIsAttemptingConnect(false)
    }
  }

  const copyWalletAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      toast.success("Wallet address copied", {
        description: `${account.slice(0, 10)}...${account.slice(-8)}`
      })
    }
  }

  // Display metamask not found error
  if (error && error.includes("install MetaMask")) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-destructive text-sm">
          MetaMask not detected. Please install MetaMask to use this application.
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.open("https://metamask.io/download/", "_blank")}
        >
          Install MetaMask
        </Button>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center space-y-2">
      {!isConnected ? (
        <Button 
          onClick={handleConnect} 
          disabled={isLoading || isAttemptingConnect}
          className="bg-primary text-primary-foreground"
        >
          {isLoading || isAttemptingConnect ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <div 
            className="backdrop-blur-md bg-accent/50 py-1 px-3 rounded-full text-sm flex items-center space-x-2 cursor-pointer hover:bg-accent/70 transition-colors"
            onClick={copyWalletAddress}
            title="Click to copy address"
          >
            <div className="relative h-2.5 w-2.5 flex-shrink-0">
              <div className="absolute h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <div className="absolute h-2.5 w-2.5 rounded-full bg-green-500 blur-sm opacity-70"></div>
              <div className="absolute h-4 w-4 -top-0.75 -left-0.75 rounded-full bg-green-500/20 blur-md"></div>
            </div>
            <span>Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
          </div>
        </div>
      )}
      
      {error && error !== "Please install MetaMask to use this application" && (
        <div className="text-destructive text-sm mt-2">{error}</div>
      )}
    </div>
  )
} 