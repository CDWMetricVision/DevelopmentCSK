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
function renderChart(containerId, metricName, seriesData) {
    anychart.onDocumentReady(function () {
        let chart = anychart.line();
        let series = chart.line(seriesData);
        series.name(metricName);
        chart.title(metricName + " Over Time");
        $("#"+containerId).empty();
        chart.container(containerId);
        chart.draw();
    });
}
function cleanMetricName(metricId) {
    return metricId
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b[a-z]/g, char => char.toUpperCase()) // Capitalize first letter of each word
        .replace(/\s+/g, " ") // Remove extra spaces
        .trim(); // Trim leading/trailing spaces
}

function createGauge(data, container) {
    // Extract values from data
    let values = data["Values"] || [];

    // Compute min, max, sum, and avg
    let min, max, avg, sum;

    if (data.Id.includes("percentage") || data.Id.includes("packet_loss")) {
        min = 0;
        max = 100;
        sum = "N/A";
    } else {
        min = values.length > 0 ? Math.min(...values) : 0;
        max = values.length > 0 ? Math.max(...values) : 1;
        sum = values.length > 0 ? values.reduce((acc, num) => acc + num, 0) : 0;
    }

    avg = values.length > 0 ? parseFloat((sum / values.length).toFixed(2)) : 0;

    // Set data for gauge
    let dataSet = anychart.data.set([avg]);

    // Create gauge chart
    let gauge = anychart.gauges.circular();
    gauge.data(dataSet);
    gauge.startAngle(270);
    gauge.sweepAngle(180);

    // Configure axis
    let axis = gauge.axis()
        .radius(95)
        .width(1);

    axis.scale()
        .minimum(min)
        .maximum(max);

    axis.ticks()
        .enabled(true)
        .type('line')
        .length('8');

    // Define gauge range
    gauge.range({
        from: min,
        to: max,
        fill: { keys: ["green", "yellow", "orange", "red"] },
        position: "inside",
        radius: 100,
        endSize: "3%",
        startSize: "3%",
        zIndex: 10
    });

    // Set needle
    gauge.needle(0)
        .enabled(true)
        .startRadius('-5%')
        .endRadius('65%')
        .middleRadius(0)
        .startWidth('0.1%')
        .endWidth('0.1%')
        .middleWidth('5%');

    // Create container elements
    let section = document.createElement("section");
    section.classList.add("flex-grow-1", "d-flex", "justify-content-around", "flex-wrap", "align-items-center");
    section.setAttribute("Id", `gauge_${data.Id}`);

    // Metric Name Column
    let metricNameDiv = document.createElement("div");
    metricNameDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    let metricNameTextDiv = document.createElement("b");
    metricNameTextDiv.innerHTML = cleanMetricName(data.Id);
    metricNameDiv.appendChild(metricNameTextDiv);

    // Min & Max Columns
    let minMaxDiv = document.createElement("div");
    minMaxDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    minMaxDiv.innerHTML = `<div>${min}</div><div>Minimum</div><div>${max}</div><div>Maximum</div>`;

    // Avg & Sum Columns
    let avgSumDiv = document.createElement("div");
    avgSumDiv.classList.add("d-flex", "flex-column", "text-center", "mx3");
    avgSumDiv.innerHTML = `<div>${avg}</div><div>Average</div><div>${sum}</div><div>Sum</div>`;

    // Append info to section
    section.append(metricNameDiv, minMaxDiv, avgSumDiv);

    // Create chart container
    let gaugeDiv = document.createElement("div");
    let containerId = `gauge_${data.Id}_container`;
    gaugeDiv.setAttribute("id", containerId);
    
    // Render the gauge inside the container
    gauge.container(gaugeDiv).draw();

    section.append(gaugeDiv);
    section.style.display = "none";
    container.append(section);
}
function createTable(data, container) {
    let metricLabel = cleanMetricName(data.Id)
    let tableWrapper = document.createElement("section");
    tableWrapper.setAttribute("class", "table-responsive");
    tableWrapper.setAttribute("id", `table_${data.Id}`)
    let table = document.createElement("table");
    table.setAttribute("class", "table");
    let tableHead = document.createElement("thead");
    let headerRow = document.createElement("tr");
    tableHead.appendChild(headerRow);
    let tableRowMetricName = document.createElement("th");
    tableRowMetricName.setAttribute("scope", "col");
    tableRowMetricName.setAttribute("style", "text-decoration: underline;");
    tableRowMetricName.innerHTML = "Metric Name";
    headerRow.appendChild(tableRowMetricName);
    data.Timestamps.forEach(timestamp => {
        let header = document.createElement("th");
        header.setAttribute("scope", "col");
        header.innerHTML = timestamp;
        headerRow.appendChild(header);
    })
    table.appendChild(tableHead);
    tableWrapper.appendChild(table);

    let tableBody = document.createElement("tbody");
    let columnRow = document.createElement("tr");
    tableBody.appendChild(columnRow);
    table.appendChild(tableBody);
    let rowHeader = document.createElement("th");
    rowHeader.setAttribute("scope", "row");
    rowHeader.innerHTML = metricLabel;
    columnRow.appendChild(rowHeader);
    if (data.Id.includes("percentage")) {
        data.Values.forEach(value => {
            let row = document.createElement("td");
            row.innerHTML = value + '%';
            columnRow.appendChild(row);
        })
    } else if (data.Id.includes("packet_loss")){
        data.Values.forEach(value => {
            let row = document.createElement("td");
            row.innerHTML = value.toFixed(3) + '%';
            columnRow.appendChild(row);
        })
    } else {
        data.Values.forEach(value => {
            let row = document.createElement("td");
            row.innerHTML = value;
            columnRow.appendChild(row);
        })
    }
    table.appendChild(tableBody);
    tableWrapper.setAttribute("style", "display: none !important");
    container.appendChild(tableWrapper);
}
function generateDataWithTimeZone() {
    let data = [];
    let time = new Date().getTime();
    time = Math.floor(time / 60000) * 60000;
    
    for (let i = 0; i < 20; i++) {
        const date = new Date(time);
        data.push([
            date.toLocaleString('en-US', { 
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            Math.floor(Math.random() * 100)
        ]);
        time += 60000;
    }
    return data;
}
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
                console.log(body.dashboardBody);
                $(".chartContainer").show();
                let chartContainer = document.querySelector(".chartContainer");
                $(".chartContainer").empty();
                let div = document.createElement("div");
                    div.classList.add("dashboard-container");
                    let dasboardContentWrapper = document.createElement("div");
                    dasboardContentWrapper.classList.add("dashboard-wrapper");
                    let p = document.createElement("p");
                    p.innerHTML = `${body.dashboardName} Dashboard`;
                    div.append(p);
                const metrics = body.dashboardBody.widgets.map(widget => ({
                    name: widget.properties.metrics[0][1], // Metric name
                    instanceId: widget.properties.metrics[0][3], // Instance ID
                    region: widget.properties.region
                }));
                const timeSeriesData = generateDataWithTimeZone();

                if (body.dashboardBody.widgets && body.dashboardBody.widgets.length > 0) {
                    for (const widget of body.dashboardBody.widgets) {
                        let innerDiv = document.createElement("div");
                        let id = 'id_' + Math.random().toString(36).substr(2, 9);
                        innerDiv.id = id;
                        innerDiv.classList.add("chart");
                        dasboardContentWrapper.append(innerDiv);
                        if(widget.properties.view && widget.properties.view == "gauge") {
                            createGauge({ Id: metrics[0].name, Values: timeSeriesData.map(d => d[1]) }, innerDiv);
                        }
                        else if(widget.properties.view && widget.properties.view == "bar"){
                            renderChart(id, metrics[0].name, timeSeriesData);
                        }
                        else if(widget.properties.view && widget.properties.view == "table"){
                            // need to change
                            // createTable({ Id: metrics[0].name, Values: timeSeriesData, Timestamps: timeSeriesData }, innerDiv);
                            renderChart(id, metrics[0].name, timeSeriesData); 
                        }
                        else {
                            renderChart(id, metrics[0].name, timeSeriesData);
                        }
                        console.log(`  Type: ${widget.type}`);
                        console.log(`  Position: (${widget.x}, ${widget.y})`);
                        console.log(`  Size: ${widget.width}x${widget.height}`);
                        console.log(`  Properties:`, widget.properties);
                    }
                    div.append(dasboardContentWrapper);
                }
                chartContainer.append(div);
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