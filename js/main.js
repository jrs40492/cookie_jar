// @codekit-prepend "../bower_components/jquery/dist/jquery.js"
let gFoods;
// 0 = id_food, 1 = amount, 2 = cost
let gOrder = [];

$(document).ready(() => {
  getTypes();

  // Dynamically bind to all buttons with decrement class
  $('#tableWrapper').on('click', '.decrement', (e) => {
    const rowData = getRowData(e);

    if (!rowData) {
      handleError("Error updating order. Please try again");
      return;
    }

    const food = gFoods[rowData.index];
    const orderIndex = getOrderIndex(rowData.index);

    if (orderIndex === -1) {
      return;
    } else {
      const order = gOrder[orderIndex];

      if (order.amount === 1) {
        // Will decrease to 0, remove from order
        gOrder.splice(orderIndex, 1);
        updateRow(e, 0, 0);
      } else {
        // Decrease order amount by 1
        order.amount = order.amount -= 1;
        updateRow(e, order.amount, order.cost);
        gOrder[orderIndex] = order;
      }
    }

    updateTotal(food.id_type);
  });

  // Dynamically bind to all buttons with increment class
  $('#tableWrapper').on('click', '.increment', (e) => {
    const rowData = getRowData(e);

    if (!rowData) {
      handleError("Error updating order. Please try again");
      return;
    }

    const orderIndex = getOrderIndex(rowData.index);
    const food = gFoods[rowData.index];

    if (orderIndex === -1) {
      // New order item, push to order array
      gOrder.push({ id_food: food.id_food, amount: 1, cost: food.cost, type: food.id_type });
      updateRow(e, 1, food.cost);
    } else {
      // Increase order amount by 1
      const order = gOrder[orderIndex];
      order.amount = order.amount += 1;
      updateRow(e, order.amount, order.cost);
      gOrder[orderIndex] = order;
    }

    updateTotal(food.id_type);
  });

  $('#submitButton').on('click', () => {
    submitOrder();
  });
});


const getRowData = (e) => {
  // Returns:
  // index: gFoods[index]

  const target = e.currentTarget;
  const index = $(target).data("index");
  return { index };
}

const getOrderIndex = (index) => {
  // Returns:
  // index: gOrder[index];
  const food = gFoods[index];
  return gOrder.findIndex(x => x.id_food === food.id_food );
}

const updateRow = (e, amount, cost) => {
  const target = $(e.currentTarget);
  const parent = target.parent();

  // Get the Quantity column field
  const amountField = parent.siblings(".amount");

  // Get the Total column field
  const totalField = parent.siblings(".total");

  const total = amount * cost;
  const totalFormatted = total.toFixed(2);

  amountField.text(amount);
  totalField.text(`$${totalFormatted}`);
}

const updateTotal = (type) => {
  let totalCost = 0;

  // Totals for bottom of table
  let typeAmount = 0;
  let typeCost = 0;

  // Filter for orders of that type
  const ordersOfType = gOrder.filter(order => order.type === type);
  ordersOfType.forEach((order) => {
    typeAmount += order.amount;
    typeCost += order.amount * order.cost;
  });

  // Update bottom of that type table
  $(`#amount-${type}`).text(typeAmount);
  $(`#total-${type}`).text(`$${typeCost.toFixed(2)}`);

  // Update overall order total
  gOrder.forEach((order) => {
    totalCost += order.amount * order.cost;
  });
  $("#orderCost").text(`$${totalCost.toFixed(2)}`);
}

const submitOrder = () => {
  const invalidFields = [];

  const firstName = $('#firstName').val();
  const lastName = $('#lastName').val();
  const phone = $('#phone').val();
  const email = $('#email').val();
  const street = $('#street').val();
  const city = $('#city').val();
  const zip = $('#zip').val();

  if (firstName === "") {
    invalidFields.push('firstName');
  }

  if (lastName === "") {
    invalidFields.push('lastName');
  }

  if (email === "") {
    invalidFields.push('email');
  }

  if (street === "") {
    invalidFields.push('street');
  }

  if (city === "") {
    invalidFields.push('city');
  }

  if (zip === "") {
    invalidFields.push('zip');
  }

  if (invalidFields.length > 0) {
    const form = $('#order-form');
    invalidFields.forEach((field) => {
      form.find(`#${field}`).parent().addClass('is-invalid');
    });
    handleError('Please fill in all the fields.');
    return;
  }

  if (gOrder.length === 0) {
    handleError('Please select items to order.');
    return;
  }

  $.post('set/order.php', {
    firstName: firstName
    ,lastName: lastName
    ,phone: phone
    ,email: email
    ,street: street
    ,city: city
    ,zip: zip
    ,order: gOrder
  })
  .done(() => {
    $('#submitButton').off('click').hide();
    showSnackbar('Order Submitted. Thank you!');
  }, "JSON")
  .fail((error) => {
    handleError(error);
  }, "JSON");
}

const showSnackbar = (message) => {
  var notification = document.getElementById('snackbar');
  var data = {
    message: message,
    timeout: 5000
  };
  notification.MaterialSnackbar.showSnackbar(data);
}

const handleError = (error) => {
  showSnackbar(error);
}

const upgradeDom = (x) => {
  componentHandler.upgradeDom(x);
}

const buildTables = (types) => {
  let output = "";
  types.forEach((type) => {
    output += `<div class="mdl-typography--display-1 mdl-typography--text-center">${type.title}</div>`;
    output += `<table id="type-${type.id_type}" class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">`;
    // Table Header
    output += `<thead><tr><th class="mdl-data-table__cell--non-numeric">Kind</th><th>${type.quantity}</th>`;
    output += `<th>Quantity</th><th class="mdl-data-table__cell--non-numeric">Remove/Add</th><th>Total</th>`;
    // Table Footer
    output += `<tfoot><tr><td colspan="2">Total:</td><td id="amount-${type.id_type}">0</td><td id="total-${type.id_type}" colspan="2">$0.00</td></tr></tfoot>`;
    output += `</tr></thead><tbody></tbody></table>`;
  })
  $('#tableWrapper').append(output);
}

const getTypes = () => {
  $.getJSON('get/types.php', {})
  .done((types) => {
    buildTables(types);
    getFoods();
  })
  .fail((error) => {
    handleError(error);
  });
}

const getFoods = () => {
  $.getJSON('get/foods.php', {})
  .done((foods) => {

    if (!foods || foods.length === 0) {
      handleError("There are currently no products to order");
      return;
    }

    let output = [];
    foods.forEach((food, index) => {
      let cost = parseFloat(food.cost);
      let row = '<tr><td class="mdl-data-table__cell--non-numeric">';
      // Image / Name
      row += `<button id="image-${food.id_food}" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon"><i class="material-icons">photo_camera</i></button>`;
      row += `<div class="mdl-menu mdl-menu--bottom-left mdl-js-menu" for="image-${food.id_food}">`;
      row += `<img src="images/${food.image_path}" alt="${food.name} Photo" /></div>${food.name}</td>`;
      // Cost
      row += `<td>$${cost.toFixed(2)}</td>`;
      // Amount
      row += `<td class="amount">0</td>`;
      // Buttons
      row += `<td class="mdl-data-table__cell--non-numeric">`;
      // Remove button
      row += `<button class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect decrement mdl-cell--12-col-phone" data-index="${index}"><i class="material-icons">remove</i></button>`;
      // Add Button
      row += `<button class="mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect increment mdl-cell--12-col-phone" data-index="${index}"><i class="material-icons">add</i></button>`;
      row += `</td>`;
      // Total
      row += `<td class="total">$0.00</td></tr>`;

      // Append rows together to add to table later
      if (typeof output[food.id_type] === "undefined") {
        output[food.id_type] = row;
      } else {
        output[food.id_type] += row;
      }
    });

    // Loop through outputs and add to correct table
    output.forEach((list, index) => {
      $(`#type-${index} tbody`).append(list);
    });

    gFoods = foods;

    // Needed for buttons to be registered with MDL
    setTimeout(() => {
      upgradeDom('button');
    }, 1000);
  })
  .fail((error) => {
    handleError(error);
  });
}