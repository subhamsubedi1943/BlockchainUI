const MedicineSupplyChain = artifacts.require("MedicineSupplyChain");

contract("MedicineSupplyChain", (accounts) => {
  const manufacturer = accounts[0];
  const retailer = accounts[1];
  const buyer = accounts[2];
  const unauthorized = accounts[3];

  let medicineSupplyChainInstance;
  let currentTime;
  let manufacturingDate;
  let expiryDate;
  let expiredDate;

  beforeEach(async () => {
    medicineSupplyChainInstance = await MedicineSupplyChain.new({ from: manufacturer });
    currentTime = Math.floor(Date.now() / 1000);
    manufacturingDate = currentTime - 86400; // 1 day ago
    expiryDate = currentTime + 31536000; // 1 year in the future
    expiredDate = currentTime - 86400; // 1 day ago (already expired)
  });

  describe("Medicine Addition", () => {
    it("should allow a manufacturer to add a medicine", async () => {
      await medicineSupplyChainInstance.addMedicine(
        "Paracetamol",
        "Acetaminophen 500mg",
        manufacturingDate,
        expiryDate,
        { from: manufacturer }
      );

      const medicineCounter = await medicineSupplyChainInstance.medicineCounter();
      assert.equal(medicineCounter, 1, "Medicine counter should be incremented");

      const medicineDetails = await medicineSupplyChainInstance.getMedicineDetails(1);
      assert.equal(medicineDetails.name, "Paracetamol", "Medicine name should match");
      assert.equal(medicineDetails.composition, "Acetaminophen 500mg", "Medicine composition should match");
      assert.equal(medicineDetails.manufacturer, manufacturer, "Manufacturer address should match");
    });

    it("should not allow adding medicine with expiry date before manufacturing date", async () => {
      try {
        await medicineSupplyChainInstance.addMedicine(
          "Invalid Medicine",
          "Invalid Composition",
          expiryDate, // Using future date as manufacturing date
          manufacturingDate, // Using past date as expiry date
          { from: manufacturer }
        );
        assert.fail("The transaction should have thrown an error");
      } catch (err) {
        assert.include(err.message, "revert", "The error message should contain 'revert'");
        assert.include(err.message, "Expiry date should be after the manufacturing date", "Should revert with appropriate message");
      }
    });
  });

  describe("Retailer Operations", () => {
    beforeEach(async () => {
      await medicineSupplyChainInstance.addMedicine(
        "Paracetamol",
        "Acetaminophen 500mg",
        manufacturingDate,
        expiryDate,
        { from: manufacturer }
      );
    });

    it("should allow a manufacturer to sell medicine to a retailer", async () => {
      await medicineSupplyChainInstance.sellMedicineToRetailer(1, retailer, { from: manufacturer });

      const medicineDetails = await medicineSupplyChainInstance.getMedicineDetails(1);
      assert.equal(medicineDetails.retailer, retailer, "Retailer address should match");

      const medicine = await medicineSupplyChainInstance.medicines(1);
      assert.equal(medicine.isSoldToRetailer, true, "Medicine should be marked as sold to retailer");
    });

    it("should not allow non-manufacturer to sell medicine to retailer", async () => {
      try {
        await medicineSupplyChainInstance.sellMedicineToRetailer(1, retailer, { from: unauthorized });
        assert.fail("The transaction should have thrown an error");
      } catch (err) {
        assert.include(err.message, "revert", "The error message should contain 'revert'");
        assert.include(err.message, "Only the manufacturer can perform this action", "Should revert with appropriate message");
      }
    });

    it("should not allow selling medicine to retailer multiple times", async () => {
      await medicineSupplyChainInstance.sellMedicineToRetailer(1, retailer, { from: manufacturer });

      try {
        await medicineSupplyChainInstance.sellMedicineToRetailer(1, accounts[4], { from: manufacturer });
        assert.fail("The transaction should have thrown an error");
      } catch (err) {
        assert.include(err.message, "revert", "The error message should contain 'revert'");
        assert.include(err.message, "Medicine already sold to a retailer", "Should revert with appropriate message");
      }
    });
  });

  describe("Buyer Operations", () => {
    beforeEach(async () => {
      await medicineSupplyChainInstance.addMedicine(
        "Paracetamol",
        "Acetaminophen 500mg",
        manufacturingDate,
        expiryDate,
        { from: manufacturer }
      );
      await medicineSupplyChainInstance.sellMedicineToRetailer(1, retailer, { from: manufacturer });
    });

    it("should allow a retailer to sell medicine to a buyer", async () => {
      await medicineSupplyChainInstance.sellMedicineToBuyer(1, buyer, { from: retailer });

      const medicineDetails = await medicineSupplyChainInstance.getMedicineDetails(1);
      assert.equal(medicineDetails.buyer, buyer, "Buyer address should match");

      const medicine = await medicineSupplyChainInstance.medicines(1);
      assert.equal(medicine.isSoldToBuyer, true, "Medicine should be marked as sold to buyer");
    });

    it("should not allow non-retailer to sell medicine to buyer", async () => {
      try {
        await medicineSupplyChainInstance.sellMedicineToBuyer(1, buyer, { from: unauthorized });
        assert.fail("The transaction should have thrown an error");
      } catch (err) {
        assert.include(err.message, "revert", "The error message should contain 'revert'");
        assert.include(err.message, "Only the retailer can perform this action", "Should revert with appropriate message");
      }
    });

    it("should not allow selling medicine to buyer multiple times", async () => {
      await medicineSupplyChainInstance.sellMedicineToBuyer(1, buyer, { from: retailer });

      try {
        await medicineSupplyChainInstance.sellMedicineToBuyer(1, accounts[4], { from: retailer });
        assert.fail("The transaction should have thrown an error");
      } catch (err) {
        assert.include(err.message, "revert", "The error message should contain 'revert'");
        assert.include(err.message, "Medicine already sold to a buyer", "Should revert with appropriate message");
      }
    });
  });

  describe("Medicine Expiry", () => {
    it("should correctly identify expired medicine", async () => {
        // Ensure the expiry date is AFTER the manufacturing date but still in the past
        let pastExpiryDate = manufacturingDate + 100; // Slightly after manufacturing date
      
        await medicineSupplyChainInstance.addMedicine(
          "ExpiredMedicine",
          "Expired Compound",
          manufacturingDate,
          pastExpiryDate,
          { from: manufacturer }
        );
      
        const isExpired = await medicineSupplyChainInstance.isMedicineExpired(1);
        assert.equal(isExpired, true, "Medicine should be marked as expired");
      });

    it("should correctly identify non-expired medicine", async () => {
      // Add non-expired medicine
      await medicineSupplyChainInstance.addMedicine(
        "ValidMedicine",
        "Valid Compound",
        manufacturingDate,
        expiryDate,
        { from: manufacturer }
      );

      const isExpired = await medicineSupplyChainInstance.isMedicineExpired(1);
      assert.equal(isExpired, false, "Medicine should not be marked as expired");
    });
  });

  describe("Medicine Details", () => {
    beforeEach(async () => {
      await medicineSupplyChainInstance.addMedicine(
        "Paracetamol",
        "Acetaminophen 500mg",
        manufacturingDate,
        expiryDate,
        { from: manufacturer }
      );
      await medicineSupplyChainInstance.sellMedicineToRetailer(1, retailer, { from: manufacturer });
      await medicineSupplyChainInstance.sellMedicineToBuyer(1, buyer, { from: retailer });
    });

    it("should provide complete medicine details", async () => {
      const details = await medicineSupplyChainInstance.getMedicineDetails(1);
      
      assert.equal(details.name, "Paracetamol", "Medicine name should match");
      assert.equal(details.composition, "Acetaminophen 500mg", "Medicine composition should match");
      assert.equal(details.manufacturingDate.toNumber(), manufacturingDate, "Manufacturing date should match");
      assert.equal(details.expiryDate.toNumber(), expiryDate, "Expiry date should match");
      assert.equal(details.manufacturer, manufacturer, "Manufacturer address should match");
      assert.equal(details.retailer, retailer, "Retailer address should match");
      assert.equal(details.buyer, buyer, "Buyer address should match");
    });
  });

  describe("Multiple Medicines", () => {
    it("should handle multiple medicines correctly", async () => {
      // Add first medicine
      await medicineSupplyChainInstance.addMedicine(
        "Paracetamol",
        "Acetaminophen 500mg",
        manufacturingDate,
        expiryDate,
        { from: manufacturer }
      );

      // Add second medicine
      await medicineSupplyChainInstance.addMedicine(
        "Ibuprofen",
        "Ibuprofen 400mg",
        manufacturingDate,
        expiryDate,
        { from: manufacturer }
      );

      // Check counter
      const medicineCounter = await medicineSupplyChainInstance.medicineCounter();
      assert.equal(medicineCounter, 2, "Medicine counter should be incremented to 2");

      // Check details of first medicine
      const details1 = await medicineSupplyChainInstance.getMedicineDetails(1);
      assert.equal(details1.name, "Paracetamol", "First medicine name should match");

      // Check details of second medicine
      const details2 = await medicineSupplyChainInstance.getMedicineDetails(2);
      assert.equal(details2.name, "Ibuprofen", "Second medicine name should match");
    });
  });
});