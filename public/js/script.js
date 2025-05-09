function GetSelected() {
  var grid = document.getElementById("Table1");

  var checkBoxes = grid.getElementsByTagName("INPUT");
  var message = "Company,Contact,Country\n";

  for (var i = 0; i < checkBoxes.length; i++) {
    if (checkBoxes[i].checked) {
      var row = checkBoxes[i].parentNode.parentNode;
      message += row.cells[1].innerHTML;
      message += "," + row.cells[2].innerHTML;
      message += "," + row.cells[3].innerHTML;
      message += "\n";
    }
  }
  alert(message);
}
