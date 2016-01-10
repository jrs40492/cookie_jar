/* jshint unused: false, undef:false */
var foodArray = [];

$(document).ready( function() {
  function ajaxObj(meth, url) {
    var x = new XMLHttpRequest();
    x.open(meth, url, true);
    x.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    return x;
  }

  function ajaxReturn(x) {if (x.readyState === 4 && x.status === 200) {return true;} else {return false;}}

  $('#foodList').on('click', '.decrement', function() {
    var $this = $(this);
    var amount = parseInt($this.parent().siblings(".amount").text());
    var index = $this.parent().parent().index();
    if (amount > 0) {
      var newAmount = amount - 1;
      foodArray[index][3] = newAmount;
      $this.parent().siblings('.amount').text(newAmount);
    }
    updateTotal(index, $this);
  });

  $('#foodList').on('click', '.increment', function() {
    var $this = $(this);
    var amount = $this.parent().siblings('.amount').text();
    var index = $this.parent().parent().index();
    var newAmount = parseInt(amount) + 1;
    foodArray[index][3] = newAmount;
    $this.parent().siblings('.amount').text(newAmount);
    updateTotal(index, $this);
  });

  $('#submitButton').on('click', function() {
    submitOrder();
  });

  function updateTotal(index, that) {
    var total = 0;
    foodArray[index][4] = foodArray[index][2] * foodArray[index][3];
    that.parent().siblings('.total').text('$' + foodArray[index][4].toFixed(2));
    for (var x = 0; x < foodArray.length; x++) {
      total += parseFloat(foodArray[x][4]);
    }
    $('#orderCost').text('$' + total.toFixed(2));
  }

  function submitOrder() {
    var name1 = $('#name1').val();
    var name2 = $('#name2').val();
    var number = $('#number').val();
    var email = $('#email').val();
    var address = $('#address').val();
    var city = $('#city').val();
    var zip = $('#zip').val();
    if (name1 === "" || name2 === "" || number === "" || email === "" || address === "" || city === "" ||  zip === "") {
      $('#errorMessage').text('Please fill in all the fields.').toggle();
    } else {
      var fullAddress = address + " " + city + ", NY " + zip;
      $.post('submitOrder.php', {name1:name1, name2:name2, number:number, email:email, address:fullAddress, order:foodArray}, function (data1) {
        if (data1 !== 'Fail') {
          $('#submitButton').off('click');
          $('#submitButton').text('Order Submitted').addClass('success');
        } else {
          $('#errorMessage').text('There was an error submitting your order. Please try again later.').toggle();
        }
      });
    }
  }
});

function addRemoveButtons() {
  var button = document.createElement('button');
  var innerButton = document.createElement('i');
  var btnNode = document.createTextNode('remove');
  innerButton.appendChild(btnNode);
  button.appendChild(innerButton);
  innerButton.className = 'material-icons';
  button.className = 'mdl-button mdl-js-button mdl-button--fab mdl-button--colored decrement';
  componentHandler.upgradeElement(button);
  $('.removeTD').append(button);
}

function addAddButtons() {
  var button = document.createElement('button');
  var innerButton = document.createElement('i');
  var btnNode = document.createTextNode('add');
  innerButton.appendChild(btnNode);
  button.appendChild(innerButton);
  innerButton.className = 'material-icons';
  button.className = 'mdl-button mdl-js-button mdl-button--fab mdl-button--colored increment';
  componentHandler.upgradeElement(button);
  $('.addTD').append(button);
}

function getFoods() {
  $.post('getFoods.php', {}, function (data1) {
    var data = JSON.parse(data1);
    var output = "";
    for (var x = 0; x < data.length; x++) {
      foodArray.push([data[x].Food_ID, data[x].Name, data[x].Cost, 0, 0]);
      output += '<tr><td class="mdl-data-table__cell--non-numeric">'+data[x].Name+'</td><td class="amount">0</td><td>$'+data[x].Cost+'</td>';
      output += '<td class="removeTD"></td><td class="addTD"></td><td class="total">$0.00</td></tr>';
    }
    $('#foodList tbody').append(output);
    addRemoveButtons();
    addAddButtons();
  });
}
