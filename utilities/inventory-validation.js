const utilities = require(".")
const { body, validationResult } = require('express-validator');
const validate = {};

validate.addClassificationRules = () => {
    return [
        body("classification_name")
        .trim()
        .isLength({ min: 1 })
        .isAlpha()
        .withMessage('First letters capitalize and no spaces')
    ]
}

validate.addInventoryRules = () => {
    return [
        body("classification_id")
        .isNumeric()
        .withMessage("Please select a classification."),

        body('inv_make')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Please provide the vehicle make'),

        body('inv_model')
        .trim()
        .isLength({ min:1 })
        .withMessage('Please provide the vehicle model'),
        
        body('inv_description')
        .trim()
        .isLength({ min:1 })
        .withMessage('Please provide a description'),
        
        body('inv_image')
        .trim()
        .isLength({ min:1 })
        .withMessage('Please provide an image path'),
        
        body('inv_thumbnail')
        .trim()
        .isLength({ min:1 })
        .withMessage('Please provide a thumbnail path'),

        body('inv_price')
        .trim()
        .isNumeric()
        .withMessage('Please provide a valid price'),
        
        body('inv_year')
        .trim()
        .isNumeric()
        .withMessage('Please provide a valid year'),
        
        body('inv_miles')
        .trim()
        .isNumeric()
        .withMessage('Please provide a valid mileage'),
        
        body('inv_color')
        .trim()
        .isLength({ min:1 })
        .withMessage('Please provide a vehicle color')
    ]
}



validate.checkData = async (req, res, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {

        if (req.originalUrl.includes('add-inventory')) {
            const classificationList = await utilities.buildClassificationList(req.body.classification_id)
            
            res.render('inventory/add-inventory', {
                errors: errors.array(),
                title: 'Add New Vehicle',
                nav: await utilities.getNav(),
                classificationList,
                ...req.body
            })
            
        } else {
            res.render('inventory/add-classification', {
                errors: errors.array(),
                title: 'Add New Classification',
                nav: await utilities.getNav(),
            })
        }
        return
    }
    next()
};


module.exports = validate