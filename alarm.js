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
    $("#getAlarmsData").attr("disabled",false);
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

function sortTable() {
    const sortBy = $("#sortBy").val();  // Get the selected sort option
    const table = $('#alarmsList table');
    const rows = Array.from(table.find('tbody tr'));

    let sortedRows = [];

    switch(sortBy) {
        case 'alarmNameAZ':
            sortedRows = rows.sort((a, b) => {
                const alarmA = $(a).find('td').eq(0).text().toLowerCase();  // Assuming AlarmName is in the first column
                const alarmB = $(b).find('td').eq(0).text().toLowerCase();
                return alarmA.localeCompare(alarmB);  // Sort A-Z
            });
            break;
        case 'alarmNameZA':
            sortedRows = rows.sort((a, b) => {
                const alarmA = $(a).find('td').eq(0).text().toLowerCase();
                const alarmB = $(b).find('td').eq(0).text().toLowerCase();
                return alarmB.localeCompare(alarmA);  // Sort Z-A
            });
            break;
        case 'stateInsufficient':
            sortedRows = rows.sort((a, b) => {
                const stateA = $(a).find('td').eq(1).text().toLowerCase();  // Assuming STATE is in the second column
                const stateB = $(b).find('td').eq(1).text().toLowerCase();
                return stateA === 'insufficient_data' ? -1 : 1;  // Sort INSUFFICIENT_DATA to top
            });
            break;
        case 'stateAlarm':
            sortedRows = rows.sort((a, b) => {
                const stateA = $(a).find('td').eq(1).text().toLowerCase();
                const stateB = $(b).find('td').eq(1).text().toLowerCase();
                return stateA === 'alarm' ? -1 : 1;  // Sort ALARM to top
            });
            break;
    }

    // Reorder the rows in the table
    table.find('tbody').empty().append(sortedRows);
}


async function getAlarmsData(){
    input = $("#customerAccounts").val();
    const accounts = getAccountsAlarmsAPI();

    let apiURL = accounts
    .filter(account => account[input])
    .map(account => account[input].cloudWatchAPI)[0];
    try{
        await fetch(apiURL).then(response =>{
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
            }).then(data=>{
                const body = JSON.parse(data.body); // Parse the body string into an array of objects
                console.log(body);
                createTable(body);

            })
            .catch(error =>{
                console.error('There was a problem with the fetch operation:', error);
            });
    } catch(err){
        console.log(err);
    }

}
