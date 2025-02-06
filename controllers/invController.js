const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */

invCont.buildByClassificationId = async function (req, res, next) {

    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    
    const className = data[0].classification_name
    
    res.render("./inventory/classification", {
        title: className + " Vehicles",
        nav,
        grid
    })
} 


/* ***************************
*  Build vehicle description
* ************************** */
invCont.vehicleDetail = async function (req, res, next) {

        const vehicle_id = req.params.vehicleId
        const data = await invModel.getAllInventoryVehicleById(vehicle_id)
        
        if (!data) {
            return res.status(404).send({ message: "Vehicle not found" })
        }
        
        const vDescription = await utilities.buildVehicleDetail(data)
        const nav = await utilities.getNav()      

    res.render("./inventory/vehicleDetail", {
        title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
        nav,
        vDescription,
    });

};

/* ***************************
*  Build Intentional Error Route
* ************************** */
invCont.triggerError = async function (req, res, next) {
    throw new Error("This is an intentional error.")
}


module.exports = invCont