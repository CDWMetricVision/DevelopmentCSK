let alarmsData = []; // Store alarms data globally

function createTable(alarms) {
    const table = $('#alarmsList table');
    alarmsData = alarms;  // Store alarms data globally

    // Clear existing table content
    table.empty();

    // Create table header with sorting option for Alarm Name & State
    const headers = Object.keys(alarms[0]);
    let headerHtml = '<thead><tr>';

    headers.forEach(headerText => {
        if (headerText === 'Alarm Name') {
            headerHtml += `<th>${headerText} 
                                <select onchange="sortTable(event, 'Alarm Name')">
                                    <option value="asc">A-Z</option>
                                    <option value="desc">Z-A</option>
                                </select>
                           </th>`;
        } else if (headerText === 'State') {
            headerHtml += `<th>${headerText} 
                                <select onchange="sortTable(event, 'State')">
                                    <option value="asc">OK → Alarm</option>
                                    <option value="desc">Alarm → OK</option>
                                </select>
                           </th>`;
        } else {
            headerHtml += `<th>${headerText}</th>`;
        }
    });

    headerHtml += '</tr></thead>';
    table.append(headerHtml);

    // Create table body
    let bodyHtml = '<tbody>';

    alarms.forEach(alarm => {
        bodyHtml += '<tr>';
        headers.forEach(header => {
            if (header.toLowerCase() === 'state' && alarm[header].toLowerCase() === 'alarm') {
                bodyHtml += `<td class="red">${alarm[header]}</td>`;
            } else {
                bodyHtml += `<td>${alarm[header]}</td>`;
            }
        });
        bodyHtml += '</tr>';
    });

    bodyHtml += '</tbody>';
    table.append(bodyHtml);
}

function sortTable(event, column) {
    const order = event.target.value;

    alarmsData.sort((a, b) => {
        let valueA = a[column].toLowerCase();
        let valueB = b[column].toLowerCase();

        if (column === 'State') {
            // Custom sorting for State: "Alarm" > "Insufficient data" > "OK"
            const orderList = ["alarm", "insufficient data", "ok"];
            return order === "asc"
                ? orderList.indexOf(valueA) - orderList.indexOf(valueB)
                : orderList.indexOf(valueB) - orderList.indexOf(valueA);
        } else {
            // Alphabetical sorting for other columns
            return order === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }
    });

    // Re-render the table with sorted data
    createTable(alarmsData);
}
