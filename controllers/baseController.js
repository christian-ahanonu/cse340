/** *******************************************
 * A controller is the location where 
 * the logic of the application resides.
 * It is responsible for determining what 
 * action is to be carried out in order to 
 * fulfill requests submitted from remote clients. 
 * ******************************************* */

const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res) {
    const nav = await utilities.getNav()
    // req.flash("notice", "This is a flash message.")
    res.render("index", {
        title: "Home", 
        nav
    })
}

module.exports = baseController 

 