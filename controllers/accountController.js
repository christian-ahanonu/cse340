const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { 
        account_firstname, 
        account_lastname, 
        account_email, 
        account_password
    } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
        title: "Register",
        nav,
        errors: null,
        })
    }
    
    // register the user
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
    )
  
    if (regResult) {
      req.flash(
        "success",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("failed", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Register",
        nav,
        errors: null,
      })
    }
}


// Checks if the user exist and then log them in
async function loginAccount(req, res) {
    let { username, password } = req.body
    let nav = await utilities.getNav()

    const loginResult = await accountModel.checkExistingEmailPassword(username, password)
    if (loginResult) {
        req.session.user = loginResult // create session to remember user
        req.flash("success", `Welcome back, ${loginResult.account_firstname}!`) // flash message to welcome the user back
        res.status(200).redirect("/")
        } 
        else {
        req.flash("failed", "Sorry, the login failed.")
        res.status(401).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    }
}


module.exports = { 
    buildLogin, 
    buildRegister, 
    registerAccount, 
    loginAccount 
}