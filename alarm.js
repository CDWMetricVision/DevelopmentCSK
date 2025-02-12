let currentStateFilter = "All"; // Track the selected state filter globally

// Function to update the state filter when the user selects a new state
function applyStateFilter() {
    currentStateFilter = $("#alarmStateFilter").val(); // Capture the selected filter value
    getAlarmsData(); // Reload the alarms with the new filter applied
}

// Modify the createTable function to apply the state filter
function createTable(alarms) {
    const table = $('#alarmsList table');
    
    // Clear existing table content
    table.empty();
    
    // Create table header
    const headers = Object.keys(alarms[0]);
    let headerHtml = '<thead><tr>';
    
    headers.forEach(headerText => {
        headerHtml += `<th>${headerText}</th>`;
    });
    
    headerHtml += '</tr></thead>';
    table.append(headerHtml);
    
    // Create table body
    let bodyHtml = '<tbody>';
    
    alarms.forEach(alarm => {
        // Apply filter logic for state before adding row
        if (currentStateFilter === "All" || alarm.state.toUpperCase() === currentStateFilter.toUpperCase()) {
            bodyHtml += '<tr>';
            headers.forEach(header => {
                if (header.toLowerCase() === 'state' && alarm[header].toLowerCase() === 'alarm') {
                    bodyHtml += `<td class="red">${alarm[header]}</td>`;
                } else {
                    bodyHtml += `<td>${alarm[header]}</td>`;
                }
            });
            bodyHtml += '</tr>';
        }
    });
    
    bodyHtml += '</tbody>';
    table.append(bodyHtml);
}

// Function to get alarms data from CloudWatch API for selected account
async function getAlarmsData() {
    input = $("#customerAccounts").val();
    const accounts = getAccountsAlarmsAPI();

    let apiURL = accounts
    .filter(account => account[input])
    .map(account => account[input].cloudWatchAPI)[0];

    // Get the access token from sessionStorage
    const token = sessionStorage.getItem("MetricVisionAccessToken");

    if (!token) {
        console.error("Access token is missing!");
        return;
    }

    try {
        // Make the fetch request with the access token in headers
        await fetch(apiURL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,  // Add the token to the Authorization header
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const body = JSON.parse(data.body); // Parse the body string into an array of objects
            console.log(body);
            createTable(body);  // Display the data in a table
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    } catch (err) {
        console.log(err);
    }
}
