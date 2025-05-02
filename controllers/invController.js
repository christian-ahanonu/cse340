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
    })
};


/* ***************************
*  Build Intentional Error Route
* ************************** */
invCont.triggerError = async function (req, res, next) {
    throw new Error("This is an intentional error.")
}



/* ****************************************
*  Deliver management view
* *************************************** */
invCont.buildManagementView = async (req, res) => {
    let nav = await utilities.getNav()
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
    })
}


/* ****************************************
*  Deliver add-classification view
* *************************************** */
invCont.buildAddClassificationView = async (req, res) => {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    })
}

invCont.addClassification = async function (req, res, next) {
    const { classification_name } = req.body
    const data = await invModel.addNewClassification(classification_name)

    if (data) {
        req.flash(
            "notice", `Classification ${classification_name} added successfully`
        )
        res.redirect('/inv');
    } else {
        req.flash('error', 'Adding Classification failed')
        res.status(501).render('./inventory/add-classification', {
            errors: errors.array(),
            title: "Add New Classification",
            nav: await utilities.getNav(),
            errors: null,
        })
    }
}


/* ****************************************
*  Deliver add-inventory view
* *************************************** */
invCont.buildAddInventoryView = async (req, res) => {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null,
    })
}


invCont.addInventory = async function(req, res, next) {
    const {
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles, 
        inv_color
    } = req.body

    const result = await invModel.addInventory({
        classification_id: parseInt(classification_id),
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price: parseFloat(inv_price),
        inv_year: parseInt(inv_year),
        inv_miles: parseInt(inv_miles),
        inv_color
    })

    try {
        if(result.rowCount > 0) {
            req.flash('notice', 
                `Vehicle ${inv_make} ${inv_model} added successfully!`
            )
            res.redirect('/inv')
        } else {
            req.flash('error', 'Sorry the addition failed')
            res.render('inventory/add-inventory'), {
                title: 'Add New Vehicle',
                nav: await utilities.getNav(),
                classificationList: await utilities.buildClassificationList(classification_id),
                errors: null,
                ...req.body
            }
        }
        
    } catch (error) {
        console.error('addInventory error:', error);
        req.flash('error', 'Sorry there was an error processing the request.')
        res.render('inventory/add-inventory', {
            title: 'Add New Vehicle',
            nav: await utilities.getNav(),
            classificationList: await utilities.buildClassificationList(req.body.classification_id),
            errors: null,
            ...req.body
        })
    }
}


module.exports = invCont