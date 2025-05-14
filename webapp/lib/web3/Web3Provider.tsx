"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import MedicineSupplyChainABI from '../../contracts/MedicineSupplyChain.json'

// Define types
type Web3ContextType = {
  account: string | null
  contract: ethers.Contract | null
  provider: ethers.providers.Web3Provider | null
  connectWallet: () => Promise<void>
  isConnected: boolean
  isLoading: boolean
  error: string | null
  barcodeData: string | null
  setBarcodeData: (data: string | null) => void
}

// Default context values
const defaultContext: Web3ContextType = {
  account: null,
  contract: null,
  provider: null,
  connectWallet: async () => {},
  isConnected: false,
  isLoading: false,
  error: null,
  barcodeData: null,
  setBarcodeData: () => {}
}

// Create context
const Web3Context = createContext<Web3ContextType>(defaultContext)

// Contract address from your deployment
const CONTRACT_ADDRESS = "0x08AAC4C2f4b766B5Ff2F4De39eDD549FeC436115" // Update with your deployed contract address

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [barcodeData, setBarcodeData] = useState<string | null>(null)

  const initializeProvider = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Create provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
        
        // Create contract instance
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MedicineSupplyChainABI.abi,
          signer
        )
        setContract(contract)
        
        // Check if already connected
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        }
        
        return { provider, contract }
      } catch (err: any) {
        setError(`Failed to initialize provider: ${err.message}`)
        console.error("Error initializing provider:", err)
      }
    } else {
      setError("Please install MetaMask to use this application")
    }
    return { provider: null, contract: null }
  }

  const connectWallet = async () => {
    if (!provider) {
      await initializeProvider()
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      } else {
        setError("Please install MetaMask to connect your wallet")
      }
    } catch (err: any) {
      setError(`Failed to connect wallet: ${err.message}`)
      console.error("Error connecting wallet:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        } else {
          setAccount(null)
          setIsConnected(false)
        }
      }

      // Initialize on mount
      initializeProvider()

      // Subscribe to account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
  }, [])

  const contextValue = {
    account,
    contract,
    provider,
    connectWallet,
    isConnected,
    isLoading,
    error,
    barcodeData,
    setBarcodeData,
  }

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context) 