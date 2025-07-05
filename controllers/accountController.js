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

async function accountManagement(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/accountManagement", {
        title: "Account Management",
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

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    loginAccount,
    accountManagement,
};
