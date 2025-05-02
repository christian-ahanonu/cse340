/* 
Utilities hold resusable code. I like to think of
it as an extension of the "views".
Contained in them could be middleware functions. 
*/


const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li> <a href="/" title="Home page">Home</a> </li>';

  data.rows.forEach((row) => {
    list += `
    <li>
        <a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">
            ${row.classification_name} 
        </a>
    </li>
    `;
  });
  list += "</ul>";
  return list;
};



/* ************************
 * Build the classification view HTML
 ************************** */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"> <img src="' +
        vehicle.inv_thumbnail +
        '" alt="' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors"></a>';
        
      grid += '<div class="namePrice">';
      grid += "<hr>";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};



/* ************************
 * Build vehicle detail view
 ************************** */
Util.buildVehicleDetail = async function(data) {

  let vDescription = `

  <div class="detailsView">

    <div class="col1">
      <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
    </div>

    <ul class="col2">
      <li> <strong> ${data.inv_make} ${data.inv_model} Details </strong></li>

      <li> <strong>Price:</strong> 
          $${new Intl.NumberFormat("en-US").format(data.inv_price)}
      </li>

      <li> <strong>Description:</strong> ${data.inv_description}</li>
      <li> <strong>Color:</strong> ${data.inv_color}</li>

      <li> <strong>Miles:</strong>
          ${new Intl.NumberFormat("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
          }).format(data.inv_miles)}
      </li>
    </ul>

  </div>
  `
  return vDescription
};


/* ************************
 * Build select option for classification
 ************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"

  return classificationList
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise
    .resolve(fn(req, res, next))
    .catch(next)


module.exports = Util;
