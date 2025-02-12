// alarm.js

window.onload = () => {
    let token = sessionStorage.getItem("MetricVisionAccessToken");
    
    // If token is not in sessionStorage, try extracting it from URL hash
    if (!token && window.location.hash) {
        let hash = window.location.hash;
        let extractedToken = hash.match(/access_token=([^&]*)/);
        if (extractedToken) {
            token = extractedToken[1];
            sessionStorage.setItem("MetricVisionAccessToken", token);
        }
    }
    
    if (token) {
        console.log("Access token loaded successfully:", token);
    } else {
        console.warn("No access token found!");
    }
};

// Example API call function using the access token
async function fetchAlarmsData() {
    let token = sessionStorage.getItem("MetricVisionAccessToken");
    if (!token) {
        console.error("Access token missing! Cannot fetch alarm data.");
        return;
    }
    
    try {
        let response = await fetch("YOUR_API_ENDPOINT", {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch alarm data");
        }
        
        let data = await response.json();
        console.log("Alarm Data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching alarm data:", error);
    }
}

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
