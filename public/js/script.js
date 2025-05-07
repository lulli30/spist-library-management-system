function GetSelected() {
    // REFERENCE THE TABLE
    var grid = document.getElementById("Table1");

    // REFERENCE THE CHECKBOXES IN TABLE
    var checkBoxes = grid.getElementsByTagName("INPUT");
    var message = "Company,Contact,Country\n";

    // LOOP THROUGH THE CHECKBOXES
    for (var i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) {
            var row = checkBoxes[i].parentNode.parentNode;
            message += row.cells[1].innerHTML;
            message += "," + row.cells[2].innerHTML;
            message += "," + row.cells[3].innerHTML;
            message += "\n";
        }
    }
    // DISPLAY SELECTED ROW DATA IN ALERT BOX
    alert(message);
}