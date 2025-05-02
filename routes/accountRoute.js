const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Route to fetch login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to fetch registeration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to process and register account
router.post (
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    (req, res) => {
      res.status(200).send("Loging in")
    }
    // utilities.handleErrors(accountController.loginAccount)
)

module.exports = router;