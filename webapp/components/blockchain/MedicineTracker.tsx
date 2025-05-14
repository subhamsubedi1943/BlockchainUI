"use client"

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/lib/web3/Web3Provider'
import { ContractService, Medicine } from '@/lib/web3/contractService'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { ShieldCheck, ShieldAlert, Clock, Package, User, Search, Box, X } from 'lucide-react'
import { BarcodeScanner } from "@/components/blockchain/BarcodeScanner"

export function MedicineTracker() {
  const { contract, isConnected, barcodeData } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  const [medicineId, setMedicineId] = useState('')
  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [isExpired, setIsExpired] = useState<boolean | null>(null)

  // Update input when barcode is scanned
  useEffect(() => {
    if (barcodeData) {
      setMedicineId(barcodeData)
    }
  }, [barcodeData])

  const handleTrackMedicine = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || !isConnected) {
      toast.error("Error", {
        description: "Please connect your wallet first"
      })
      return
    }
    
    if (!medicineId) {
      toast.error("Error", {
        description: "Please enter a medicine ID"
      })
      return
    }
    
    setIsLoading(true)
    try {
      const service = new ContractService(contract)
      
      // Fetch medicine details
      const medicineDetails = await service.getMedicineDetails(Number(medicineId))
      setMedicine(medicineDetails)
      
      // Check if medicine is expired
      const expired = await service.isMedicineExpired(Number(medicineId))
      setIsExpired(expired)
      
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to track medicine"
      })
      setMedicine(null)
      setIsExpired(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Medicine Verification</CardTitle>
        <CardDescription>
          Track medicine details and verify authenticity on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTrackMedicine} className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="trackMedicineId"
                  type="number"
                  value={medicineId}
                  onChange={(e) => setMedicineId(e.target.value)}
                  placeholder="Enter Medicine ID or Scan Barcode"
                  className="pr-10"
                  required
                />
                {medicineId && (
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" 
                    onClick={(e) => {
                      e.preventDefault()
                      setMedicineId("")
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <BarcodeScanner onBarcodeScan={setMedicineId} />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the medicine ID as shown in the blockchain records. This may be different from the sequential order in which medicines were added.
            </p>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !medicineId || !isConnected}
            className="gap-2"
          >
            <Search size={16} />
            {isLoading ? "Tracking..." : "Track"}
          </Button>
        </form>
        
        {medicine ? (
          medicine.name ? (
            <div className="mt-6 space-y-6 border rounded-lg p-4 bg-card/50">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="text-xl font-semibold">{medicine.name}</h3>
                {isExpired !== null && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                    isExpired 
                      ? "bg-destructive/15 text-destructive border border-destructive/20" 
                      : "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                  }`}>
                    {isExpired ? (
                      <>
                        <ShieldAlert className="h-4 w-4" />
                        <span>Expired</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Valid</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Composition</Label>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    {medicine.composition}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-card border rounded-md p-3 space-y-1">
                  <Label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Manufacturing Date
                  </Label>
                  <div className="text-sm font-medium">
                    {format(medicine.manufacturingDate, 'PPP')}
                  </div>
                </div>
                
                <div className="bg-card border rounded-md p-3 space-y-1">
                  <Label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Expiry Date
                  </Label>
                  <div className="text-sm font-medium">
                    {format(medicine.expiryDate, 'PPP')}
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 pt-2">
                <div className="bg-card border rounded-md p-3 space-y-1">
                  <Label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Package className="h-4 w-4" />
                    Manufacturer
                  </Label>
                  <div className="text-sm font-mono mt-1 break-all">
                    {medicine.manufacturer}
                  </div>
                </div>
                
                <div className="bg-card border rounded-md p-3 space-y-1">
                  <Label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    Retailer
                  </Label>
                  <div className="text-sm font-mono mt-1 break-all">
                    {medicine.retailer === "0x0000000000000000000000000000000000000000" 
                      ? "Not assigned yet" 
                      : medicine.retailer}
                  </div>
                </div>
                
                <div className="bg-card border rounded-md p-3 space-y-1">
                  <Label className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    Buyer
                  </Label>
                  <div className="text-sm font-mono mt-1 break-all">
                    {medicine.buyer === "0x0000000000000000000000000000000000000000"
                      ? "Not sold yet" 
                      : medicine.buyer}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  medicine.isSoldToRetailer 
                    ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
                    : "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                }`}>
                  {medicine.isSoldToRetailer ? "✓ Sold to Retailer" : "Pending Retailer Sale"}
                </div>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  medicine.isSoldToBuyer 
                    ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
                    : "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                }`}>
                  {medicine.isSoldToBuyer ? "✓ Sold to Buyer" : "Not Sold to Buyer"}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-lg my-6 p-10 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Invalid Medicine ID</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                No medicine exists with ID {medicineId}. Please check the ID and try again.
              </p>
            </div>
          )
        ) : (
          <div className="border border-dashed border-border rounded-lg my-6 p-10 flex flex-col items-center justify-center text-center">
            <Box className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Medicine Data</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Enter a medicine ID to track its details and verify authenticity<br />on the blockchain
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t text-xs text-muted-foreground pt-4">
        All medicine data is securely recorded on the blockchain and cannot be altered
      </CardFooter>
    </Card>
  )
} 