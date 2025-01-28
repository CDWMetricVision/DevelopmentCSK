function getAccountsAlarmsAPI() {
    const allAccountsAlarmsList = [
        {
            "MAS Sandbox Development": {
                "cloudWatchAPI":"https://3fc73zg0h0.execute-api.us-east-1.amazonaws.com/testing/getalarms"
            }
        },
        {
            "MAS Sandbox Test1": {
                "cloudWatchAPI":"https://bjg478cmxc.execute-api.us-east-1.amazonaws.com/test/getalarm"
            }
        },
        {
            "MAS Sandbox Test2": {
                "cloudWatchAPI":"https://hltiodxu24.execute-api.us-east-1.amazonaws.com/test/getalarm"
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
            if (header.toLowerCase() === 'state' && alarm[header].toLowerCase() === 'in alarm') {
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

async function getAlarmsData(){
    input = $("#customerAccounts").val();
    const accounts = getAccountsAlarmsAPI();

    let apiURL = accounts
    .filter(account => account[input])
    .map(account => account[input].cloudWatchAPI)[0];
    try{
        let response = await fetch(apiURL, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            console.log(response);
        } else {
            let alarms = await response.json();
            console.log("alarms",alarms);
            // alarms = [{"AlarmName": "Alarm_ConcurrentCalls", "State": "ALARM", "Metric": "ConcurrentCalls", "Namespace": "AWS/Connect", "Description": "No description"}, {"AlarmName": "Alarm_callsperinterval", "State": "INSUFFICIENT_DATA", "Metric": "CallsPerInterval", "Namespace": "AWS/Connect", "Description": "No description"}, {"AlarmName": "Alarm_missedcalls", "State": "INSUFFICIENT_DATA", "Metric": "MissedCalls", "Namespace": "AWS/Connect", "Description": "No description"}];
            createTable(alarms);
        }
    } catch(err){
        console.log(err);
    }

}
