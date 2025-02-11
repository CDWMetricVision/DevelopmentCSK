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

function customerAccountChange(event){
    $("#getAlarmsData").attr("disabled", false);
}

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

function applyFilters() {
    const alarmNameFilter = $("#alarmnameFilter").val();
    const stateFilter = $("#stateFilter").val();
    const metricFilter = $("#metricFilter").val();
    
    let filteredAlarms = [...window.alarmsData];  // Keep the original data to apply filters on it

    // Apply Alarm Name filter (A-Z or Z-A)
    if (alarmNameFilter) {
        filteredAlarms = filteredAlarms.sort((a, b) => {
            const alarmNameA = a['AlarmName'].toLowerCase();
            const alarmNameB = b['AlarmName'].toLowerCase();
            if (alarmNameFilter === 'A-Z') {
                return alarmNameA < alarmNameB ? -1 : 1;
            } else if (alarmNameFilter === 'Z-A') {
                return alarmNameA > alarmNameB ? -1 : 1;
            }
            return 0;
        });
    }

    // Apply State filter (ALARM, INSUFFICIENT_DATA)
    if (stateFilter) {
        filteredAlarms = filteredAlarms.filter(alarm => alarm['State'].toLowerCase() === stateFilter.toLowerCase());
    }

    // Apply Metric filter (A-Z or Z-A)
    if (metricFilter) {
        filteredAlarms = filteredAlarms.sort((a, b) => {
            const metricA = a['MetricName'].toLowerCase();
            const metricB = b['MetricName'].toLowerCase();
            if (metricFilter === 'A-Z') {
                return metricA < metricB ? -1 : 1;
            } else if (metricFilter === 'Z-A') {
                return metricA > metricB ? -1 : 1;
            }
            return 0;
        });
    }

    // Re-create table with the filtered alarms
    createTable(filteredAlarms);
}

async function getAlarmsData() {
    const input = $("#customerAccounts").val();
    const accounts = getAccountsAlarmsAPI();

    let apiURL = accounts
        .filter(account => account[input])
        .map(account => account[input].cloudWatchAPI)[0];
    
    try {
        await fetch(apiURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const body = JSON.parse(data.body); // Parse the body string into an array of objects
                console.log(body);
                window.alarmsData = body;  // Store the alarms data for later filtering
                createTable(body);  // Create the table with the full data
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    } catch (err) {
        console.log(err);
    }
}
