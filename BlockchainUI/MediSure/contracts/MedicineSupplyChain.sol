// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MedicineSupplyChain {
    // Structure to store medicine information
    struct Medicine {
        uint256 id;
        string name;
        string composition;
        uint256 manufacturingDate;
        uint256 expiryDate;
        address manufacturer;
        address retailer;
        address buyer;
        bool isSoldToRetailer;
        bool isSoldToBuyer;
    }

    // Mapping to store medicines by their ID
    mapping(uint256 => Medicine) public medicines;

    // Counter for medicine IDs
    uint256 public medicineCounter;

    // Events to emit important actions
    event MedicineAdded(uint256 indexed medicineId, string name, address indexed manufacturer);
    event MedicineSoldToRetailer(uint256 indexed medicineId, address indexed retailer);
    event MedicineSoldToBuyer(uint256 indexed medicineId, address indexed buyer);

    // Modifiers to restrict access
    modifier onlyManufacturer(uint256 medicineId) {
        require(medicines[medicineId].manufacturer == msg.sender, "Only the manufacturer can perform this action.");
        _;
    }

    modifier onlyRetailer(uint256 medicineId) {
        require(medicines[medicineId].retailer == msg.sender, "Only the retailer can perform this action.");
        _;
    }

    modifier onlyBuyer(uint256 medicineId) {
        require(medicines[medicineId].buyer == msg.sender, "Only the buyer can perform this action.");
        _;
    }

    modifier medicineNotSoldToRetailer(uint256 medicineId) {
        require(!medicines[medicineId].isSoldToRetailer, "Medicine already sold to a retailer.");
        _;
    }

    modifier medicineNotSoldToBuyer(uint256 medicineId) {
        require(!medicines[medicineId].isSoldToBuyer, "Medicine already sold to a buyer.");
        _;
    }

    // Manufacturer adds a new medicine to the blockchain
    function addMedicine(
        string memory _name,
        string memory _composition,
        uint256 _manufacturingDate,
        uint256 _expiryDate
    ) public {
        require(_expiryDate > _manufacturingDate, "Expiry date should be after the manufacturing date.");

        medicineCounter++;
        medicines[medicineCounter] = Medicine(
            medicineCounter,
            _name,
            _composition,
            _manufacturingDate,
            _expiryDate,
            msg.sender, // Manufacturer address
            address(0), // Retailer address (initially 0)
            address(0), // Buyer address (initially 0)
            false, // isSoldToRetailer flag
            false  // isSoldToBuyer flag
        );

        emit MedicineAdded(medicineCounter, _name, msg.sender);
    }

    // Manufacturer sells medicine to a retailer
    function sellMedicineToRetailer(uint256 _medicineId, address _retailer)
        public
        onlyManufacturer(_medicineId)
        medicineNotSoldToRetailer(_medicineId)
    {
        medicines[_medicineId].retailer = _retailer;
        medicines[_medicineId].isSoldToRetailer = true;

        emit MedicineSoldToRetailer(_medicineId, _retailer);
    }

    // Retailer sells medicine to a buyer
    function sellMedicineToBuyer(uint256 _medicineId, address _buyer)
        public
        onlyRetailer(_medicineId)
        medicineNotSoldToBuyer(_medicineId)
    {
        medicines[_medicineId].buyer = _buyer;
        medicines[_medicineId].isSoldToBuyer = true;

        emit MedicineSoldToBuyer(_medicineId, _buyer);
    }

    // Buyer retrieves information about a purchased medicine
    function getMedicineDetails(uint256 _medicineId)
        public
        view
        returns (
            string memory name,
            string memory composition,
            uint256 manufacturingDate,
            uint256 expiryDate,
            address manufacturer,
            address retailer,
            address buyer
        )
    {
        Medicine memory medicine = medicines[_medicineId];
        return (
            medicine.name,
            medicine.composition,
            medicine.manufacturingDate,
            medicine.expiryDate,
            medicine.manufacturer,
            medicine.retailer,
            medicine.buyer
        );
    }

    // Function to check if the medicine is expired
    function isMedicineExpired(uint256 _medicineId) public view returns (bool) {
        return block.timestamp > medicines[_medicineId].expiryDate;
    }
}