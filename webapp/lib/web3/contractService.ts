import { ethers } from 'ethers'

export interface Medicine {
  id: number
  name: string
  composition: string
  manufacturingDate: Date
  expiryDate: Date
  manufacturer: string
  retailer: string
  buyer: string
  isSoldToRetailer: boolean
  isSoldToBuyer: boolean
}

export class ContractService {
  private contract: ethers.Contract

  constructor(contract: ethers.Contract) {
    this.contract = contract
  }

  // Convert blockchain data to a more friendly format
  private formatMedicine(medicineData: any): Medicine {
    return {
      id: medicineData.id.toNumber(),
      name: medicineData.name,
      composition: medicineData.composition,
      manufacturingDate: new Date(medicineData.manufacturingDate.toNumber() * 1000),
      expiryDate: new Date(medicineData.expiryDate.toNumber() * 1000),
      manufacturer: medicineData.manufacturer,
      retailer: medicineData.retailer,
      buyer: medicineData.buyer,
      isSoldToRetailer: medicineData.isSoldToRetailer,
      isSoldToBuyer: medicineData.isSoldToBuyer
    }
  }

  // Get medicine details
  async getMedicineDetails(medicineId: number): Promise<Medicine> {
    try {
      const medicine = await this.contract.medicines(medicineId)
      return this.formatMedicine(medicine)
    } catch (error) {
      console.error("Error fetching medicine details:", error)
      throw error
    }
  }

  // Get medicine counter (total count of medicines)
  async getMedicineCounter(): Promise<number> {
    try {
      const counter = await this.contract.medicineCounter()
      return counter.toNumber()
    } catch (error) {
      console.error("Error fetching medicine counter:", error)
      throw error
    }
  }

  // Add a new medicine
  async addMedicine(
    name: string,
    composition: string,
    manufacturingDate: Date,
    expiryDate: Date
  ): Promise<void> {
    try {
      // Convert dates to Unix timestamps (seconds)
      const mfgDate = Math.floor(manufacturingDate.getTime() / 1000)
      const expDate = Math.floor(expiryDate.getTime() / 1000)
      
      const tx = await this.contract.addMedicine(name, composition, mfgDate, expDate)
      await tx.wait()
    } catch (error) {
      console.error("Error adding medicine:", error)
      throw error
    }
  }

  // Sell medicine to retailer
  async sellMedicineToRetailer(medicineId: number, retailerAddress: string): Promise<void> {
    try {
      const tx = await this.contract.sellMedicineToRetailer(medicineId, retailerAddress)
      await tx.wait()
    } catch (error) {
      console.error("Error selling medicine to retailer:", error)
      throw error
    }
  }

  // Sell medicine to buyer
  async sellMedicineToBuyer(medicineId: number, buyerAddress: string): Promise<void> {
    try {
      const tx = await this.contract.sellMedicineToBuyer(medicineId, buyerAddress)
      await tx.wait()
    } catch (error) {
      console.error("Error selling medicine to buyer:", error)
      throw error
    }
  }

  // Check if medicine is expired
  async isMedicineExpired(medicineId: number): Promise<boolean> {
    try {
      return await this.contract.isMedicineExpired(medicineId)
    } catch (error) {
      console.error("Error checking if medicine is expired:", error)
      throw error
    }
  }

  // Get all medicines (helper method)
  async getAllMedicines(): Promise<Medicine[]> {
    try {
      const count = await this.getMedicineCounter()
      const medicines: Medicine[] = []
      
      for (let i = 1; i <= count; i++) {
        const medicine = await this.contract.medicines(i)
        medicines.push(this.formatMedicine(medicine))
      }
      
      return medicines
    } catch (error) {
      console.error("Error fetching all medicines:", error)
      throw error
    }
  }
} 