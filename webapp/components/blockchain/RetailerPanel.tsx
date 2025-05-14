"use client"

import { useState } from 'react'
import { useWeb3 } from '@/lib/web3/Web3Provider'
import { ContractService } from '@/lib/web3/contractService'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RetailerPanel() {
  const { contract, isConnected } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form states
  const [medicineId, setMedicineId] = useState('')
  const [buyerAddress, setBuyerAddress] = useState('')

  const handleTransferToBuyer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || !isConnected) {
      toast.error("Error", {
        description: "Please connect your wallet first"
      })
      return
    }
    
    setIsLoading(true)
    try {
      const service = new ContractService(contract)
      await service.sellMedicineToBuyer(Number(medicineId), buyerAddress)
      
      toast.success("Success", {
        description: "Medicine transferred to buyer successfully"
      })
      
      // Reset form
      setMedicineId('')
      setBuyerAddress('')
      
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to transfer medicine to buyer"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Retailer Panel</CardTitle>
          <CardDescription>
            Please connect your wallet to access retailer functions
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Retailer Panel</CardTitle>
        <CardDescription>
          Transfer medicines to buyers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTransferToBuyer} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="medicineId">Medicine ID</Label>
            <Input 
              id="medicineId" 
              type="number"
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="buyerAddress">Buyer Address</Label>
            <Input 
              id="buyerAddress" 
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              placeholder="0x..."
              required
            />
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Transferring..." : "Transfer to Buyer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
} 