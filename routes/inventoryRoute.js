// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require('../utilities/inventory-validation')
const utilities = require("../utilities");


// Default route to management view
router.get(
    '/',
    utilities.handleErrors(invController.buildManagementView)
)

// Route to build inventory by classification view
router.get(
    "/type/:classificationId", 
    utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build vehicle description
router.get(
    "/detail/:vehicleId", 
    utilities.handleErrors(invController.vehicleDetail)
);


// Route to test server error (intentional error)
router.get(
    "/error", 
    utilities.handleErrors(invController.triggerError)
);


// Route to add classification view
router.get(
    "/add-classification", 
    utilities.handleErrors(invController.buildAddClassificationView)
);



// Route to add new item view
router.get(
    "/add-inventory", 
    utilities.handleErrors(invController.buildAddInventoryView)
);


router.post(
    "/add-classification",
    invValidate.addClassificationRules(),
    invValidate.checkData, 
    utilities.handleErrors(invController.addClassification)
);

router.post(
    "/add-inventory",
    invValidate.addInventoryRules(),
    invValidate.checkData, 
    utilities.handleErrors(invController.addInventory)
);


module.exports = router;
