"use client";

import { useState, useEffect } from "react";
import { useWeb3 } from "@/lib/web3/Web3Provider";
import { ContractService, Medicine } from "@/lib/web3/contractService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Info, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export function ManufacturerMedicines() {
  const { contract, isConnected, account } = useWeb3();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contract && isConnected && account) {
      fetchManufacturerMedicines();
    }
  }, [contract, isConnected, account]);

  const fetchManufacturerMedicines = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!contract || !account) return;

      const service = new ContractService(contract);
      const medicineData: Medicine[] = [];
      
      // Start looking from ID 1
      let id = 1;
      let emptyMedicineCount = 0;
      const MAX_EMPTY_BEFORE_STOPPING = 3; // Stop after encountering 3 empty medicines in a row
      
      // Keep looping until we encounter multiple empty medicines in a row
      while (emptyMedicineCount < MAX_EMPTY_BEFORE_STOPPING) {
        try {
          // Fetch the medicine details by ID, using the same method as MedicineTracker
          const medicineDetails = await service.getMedicineDetails(id);
          
          // Check if medicine exists and has a name
          if (medicineDetails && medicineDetails.name && medicineDetails.name.trim() !== "") {
            // Reset the empty counter since we found a valid medicine
            emptyMedicineCount = 0;
            
            // Check if current user is the manufacturer
            if (medicineDetails.manufacturer.toLowerCase() === account.toLowerCase()) {
              // Only add medicines manufactured by this account
              medicineData.push(medicineDetails);
            }
          } else {
            // Increment the empty counter if we find an empty medicine
            emptyMedicineCount++;
          }
        } catch (err) {
          console.log(`Error or medicine ${id} not found:`, err);
          emptyMedicineCount++;
        }
        
        // Move to the next ID
        id++;
        
        // Safety check - stop after 200 IDs to prevent infinite loops
        if (id > 200) {
          break;
        }
      }
      
      setMedicines(medicineData);
    } catch (err) {
      console.error("Failed to fetch manufacturer medicines:", err);
      setError("Failed to load medicines. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Your Manufactured Medicines</CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchManufacturerMedicines} 
            disabled={isLoading || !isConnected}
          >
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[600px]">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Info className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to view your manufactured medicines
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 border rounded-md">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <AlertCircle className="h-10 w-10 text-destructive/70 mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10">
            <Package className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              You haven't manufactured any medicines yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {medicines.map((medicine) => (
              <div 
                key={medicine.id} 
                className="p-3 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium">{medicine.name}</h3>
                  <Badge variant={
                    medicine.isSoldToRetailer && medicine.isSoldToBuyer ? "secondary" :
                    medicine.isSoldToRetailer ? "outline" : "default"
                  }>
                    {medicine.isSoldToBuyer ? "Sold to Buyer" : 
                     medicine.isSoldToRetailer ? "Sold to Retailer" : "Available"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{medicine.composition}</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="text-muted-foreground">Medicine ID:</div>
                  <div className="font-mono">{medicine.id}</div>
                  
                  <div className="text-muted-foreground">Manufactured:</div>
                  <div>{format(medicine.manufacturingDate, 'PP')}</div>
                  
                  <div className="text-muted-foreground">Expires:</div>
                  <div>{format(medicine.expiryDate, 'PP')}</div>
                  
                  <div className="text-muted-foreground">Retailer:</div>
                  <div className="font-mono truncate" title={medicine.retailer}>
                    {medicine.retailer === "0x0000000000000000000000000000000000000000"
                      ? "Not assigned"
                      : `${medicine.retailer.substring(0, 6)}...${medicine.retailer.substring(medicine.retailer.length - 4)}`
                    }
                  </div>

                  <div className="text-muted-foreground">Buyer:</div>
                  <div className="font-mono truncate" title={medicine.buyer}>
                    {medicine.buyer === "0x0000000000000000000000000000000000000000"
                      ? "Not sold yet"
                      : `${medicine.buyer.substring(0, 6)}...${medicine.buyer.substring(medicine.buyer.length - 4)}`
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 