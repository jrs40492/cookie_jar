/* jshint unused: false, undef:false */
var foodArray = [],
    totalAmount = 0,
    typeList = ['Dropped', 'Bar', 'Cutout', 'Press', 'Monster', 'Pie', 'Scone', 'Biscotti', 'Muffin'],
    indexMapper = [];

$(document).ready( function() {
  function ajaxObj(meth, url) {
    var x = new XMLHttpRequest();
    x.open(meth, url, true);
    x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    return x;
  }

  function ajaxReturn(x) {if (x.readyState === 4 && x.status === 200) {return true;} else {return false;}}

  $('#tableWrapper').on('click', '.decrement', function() {
    var $this = $(this);
    var amount = parseInt($this.parent().siblings(".amount").text());
    var tableIndex = $this.parent().parent().parent().parent().index('table');
    var rowIndex = $this.parent().parent().index();
    if (amount > 0) {
      totalAmount -= 1;
      var newAmount = amount - 1;
      updateTotal(tableIndex, rowIndex, $this, newAmount);
    }
  });

  $('#tableWrapper').on('click', '.increment', function() {
    var $this = $(this);
    totalAmount += 1;
    var amount = $this.parent().siblings('.amount').text();
    var tableIndex = $this.parent().parent().parent().parent().index('table');
    var rowIndex = $this.parent().parent().index();
    var newAmount = parseInt(amount) + 1;
    updateTotal(tableIndex, rowIndex, $this, newAmount);
  });

  $('#submitButton').on('click', function() {
    submitOrder();
  });

  //[data[x].Food_ID, data[x].Name, data[x].Cost, 0, 0]
  //Food_ID, Name, cost, amount, total
  function updateTotal(tableIndex, rowIndex, that, amount) {
    var total = 0;
    var index = indexMapper[tableIndex][rowIndex];
    foodArray[index][3] = amount;
    that.parent().siblings('.amount').text(amount);
    foodArray[index][4] = foodArray[index][2] * foodArray[index][3];
    that.parent().siblings('.total').text('$' + foodArray[index][4].toFixed(2));
    for (var x = 0; x < foodArray.length; x++) {
      total += parseFloat(foodArray[x][4]);
    }
    $('#'+typeList[tableIndex]+'Cost').text('$' + total.toFixed(2));
    total = 0;
    $.each(typeList, function(index1, value) {
      var price = $('#'+typeList[index1]+'Cost').text();
      total += parseFloat(price.replace(/[^0-9\.]/g, ''));
    });
    $("#orderCost").text('$' + total.toFixed(2));
  }

  function submitOrder() {
    $('#errorMessage').hide();
    var name1 = $('#name1').val();
    var name2 = $('#name2').val();
    var number = $('#number').val();
    var email = $('#email').val();
    var address = $('#address').val();
    var city = $('#city').val();
    var zip = $('#zip').val();
    var captcha = $('#g-recaptcha-response').val();
    if (name1 === "" || name2 === "" || number === "" || email === "" || address === "" || city === "" ||  zip === "" || captcha === "") {
      $('#errorMessage').text('Please fill in all the fields.').show();
    } else if (totalAmount === 0) {
      $('#errorMessage').text('Please order at least one kind of cookie.').show();
    } else {
      var fullAddress = address + " " + city + ", NY " + zip;
      $.post('submitOrder.php', {name1:name1, name2:name2, number:number, email:email, address:fullAddress, order:foodArray, captcha:captcha}, function (data1) {
        if (data1 === 'Success') {
          $('#submitButton').off('click');
          $('#submitButton').addClass('success').text('Order Submitted');
        } else if (data1 === 'captcha_fail') {
          $('#errorMessage').text('There was an error with the reCAPTCHA.').show();
        } else {
          $('#errorMessage').text('There was an error submitting your order. Please try again later.').show();
        }
      });
    }
  }
});

function addButtons() {
  var removeBtn = document.createElement('button');
  var innerRemoveButton = document.createElement('i');
  var removeNode = document.createTextNode('remove');
  innerRemoveButton.appendChild(removeNode);
  removeBtn.appendChild(innerRemoveButton);
  innerRemoveButton.className = 'material-icons';
  removeBtn.className = 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect decrement mdl-cell--12-col-phone';

  var addBtn = document.createElement('button');
  var innerAddButton = document.createElement('i');
  var addNode = document.createTextNode('add');
  innerAddButton.appendChild(addNode);
  addBtn.appendChild(innerAddButton);
  innerAddButton.className = 'material-icons';
  addBtn.className = 'mdl-button mdl-js-button mdl-button--icon mdl-js-ripple-effect increment mdl-cell--12-col-phone';

  $('.modifyTD').append(removeBtn).append(addBtn);
}

function upgradeDom(x) {
  componentHandler.upgradeDom(x);
}

function buildTables() {
  var output = "";
  var titleList = ['Dropped Cookies', 'Bar Cookies', 'Cut-outs', 'Press Cookies', 'Monster Cookies', 'Pies', 'Scones', 'Biscotti', 'Sweet Breads/ Muffins'];
  var tableContents = '<tr><th class="mdl-data-table__cell--non-numeric">Kind</th><th>Price/Dozen</th><th>Quantity</th><th class="mdl-data-table__cell--non-numeric">Remove/Add</th><th>Total</th></tr></thead><tbody></tbody><tfoot><tr><td colspan="4">Total:</td>';
  for (var x = 0; x < titleList.length; x++) {
    output += '<div class="mdl-typography--display-1">'+titleList[x]+'</div><table id="'+typeList[x]+'List" class="mdl-data-table mdl-js-data-table mdl-shadow--2dp mdl-cell--12-col"><thead>' + tableContents + '<td id="'+typeList[x]+'Cost">$0.00</td></tr></tfoot></table>';
  }
  $('#tableWrapper').append(output);
}

function getFoods() {
  buildTables();
  $.post('getFoods.php', {}, function (data1) {
    for (var z = 0; z < typeList.length; z++) {
      indexMapper[z] = [];
    }
    var data = JSON.parse(data1);
    var output = "";
    var typeIndex = "";
    for (var x = 0; x < data.length; x++) {
      var cost = parseFloat(data[x].Cost);
      foodArray.push([data[x].Food_ID, data[x].Name, data[x].Cost, 0, 0]);
      output = '<tr><td class="mdl-data-table__cell--non-numeric">';
      output += '<button id="image-'+data[x].Food_ID+'" class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon"><i class="material-icons">photo_camera</i></button><div class="mdl-menu mdl-menu--bottom-left mdl-js-menu" for="image-'+data[x].Food_ID+'"><img src="images/'+data[x].Image_Path+'" alt="'+data[x].Name+' Photo" /></div>'+data[x].Name+'</td>';
      output += '<td>$'+cost.toFixed(2)+'</td>';
      output += '<td class="amount">0</td><td class="modifyTD mdl-data-table__cell--non-numeric"></td><td class="total">$0.00</td></tr>';
      $('#'+data[x].Type+'List tbody').append(output);
      typeIndex = typeList.indexOf(data[x].Type);
      indexMapper[typeIndex].push(x);
    }
    console.log(indexMapper);
    addButtons();
    setTimeout(function(){upgradeDom('button');}, 1000);
  });
}
