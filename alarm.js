let alarmsData = []; // Store alarms data globally

function getAccountsAlarmsAPI() {
    const allAccountsAlarmsList = [
        {
            "MAS Sandbox Development": {
                "cloudWatchAPI": "https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        },
        {
            "MAS Sandbox Test1": {
                "cloudWatchAPI": "https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        },
        {
            "MAS Sandbox Test2": {
                "cloudWatchAPI": "https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        }
    ]
    return allAccountsAlarmsList;
}

function customerAccountChange(event) {
    $("#getAlarmsData").attr("disabled", false);
}

function createTable(alarms) {
    const table = $('#alarmsList table');
    alarmsData = alarms;  // Store alarms data
    
    // Clear existing table content
    table.empty();
    
    // Create table header
    const headers = Object.keys(alarms[0]);
    let headerHtml = '<thead><tr>';
    
    headers.forEach(headerText => {
        if (headerText === 'Alarm Name') {
            headerHtml += `<th>${headerText} <select onchange="sortTable(event)">
                                <option value="asc">A-Z</option>
                                <option value="desc">Z-A</option>
                            </select></th>`;
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

async function getAlarmsData() {
    const input = $("#customerAccounts").val();
    const accounts = getAccountsAlarmsAPI();

    let apiURL = accounts
        .filter(account => account[input])
        .map(account => account[input].cloudWatchAPI)[0];
    try {
        await fetch(apiURL).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            const body = JSON.parse(data.body); // Parse the body string into an array of objects
            createTable(body);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    } catch (err) {
        console.log(err);
    }
}

function sortTable(event) {
    const order = event.target.value;
    
    // Sort alarmsData based on Alarm Name
    alarmsData.sort((a, b) => {
        const nameA = a["Alarm Name"].toLowerCase();
        const nameB = b["Alarm Name"].toLowerCase();
        
        if (order === 'asc') {
            return nameA > nameB ? 1 : -1;
        } else {
            return nameA < nameB ? 1 : -1;
        }
    });
    
    // Re-render the table with sorted data
    createTable(alarmsData);
}
