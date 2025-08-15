const express = require("express");
const router = new express.Router();
const cartController = require("../controllers/cartController");
const utilities = require("../utilities");
const checkoutValidate = require("../utilities/checkout-validation");

router.post("/add", utilities.handleErrors(cartController.addToCart));

router.get("/",
    utilities.checkLogin,
    utilities.handleErrors(cartController.viewCart));

router.get("/checkout",
    utilities.checkLogin,
    utilities.handleErrors(cartController.checkoutView));

router.post("/remove",
    utilities.checkLogin,
    utilities.handleErrors(cartController.removeFromCart));

router.post(
    "/checkout",
    utilities.checkLogin,
    checkoutValidate.checkoutRules(),
    checkoutValidate.checkCheckoutData,
    utilities.handleErrors(cartController.placeOrder));

// Add new route for success page
router.get("/success",
    utilities.checkLogin,
    utilities.handleErrors(cartController.orderSuccess));

module.exports = router;
