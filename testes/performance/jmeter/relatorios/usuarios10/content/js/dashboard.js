/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 89.2, "KoPercent": 10.8};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.892, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.73, 500, 1500, "DELETE /pecas/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "GET /etapas"], "isController": false}, {"data": [1.0, 500, 1500, "GET /relatorios"], "isController": false}, {"data": [0.73, 500, 1500, "POST /pecas"], "isController": false}, {"data": [1.0, 500, 1500, "GET /aeronaves"], "isController": false}, {"data": [1.0, 500, 1500, "GET /funcionarios"], "isController": false}, {"data": [1.0, 500, 1500, "GET /testes"], "isController": false}, {"data": [0.73, 500, 1500, "GET /pecas/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "GET /pecas"], "isController": false}, {"data": [0.73, 500, 1500, "PATCH /pecas/{id}"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1000, 108, 10.8, 21.68599999999999, 2, 66, 20.0, 37.0, 43.0, 55.0, 332.22591362126246, 1232.4575633305649, 66.52629256644519], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["DELETE /pecas/{id}", 100, 27, 27.0, 19.109999999999992, 5, 45, 20.0, 26.900000000000006, 28.94999999999999, 44.89999999999995, 33.921302578018995, 6.76902243046133, 6.29564800288331], "isController": false}, {"data": ["GET /etapas", 100, 0, 0.0, 20.110000000000003, 5, 42, 20.0, 30.80000000000001, 34.0, 41.989999999999995, 33.96739130434782, 120.4780910326087, 5.373747452445652], "isController": false}, {"data": ["GET /relatorios", 100, 0, 0.0, 18.040000000000003, 4, 45, 18.0, 26.0, 34.849999999999966, 44.93999999999997, 33.96739130434782, 309.4880477241848, 5.506432574728261], "isController": false}, {"data": ["POST /pecas", 100, 27, 27.0, 34.029999999999994, 9, 63, 35.0, 50.80000000000001, 57.849999999999966, 63.0, 33.863867253640365, 20.16520540551981, 11.410866597527939], "isController": false}, {"data": ["GET /aeronaves", 100, 0, 0.0, 31.86000000000001, 11, 66, 31.0, 48.0, 54.94999999999999, 65.94999999999997, 33.80662609871535, 496.85869094405, 5.447356744421906], "isController": false}, {"data": ["GET /funcionarios", 100, 0, 0.0, 17.05, 4, 40, 18.0, 23.900000000000006, 32.69999999999993, 39.969999999999985, 33.96739130434782, 71.68313731317934, 5.572775135869565], "isController": false}, {"data": ["GET /testes", 100, 0, 0.0, 17.900000000000013, 3, 39, 18.0, 27.900000000000006, 31.899999999999977, 38.97999999999999, 33.96739130434782, 96.56159774116848, 5.373747452445652], "isController": false}, {"data": ["GET /pecas/{id}", 100, 27, 27.0, 16.259999999999987, 2, 38, 18.0, 23.900000000000006, 25.94999999999999, 37.93999999999997, 33.94433129667346, 16.961889532416837, 5.570649291412084], "isController": false}, {"data": ["GET /pecas", 100, 0, 0.0, 16.520000000000007, 4, 38, 17.5, 25.0, 27.94999999999999, 38.0, 33.96739130434782, 101.70314622961956, 5.340576171875], "isController": false}, {"data": ["PATCH /pecas/{id}", 100, 27, 27.0, 25.98, 4, 59, 25.5, 41.0, 47.89999999999998, 58.93999999999997, 33.886818027787186, 16.933150309217215, 12.024194658590307], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 27, 25.0, 2.7], "isController": false}, {"data": ["404/Not Found", 81, 75.0, 8.1], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1000, 108, "404/Not Found", 81, "400/Bad Request", 27, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["DELETE /pecas/{id}", 100, 27, "404/Not Found", 27, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /pecas", 100, 27, "400/Bad Request", 27, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /pecas/{id}", 100, 27, "404/Not Found", 27, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["PATCH /pecas/{id}", 100, 27, "404/Not Found", 27, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
