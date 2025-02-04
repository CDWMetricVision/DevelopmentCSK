function accountsAndConnectInstancesObject() {
    const allAccountsList = [
        {
            "MAS Sandbox Development": {
                "connectInstances": {
                    "masdevelopment": "08aaaa8c-2bbf-4571-8570-f853f6b7dba0",
                    "masdevelopmentinstance2": "5c1408e0-cd47-4ba9-9b0c-c168752e2285"
                }
            }
        },
        {
            "MAS Sandbox Test1": {
                "connectInstances": {
                    "mastest1instance2": "921b9e21-6d50-4365-b861-297f61227bb8",
                    "mastest1": "cd54d26a-fee3-4645-87da-6acae50962a5"
                }
            }
        },
        {
            "MAS Sandbox Test2": {
                "connectInstances": {
                    "mastest2instance2": "d8445c54-35f2-4e65-ab0f-9c98889bdb0c",
                    "mastest2": "ce2575a1-6ad8-4694-abd6-53acf392c698"
                }
            }
        }
    ]
    return allAccountsList;
}
function getCreateWidgetRequestBody(dashboardName,metrics,instanceId,view) {
    return {
        "dashboardName": dashboardName,
        "dashboardBody": {
          "widgets": [
            {
              "type": "metric",
              "x": 0,
              "y": 0,
              "width": 12,
              "height": 6,
              "properties": {
                "metrics": [
                  [ "AWS/Connect", metrics, "InstanceId", instanceId ]
                ],
                "period": 300,
                "stat": "Average",
                "region": "us-east-1",
                "title": metrics
              }
            }
          ]
        }
      };
}
window.addEventListener("load",() => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);


    if (params.has("customerAccount")) {
        console.log("Query parameter 'product' exists!"); 
        const selectedAcc = params.get("customerAccount");
        let allAccountsList = accountsAndConnectInstancesObject();
        let instanceList = $("#instances");
        $("#instances").empty();
        let option = $("<option>", {
            text: "--Select--",
            value: "",
            disabled: true,
            selected: true,
            hidden: true
        });
        instanceList.append(option);

        for (let i = 0; i < allAccountsList.length; i ++) {
            let accountName = Object.keys(allAccountsList[i])[0]
            if (accountName.toLowerCase() === selectedAcc.toLowerCase()) {
                for (let [connectInstanceName, connectInstanceId] of Object.entries(allAccountsList[i][accountName]["connectInstances"])) {
                    option = $("<option>", {
                        text: connectInstanceName,
                        value: connectInstanceId,
                    });
                    instanceList.append(option);
                }
            }
        }
    }
})

async function createWidgets(){
    let selectedMetrics = $("#selctedMetrics").val();
    let instanceId = $("#instances").val();
    let dashboardName = $("#dashboardName").val().trim();
    let widgetView = $("#widgets").val();
    // console.log(getCreateWidgetRequestBody(dashboardName,selectedMetrics,instanceId));
    const apiURL = 'https://uptqippqj5.execute-api.us-east-1.amazonaws.com/test/put_dashboard';
    $("#loader").show();
    try{
        await fetch(apiURL,
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(getCreateWidgetRequestBody(dashboardName,selectedMetrics,instanceId,widgetView)),
            }
        ).then(response =>{
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
            }).then(data=>{
                const body = JSON.parse(data.body);
                console.log(body);
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