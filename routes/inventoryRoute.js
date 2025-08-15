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

router.get(
    "/getInventory/:classification_id",
    utilities.handleErrors(invController.getInventoryJSON)
)

router.get(
    "/edit/:inv_id",
    utilities.handleErrors(invController.editInventoryView)
);

router.get(
    "/delete/:inv_id",
    utilities.handleErrors(invController.deleteInventoryView)
);

router.post(
    "/delete",
    utilities.handleErrors(invController.deleteInventory)
)

router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkInventoryData, 
    utilities.handleErrors(invController.addClassification)
);

router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);

router.post(
    "/update/",
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);


module.exports = router;
