const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/register", {
        // /account/register is referencing a file location
        title: "Register",
        nav,
        errors: null,
    });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res, next) {
    let nav = await utilities.getNav();
    const {
        account_firstname,
        account_lastname,
        account_email,
        account_password,
    } = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
        req.flash(
            "notice",
            "Sorry, there was an error processing the registration."
        );
        res.status(500).render("account/register", {
            title: "Register",
            nav,
            errors: null,
        });
        return;
    }

    // register the user
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    );

    // registration succeess and failure
    if (regResult.rowCount > 0) {
        req.flash(
            "success",
            `Congratulations, you're registered ${account_firstname}. Please log in.`
        );

        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        });
    } else {
        req.flash("failed", "Sorry, the registration failed.");
        res.status(501).render("account/register", {
            title: "Register",
            nav,
            errors: null,
        });
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
// Checks if the user exist and then log them in
async function loginAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);

    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.");
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        });
        return;
    }

    try {
        if (
            await bcrypt.compare(account_password, accountData.account_password)
        ) {
            delete accountData.account_password;
            const accessToken = jwt.sign(
                accountData,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 3600 * 1000 }
            );
            if (process.env.NODE_ENV === "development") {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    maxAge: 3600 * 1000,
                });
            } else {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 3600 * 1000,
                });
            }
            return res.redirect("/account/");
        } else {
            req.flash(
                "message notice",
                "Please check your credentials and try again."
            );
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            });
        }
    } catch (error) {
        throw new Error("Access Forbidden");
    }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function accountManagement(req, res, next) {
    try {
        const nav = await utilities.getNav();
        res.render("account/accountManagement", {
            title: "Account Management",
            nav,
            errors: null,
            accountData: res.locals.accountData,
        });
    } catch (error) {
        next(error);
    }
}

async function buildAccountUpdate(req, res, next) {
    try {
        const account_id = parseInt(req.params.account_id);
        const nav = await utilities.getNav();
        const accountData = await accountModel.getAccountById(account_id);

        res.render("account/update-account", {
            // title: "Update Account",
            // nav,
            // errors: null,
            // account_id,
            title: "Update Account",
            nav,
            errors: null,
            // account_id,
            accountData: accountData,
            // accountData: accountData.account_id,
            // account_firstname: accountData.account_firstname,
            // account_lastname: accountData.account_lastname,
            // account_email: accountData.account_email,

        });
    } catch (error) {
        next(error);
    }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
    res.clearCookie("jwt");
    res.locals.loggedin = 0;
    res.locals.accountData = null;
    req.flash("notice", "You have been logged out.");
    return res.redirect("/");
}

/* ****************************************
 *  Process Account Update
 * *************************************** */
async function updateAccount(req, res, next) {
    try {
        let nav = await utilities.getNav();
        const {
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        } = req.body;

        const accountResult = await accountModel.updateAccount(
            parseInt(account_id), // Ensure account_id is a number
            account_firstname,
            account_lastname,
            account_email
        );

        if (accountResult) {
            const accountData = await accountModel.getAccountById(
                parseInt(account_id)
            );
            // Create new JWT with updated data
            const accessToken = jwt.sign(
                accountData,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 3600 * 1000 }
            );

            // Set the new token as a cookie
            if (process.env.NODE_ENV === "development") {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    maxAge: 3600 * 1000,
                });
            } else {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 3600 * 1000,
                });
            }

            // Update locals for immediate view update
            res.locals.accountData = accountData;

            req.flash(
                "notice",
                `The account information has been successfully updated.`
            );
            res.redirect("/account/");
        } else {
            req.flash("notice", "Sorry, the update failed.");
            res.status(501).render("account/update-account", {
                title: "Edit Account",
                nav,
                errors: null,
                ...req.body,
            });
        }
    } catch (error) {
        console.error("Error in updateAccount:", error);
        next(error);
    }
}

/* ****************************************
 *  Process Password Update
 * *************************************** */
async function updatePassword(req, res, next) {
    let nav = await utilities.getNav();
    const { account_id, account_password } = req.body;

    // Hash the password
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
        req.flash(
            "notice",
            "Sorry, there was an error processing the password update."
        );
        res.status(500).render("account/update-account", {
            title: "Edit Account",
            nav,
            errors: null,
            account_id,
        });
        return;
    }

    const passwordResult = await accountModel.updatePassword(
        account_id,
        hashedPassword
    );

    if (passwordResult) {
        req.flash("notice", "The password has been successfully updated.");
        res.redirect("/account/");
    } else {
        req.flash("notice", "Sorry, the password update failed.");
        res.status(501).render("account/update-account", {
            title: "Edit Account",
            nav,
            errors: null,
            account_id,
        });
    }
}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    loginAccount,
    accountManagement,
    accountLogout,
    buildAccountUpdate,
    updateAccount,
    updatePassword
};
