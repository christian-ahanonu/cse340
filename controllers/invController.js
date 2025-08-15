const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */

invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
        classification_id
    );
    const showCartButton = true;
    const grid = await utilities.buildClassificationGrid(data, showCartButton);
    let nav = await utilities.getNav();

    const className = data[0].classification_name;

    res.render("./inventory/classification", {
        title: className + " Vehicles",
        nav,
        grid,
    });
};

/* ***************************
 *  Build vehicle description
 * ************************** */
invCont.vehicleDetail = async function (req, res, next) {
    const vehicle_id = req.params.vehicleId;
    const data = await invModel.getAllInventoryVehicleById(vehicle_id);

    if (!data) {
        return res.status(404).send({ message: "Vehicle not found" });
    }

    const vDescription = await utilities.buildVehicleDetail(data);
    const nav = await utilities.getNav();

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
    throw new Error("This is an intentional error.");
};

/* ****************************************
 *  Deliver management view
 * *************************************** */
invCont.buildManagementView = async (req, res) => {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
        classificationList,
    });
};

/* ****************************************
 *  Deliver add-classification view
 * *************************************** */
invCont.buildAddClassificationView = async (req, res) => {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    });
};

invCont.addClassification = async function (req, res, next) {
    const { classification_name } = req.body;
    const data = await invModel.addNewClassification(classification_name);

    if (data) {
        req.flash(
            "notice",
            `Classification ${classification_name} added successfully`
        );
        res.redirect("/inv");
    } else {
        req.flash("error", "Adding Classification failed");
        res.status(501).render("./inventory/add-classification", {
            errors: errors.array(),
            title: "Add New Classification",
            nav: await utilities.getNav(),
            errors: null,
        });
    }
};

/* ****************************************
 *  Deliver add-inventory view
 * *************************************** */
invCont.buildAddInventoryView = async (req, res) => {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null,
    });
};

/* ****************************************
 *  Add an inventory item
 * *************************************** */
invCont.addInventory = async function (req, res, next) {
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
        inv_color,
    } = req.body;

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
        inv_color,
    });

    try {
        if (result.rowCount > 0) {
            req.flash(
                "notice",
                `Vehicle ${inv_make} ${inv_model} added successfully!`
            );
            res.redirect("/inv");
        } else {
            req.flash("error", "Sorry the addition failed");
            res.render("inventory/add-inventory"),
                {
                    title: "Add New Vehicle",
                    nav: await utilities.getNav(),
                    classificationList: await utilities.buildClassificationList(
                        classification_id
                    ),
                    errors: null,
                    ...req.body,
                };
        }
    } catch (error) {
        console.error("addInventory error:", error);
        req.flash("error", "Sorry there was an error processing the request.");

        res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav: await utilities.getNav(),
            classificationList: await utilities.buildClassificationList(
                req.body.classification_id
            ),
            errors: null,
            ...req.body,
        });
    }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(
        classification_id
    );
    if (invData[0].inv_id) {
        return res.json(invData);
    } else {
        next(new Error("No data returned"));
    }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async (req, res, next) => {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getAllInventoryVehicleById(inv_id);

    const classificationList = await utilities.buildClassificationList(
        itemData.classification_id
    );
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationList: classificationList,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id,
    });
};


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body;

    const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    );

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model;
        req.flash(
            "notice",
            `The ${itemName} was successfully updated.`);
        res.redirect("/inv/");

    } else {
        const classificationList = await utilities.buildClassificationList(
            classification_id
        );
        const itemName = `${inv_make} ${inv_model}`;
        req.flash("notice", "Sorry, the insert failed.");
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationList: classificationList,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        });
    }
};


/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async (req, res, next) => {
    const inv_id = parseInt(req.params.inv_id); // Collect Id from the request body
    let nav = await utilities.getNav(); // Get navigation
    const itemData = await invModel.getAllInventoryVehicleById(inv_id); // Get all cars related to the id
    
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
        classification_id: itemData.classification_id,
    });
};

/* ***************************
 * Delete inventory item
 * ************************** */
invCont.deleteInventory = async (req, res, next) => {
    const inv_id = parseInt(req.body.inv_id);
    const deleteResult = await invModel.deleteInventory(inv_id);

    if (deleteResult) {
        req.flash("notice", "The deletion was successful.")
        res.redirect("/inv/")
    } else {
        req.flash("notice", "Sorry, the deletion failed.")
        res.redirect("/inv/delete/inv_id")
    }

}



module.exports = invCont;
