function customerAccountChange(event) {
    $("#saveDashboards").attr("disabled", false);
    $("#createDashboards").attr("disabled", false);
}

function createDashboards() {
    const selectedAcc = $("#customerAccounts").val();
    const navURL = '/createDashboard.html?' + 'customerAccount='+selectedAcc;
    window.open(navURL, '_blank');
}

function handleInputChange(event) {
    console.log(event.target.value);
    $("#createDashboards").attr("disabled", false);
}

function saveDashboards() {
    const accName = $("#accountName").val();
    
    if (accName.trim() === '' || accName.length === 0) {
        window.alert("Enter Dashboard Name");
    }
}

function getSavedDashboardsAPI() {
    const savedDashboardsAPI = [
        {
            "MAS Sandbox Development":"https://szw9nl20j5.execute-api.us-east-1.amazonaws.com/test/getdashboards",
        },
        {
            "MAS Sandbox Test1":"https://8vauowiu26.execute-api.us-east-1.amazonaws.com/test/getdashboards",
        },
        {
            "MAS Sandbox Test2":"https://9v5jzdmc6a.execute-api.us-east-1.amazonaws.com/test/getdashboards",
        }
    ]
    return savedDashboardsAPI;
}

async function getSavedDashboards() {
    let customerAccount = $("#customerAccounts").val()
    const apis = getSavedDashboardsAPI();
    let apiURL = apis
    .filter(account => account[customerAccount])
    .map(account => account[customerAccount])[0];
    $("#loader").show();
    try{
        await fetch(apiURL,
            {
                method: "GET",
            }
        ).then(response =>{
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
            }).then(data=>{
                const body = JSON.parse(data.body);
                console.log(body.data);
                for (const key in body.data) {
                    console.log(`Key: ${key}`);
                    
                    const parsedData = JSON.parse(body.data[key]);

                    if (parsedData.widgets && parsedData.widgets.length > 0) {
                        for (const widget of parsedData.widgets) {
                            console.log(`  Type: ${widget.type}`);
                            console.log(`  Position: (${widget.x}, ${widget.y})`);
                            console.log(`  Size: ${widget.width}x${widget.height}`);
                            console.log(`  Properties:`, widget.properties);
                        }
                    } else {
                        console.log("  No widgets found.");
                    }
                }
                // createTable(body);
                $("#loader").hide();

            })
            .catch(error =>{
                $("#loader").hide();
                console.error('There was a problem with the fetch operation:', error);
            });
    } catch(err){
        console.log(err);
    }

}

function selectAllConnectMetrics(event) {
    let instanceMetricsCheckboxes = document.querySelectorAll(".instance-metrics");
    instanceMetricsCheckboxes.forEach(checkbox => {
        checkbox.checked = event.target.checked;
    })
}