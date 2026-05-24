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

    var data = {"OkPercent": 92.0, "KoPercent": 8.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.92, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8, 500, 1500, "DELETE /pecas/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "GET /etapas"], "isController": false}, {"data": [1.0, 500, 1500, "GET /relatorios"], "isController": false}, {"data": [0.8, 500, 1500, "POST /pecas"], "isController": false}, {"data": [1.0, 500, 1500, "GET /aeronaves"], "isController": false}, {"data": [1.0, 500, 1500, "GET /funcionarios"], "isController": false}, {"data": [1.0, 500, 1500, "GET /testes"], "isController": false}, {"data": [0.8, 500, 1500, "GET /pecas/{id}"], "isController": false}, {"data": [1.0, 500, 1500, "GET /pecas"], "isController": false}, {"data": [0.8, 500, 1500, "PATCH /pecas/{id}"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 500, 40, 8.0, 19.935999999999986, 3, 71, 17.0, 34.0, 42.0, 54.99000000000001, 185.32246108228318, 683.7960844838769, 37.03662145570793], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["DELETE /pecas/{id}", 50, 10, 20.0, 18.140000000000004, 7, 42, 16.5, 28.9, 33.0, 42.0, 19.305019305019304, 3.664937258687259, 3.563133445945946], "isController": false}, {"data": ["GET /etapas", 50, 0, 0.0, 20.500000000000007, 8, 42, 20.0, 30.9, 41.0, 42.0, 19.157088122605362, 67.9477969348659, 3.030711206896552], "isController": false}, {"data": ["GET /relatorios", 50, 0, 0.0, 15.440000000000001, 4, 50, 12.5, 25.799999999999997, 37.899999999999906, 50.0, 19.201228878648234, 174.94869671658986, 3.112699212749616], "isController": false}, {"data": ["POST /pecas", 50, 10, 20.0, 27.26, 10, 50, 27.0, 36.9, 44.34999999999999, 50.0, 19.20860545524395, 11.298561755666539, 6.464521105455243], "isController": false}, {"data": ["GET /aeronaves", 50, 0, 0.0, 36.36, 17, 71, 34.5, 52.0, 58.79999999999998, 71.0, 18.96094046264695, 274.49923859973455, 3.0552296643913537], "isController": false}, {"data": ["GET /funcionarios", 50, 0, 0.0, 16.64, 5, 42, 15.5, 28.0, 34.79999999999998, 42.0, 19.164430816404753, 40.44368651782292, 3.1441644308164047], "isController": false}, {"data": ["GET /testes", 50, 0, 0.0, 14.379999999999999, 4, 52, 13.0, 25.9, 31.799999999999983, 52.0, 19.230769230769234, 54.66871995192307, 3.0423677884615383], "isController": false}, {"data": ["GET /pecas/{id}", 50, 10, 20.0, 12.699999999999998, 3, 34, 10.5, 24.0, 31.349999999999987, 34.0, 19.327406262079627, 10.021562137611133, 3.152028169694627], "isController": false}, {"data": ["GET /pecas", 50, 0, 0.0, 15.940000000000005, 4, 54, 13.0, 27.799999999999997, 33.0, 54.0, 19.179133103183737, 57.425021576524735, 3.0154691695435365], "isController": false}, {"data": ["PATCH /pecas/{id}", 50, 10, 20.0, 22.0, 6, 55, 20.5, 37.49999999999999, 50.04999999999996, 55.0, 19.26040061633282, 9.986818663328197, 6.80584312403698], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 10, 25.0, 2.0], "isController": false}, {"data": ["404/Not Found", 30, 75.0, 6.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 500, 40, "404/Not Found", 30, "400/Bad Request", 10, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["DELETE /pecas/{id}", 50, 10, "404/Not Found", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["POST /pecas", 50, 10, "400/Bad Request", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /pecas/{id}", 50, 10, "404/Not Found", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["PATCH /pecas/{id}", 50, 10, "404/Not Found", 10, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
