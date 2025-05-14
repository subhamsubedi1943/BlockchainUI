"use client"

import { useState } from 'react'
import { useWeb3 } from '@/lib/web3/Web3Provider'
import { ContractService } from '@/lib/web3/contractService'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ManufacturerMedicines } from './ManufacturerMedicines'

export function ManufacturerPanel() {
  const { contract, isConnected, account } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form states
  const [medicineName, setMedicineName] = useState('')
  const [composition, setComposition] = useState('')
  const [manufacturingDate, setManufacturingDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  
  // Transfer to retailer states
  const [medicineId, setMedicineId] = useState('')
  const [retailerAddress, setRetailerAddress] = useState('')

  const handleAddMedicine = async (e: React.FormEvent) => {
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
      
      // Convert string dates to Date objects
      const mfgDate = new Date(manufacturingDate)
      const expDate = new Date(expiryDate)
      
      // Validate dates
      if (mfgDate >= expDate) {
        throw new Error("Expiry date must be after manufacturing date")
      }
      
      await service.addMedicine(medicineName, composition, mfgDate, expDate)
      
      toast.success("Success", {
        description: "Medicine added successfully"
      })
      
      // Reset form
      setMedicineName('')
      setComposition('')
      setManufacturingDate('')
      setExpiryDate('')
      
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to add medicine"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleTransferToRetailer = async (e: React.FormEvent) => {
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
      await service.sellMedicineToRetailer(Number(medicineId), retailerAddress)
      
      toast.success("Success", {
        description: "Medicine transferred to retailer successfully"
      })
      
      // Reset form
      setMedicineId('')
      setRetailerAddress('')
      
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to transfer medicine to retailer"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manufacturer Panel</CardTitle>
          <CardDescription>
            Please connect your wallet to access manufacturer functions
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Manufacture New Medicine</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add Medicine</TabsTrigger>
                <TabsTrigger value="transfer">Transfer to Retailer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="add">
                <form onSubmit={handleAddMedicine} className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Medicine Name</Label>
                    <Input 
                      id="name" 
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="composition">Composition</Label>
                    <Input 
                      id="composition" 
                      value={composition}
                      onChange={(e) => setComposition(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="mfgDate">Manufacturing Date</Label>
                    <Input 
                      id="mfgDate" 
                      type="date"
                      value={manufacturingDate}
                      onChange={(e) => setManufacturingDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="expDate">Expiry Date</Label>
                    <Input 
                      id="expDate" 
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Adding..." : "Add Medicine"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="transfer">
                <form onSubmit={handleTransferToRetailer} className="space-y-4 mt-4">
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
                    <Label htmlFor="retailerAddress">Retailer Address</Label>
                    <Input 
                      id="retailerAddress" 
                      value={retailerAddress}
                      onChange={(e) => setRetailerAddress(e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Transferring..." : "Transfer to Retailer"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-1">
        <ManufacturerMedicines />
      </div>
    </div>
  )
} 