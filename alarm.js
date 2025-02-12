// Existing function: getAccountsAlarmsAPI
function getAccountsAlarmsAPI() {
    const allAccountsAlarmsList = [
        {
            "MAS Sandbox Development": {
                "cloudWatchAPI":"https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        },
        {
            "MAS Sandbox Test1": {
                "cloudWatchAPI":"https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        },
        {
            "MAS Sandbox Test2": {
                "cloudWatchAPI":"https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        }
    ]
    return allAccountsAlarmsList;
}

// Existing function: customerAccountChange
function customerAccountChange(event) {
    $("#getAlarmsData").attr("disabled", false);
}

// Updated createTable function (with state filtering)
function createTable(alarms, stateFilter = "all") {
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
        // Filter alarms by state
        if (stateFilter !== "all" && alarm.state.toLowerCase() !== stateFilter.toLowerCase()) {
            return; // Skip alarms that don't match the selected state
        }
        
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

// Filter function for alarms by state
function filterAlarmsByState() {
    const stateFilter = $("#alarmState").val();  // Get selected state from the dropdown
    const alarms = JSON.parse(sessionStorage.getItem("alarmsData") || "[]");  // Get previously fetched alarms from sessionStorage
    
    createTable(alarms, stateFilter);  // Re-create table with filtered alarms
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
            
            sessionStorage.setItem("alarmsData", JSON.stringify(body));  // Store fetched alarms in sessionStorage
            createTable(body);  // Display the data in a table
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    } catch (err) {
        console.log(err);
    }
}
