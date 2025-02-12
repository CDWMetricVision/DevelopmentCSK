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

// Function to fetch alarms data using access token
function getAlarmsData() {
    let accessToken = sessionStorage.getItem("MetricVisionAccessToken");

    if (accessToken) {
        fetch('/api/alarms', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data); // Process the alarms data from the /api/alarms endpoint
            // Optionally, you can call createTable with this data
            createTable(data);
        })
        .catch(error => {
            console.error('Error fetching alarms:', error);
        });
    } else {
        alert('Access token not found. Please sign in again.');
    }
}

// Existing function: customerAccountChange
function customerAccountChange(event) {
    $("#getAlarmsData").attr("disabled", false);
}

// Existing function: createTable
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
        bodyHtml += '<tr>';
        headers.forEach(header => {
            console.log(alarm[header].toLowerCase());
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

// Function to get alarms data from CloudWatch API for selected account
async function getAlarmsData() {
    input = $("#customerAccounts").val();
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
            console.log(body);
            createTable(body);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    } catch (err) {
        console.log(err);
    }
}
