const monthMap = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
  };

let selectedStore = 1;
let selectedYear = 2025;
let selectedMonth = "04";
let sortby = "Sales"
let monthlySalesChartInstance = null;
let categorySalesChartInstance = null;
let doughnutChart;


// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard JS is now running!");

    document.getElementById("storeDropDown").addEventListener("change", (e) => {
        storeChanged(e.target.value);
    });

    document.getElementById("yearDropDown").addEventListener("change", (e) => {
        yearChanged(e.target.value);
    });

    document.getElementById("monthDropDown").addEventListener("change", (e) => {
        monthChanged(e.target.value);
    });

    document.getElementById("sortTeamBy").addEventListener("change", (e) => {
        sortbyChanged(e.target.value);
    });

    document.getElementById("modal").addEventListener("click", (e) => {
        if (e.target.id === "modal") {
          document.getElementById("modal").style.display = "none";
        }
      });

    changeFiltersAndDashboard(selectedStore, selectedYear, selectedMonth, sortby);
    

});

function changeFiltersAndDashboard(store, year, month) {
    selectedStore = store;
    selectedYear = year;
    selectedMonth = month;

    fetch('/api/stores').then(res => res.json()).then(stores => {
        populateStoreDropdown(stores, store)
    });

    fetch(`/api/years?store=${store}`).then(res => res.json()).then(years => {
        const yearList = years.map(obj => obj.years);
        const yearToUse = yearList.includes(year) ? year : yearList[0]
        selectedYear = yearToUse

        populateYearDropdown(yearList, yearToUse);

        return fetch(`/api/months?store=${store}&year=${yearToUse}`);
    })
        .then(res => res.json()).then(months => {
            const monthList = months.map(obj => obj.months);
            const monthToUse = monthList.includes(month) ? month : monthList[0];
            selectedMonth = monthToUse;

            populateMonthDropdown(monthList, monthToUse);

            updateDashboard(selectedStore, selectedYear, selectedMonth, sortby);
        });

}
function populateStoreDropdown(data, defualtStore) {
    const selector = d3.select("#storeDropDown")
    selector.selectAll("option").remove();
    data.forEach((options) => {
        selector.append("option")
            .text(options.store).attr("value", options.store)
            .property("selected", options.store == defualtStore);
    })
}
function populateYearDropdown(data, defualtYear) {
    const selector = d3.select("#yearDropDown")
    selector.selectAll("option").remove();
    data.forEach((options) => {
        selector.append("option")
            .text(options).attr("value", options)
            .property("selected", options == defualtYear)
    })
}
function populateMonthDropdown(data, defualtMonth) {
    const selector = d3.select("#monthDropDown")
    selector.selectAll("option").remove();
    data.forEach((options) => {
        selector.append("option")
            .text(monthMap[options]).attr("value", options)
            .property("selected", options == defualtMonth)
    })
}
function storeChanged(newStore) {
    selectedStore = newStore;
    changeFiltersAndDashboard(newStore, selectedYear, selectedMonth);
}
function yearChanged(newYear) {
    selectedYear = newYear;
    fetch(`/api/months?store=${selectedStore}&year=${newYear}`)
        .then(res => res.json())
        .then(months => {
            const monthList = months.map(obj => obj.months);
            const monthToUse = monthList[0];
            selectedMonth = monthToUse;
            populateMonthDropdown(monthList, monthToUse);
            updateDashboard(selectedStore, selectedYear, selectedMonth, sortby);
        });
}
function monthChanged(newMonth) {
    selectedMonth = newMonth;
    updateDashboard(selectedStore, selectedYear, selectedMonth, sortby);
}
function sortbyChanged(newSortby){
    sortby = newSortby
    updateDashboard(selectedStore, selectedYear, selectedMonth, sortby)
}


function updateDashboard(selectedStore, selectedYear, selectedMonth, sortby) {
    console.log(`selected store is :${selectedStore}`)
    console.log(`selected year is :${selectedYear}`)
    console.log(`selected month is :${selectedMonth}`)

    //Call KPI Metrics Display Function
    displayKpiMetrics(selectedStore, selectedYear, selectedMonth);

     // Line Chart function
    plotLineChart(selectedStore, selectedYear, selectedMonth);

    plotMonthlyChart(selectedStore, selectedYear);

    displayTopTeamMembers(selectedStore, selectedYear, selectedMonth, sortby);

    // Top Clients Table function
    topClientsData(selectedStore, selectedYear, selectedMonth);

    plotSalesbyCategory(selectedStore, selectedYear, selectedMonth);

    // Top Influencing Channel
    displayDoughnutChart(selectedStore, selectedYear, selectedMonth);

    teamMemberRiskReport(selectedMonth, selectedYear);
}
//KIP Metrics Display   
function displayKpiMetrics(selectedStore, selectedYear, selectedMonth){
    fetch(`/api/kpis?store=${selectedStore}&year=${selectedYear}&month=${selectedMonth}`)
        .then(res => res.json())
        .then(kpiMetrics => {
            console.log("fetched KPI data successfully");
            console.log(kpiMetrics)
            const totalSales = `$${kpiMetrics.current.totalSales.toLocaleString(undefined,{
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2  
                                })}`;
            const numberOfSales = kpiMetrics.current.numSales.toLocaleString();
            const averageSales =  `$${kpiMetrics.current.avgSales.toLocaleString(undefined,{
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                                })}`;
            const kpichanges = kpiMetrics.change;
            updateKpichanges(kpichanges);

            document.getElementById("salesAmount").textContent = totalSales;
            document.getElementById("numberSales").textContent = numberOfSales;
            document.getElementById("averageSales").textContent = averageSales;
            
        })
        .catch(error => console.error('Error fetching KPI data:', error));
};

function updateKpichanges(changes){
    const salesChange = document.getElementById("salesChange");
    const numSalesChange = document.getElementById("numSalesChange");
    const avgSalesChange = document.getElementById("avgSalesChange");

    function updateChangeElement(element, percentChange) {
        if (percentChange === null || isNaN(percentChange)) {
          element.innerText = "No data from last year";
          element.className = "kpi-change none";
        } else {
          const arrow = percentChange >= 0 ? "↑" : "↓";
          const className = percentChange >= 0 ? "kpi-change up" : "kpi-change down";
          element.innerText = `${arrow} ${Math.abs(percentChange).toFixed(1)}% from last year`;
          element.className = className;
        }
      }

    updateChangeElement(salesChange, changes.totalSales);
    updateChangeElement(numSalesChange, changes.numSales);
    updateChangeElement(avgSalesChange, changes.salesPerCustomer);
}
function plotLineChart(selectedStore, selectedYear, selectedMonth) {
    fetch(`/api/daily-sales?store=${selectedStore}&year=${selectedYear}&month=${selectedMonth}`)
        .then(res => res.json())
        .then(dailySales => {
            const days = dailySales.map(sale => sale.Day);
            const sales = dailySales.map(sale => sale.DailySales);
            const teamMembers = dailySales.map(sale => sale.TeamMembersWorked);

            let linechart = [{
                x: days,
                y: sales,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'Daily Sales',
                line: { shape: 'spline',width: 3},
                marker: {size: 6, color: '#636EFA'},
                hovertemplate: 'Day: %{x}<br>Sales: $%{y}<extra></extra>'
            },
            {
                x: days,
                y: teamMembers,
                mode: 'lines+markers',
                type: 'scatter',
                name: 'Team Members',
                line: { shape: 'spline', width: 3, dash: 'dot' },
                marker: { size: 6, color: '#EF553B' },
                yaxis: 'y2',
                hovertemplate: 'Day: %{x}<br>Team Members: %{y}<extra></extra>'
            }
             ];
            
            let linechartlayout = {
                title: {text: 'Daily Sales Trend ($) and Team Members',
                        font: {size: 20, color: '#333'},
                        x: 0.05},
                width: 500,
                height: 400,
                margin: { t: 60, b: 50, l: 60, r: 60 },
                xaxis: {
                    title: 'Day',
                    titlefont: { size: 14 },
                    tickfont: { size: 12 },
                    gridcolor: '#eee',
                    zeroline: false
                },
                yaxis: {
                    titlefont: { size: 14 },
                    tickfont: { size: 12 },
                    gridcolor: '#eee',
                    zeroline: false
                },
                yaxis2: {
                    overlaying: 'y',
                    side: 'right',
                    showgrid: false,
                    tickfont: { size: 12, color: '#EF553B' },
                    titlefont: { size: 14, color: '#EF553B' }
                },
                legend: {
                    orientation: 'h',
                    x: 0.5,
                    xanchor: 'center',
                    y: -0.2
                },
                plot_bgcolor: '#fff',
                paper_bgcolor: '#fff',
                font: {family: 'Arial, sans-serif',
                        color: '#333'
                }
            };
            
            Plotly.newPlot("dailySalesChart", linechart, linechartlayout, { responsive: true });
        })
        .catch(error => console.error('Error fetching daily sales:', error));
}

function plotMonthlyChart(selectedStore, selectedYear) {
    fetch(`/api/monthly-sales?store=${selectedStore}&year=${selectedYear}`)
        .then(res => res.json())
        .then(monthlySales =>{
            console.log("fetched monthly sales data successfully");
            const labels = monthlySales.map(month => monthMap[month.Month]);
            const data = monthlySales.map(sales => sales.MonthlySales);
    
            const config = {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Monthly Sales ($)',
                        data: data,
                        backgroundColor: 'rgba(99, 132, 255, 0.7)',
                        borderRadius: 6,  
                        barThickness: 28, 
                        maxBarThickness: 30
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: { top: 20, right: 20, left: 20, bottom: 20 }
                    },
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Monthly Sales Trend ($)',
                            align:'start',
                            font: { size: 20,
                                    weight: 'normal',
                                    family: 'Arial, sans-serif'
                             },
                            color: '#333',
                            padding: {bottom: 20 }
                        },
                        tooltip: {
                            backgroundColor: '#333',
                            titleFont: { size: 14 },
                            bodyFont: { size: 12 },
                            callbacks: {
                                label: ctx => `Sales: $${ctx.raw.toLocaleString()}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Month',
                                font: { size: 14 },
                                color: '#555'
                            },
                            ticks: {
                                font: { size: 12 },
                                color: '#333'
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: false 
                            },
                            ticks: {
                                font: { size: 12 },
                                color: '#333',
                                callback: value => `$${value.toLocaleString()}`
                            },
                            grid: {
                                color: '#eee',
                                borderDash: [4, 4]
                            }
                        }
                    }
                }
            };

            if (monthlySalesChartInstance) {
                monthlySalesChartInstance.destroy();
            }

            const barchart = document.getElementById('monthlySalesChart').getContext('2d');
            monthlySalesChartInstance = new Chart(barchart, config);
        })
        .catch(error => console.error('Error fetching monthly data sales:', error));

};

function displayTopTeamMembers(selectedStore, selectedYear, selectedMonth, sortby) {
    fetch(`/api/top-team-members?store=${selectedStore}&year=${selectedYear}&month=${selectedMonth}&sort=${sortby}`)
        .then(res => res.json())
        .then(members => {
            console.log("fetched team members data successfully");

            const topMembersBox = document.getElementById("topMembers");
            topMembersBox.innerHTML = "";

            const header = document.createElement("div");
            header.classList.add("team-member", "team-header");
            header.innerHTML = `
                <span class="member-name"><strong>Name</strong></span>
                <span class="member-sales"><strong>Sales</strong></span>
                <span class="member-services"><strong>Services</strong></span>
                `;
            topMembersBox.appendChild(header);

            members.forEach(member => {
                const row = document.createElement("div");
                row.classList.add('team-member');
                row.innerHTML =`
                    <span class="member-name">${member.name}</span>
                    <span clss="member-sales">$${member.Sales.toLocaleString()}</span>
                    <span clss="member-services">${member.Services.toLocaleString()}</span>`;
                topMembersBox.appendChild(row);    
            });

        })
        .catch(error => console.error('Error fetching team members data sales:', error));
}

function topClientsData(selectedStore, selectedYear, selectedMonth){
    fetch(`/api/top-clients?store=${selectedStore}&year=${selectedYear}&month=${selectedMonth}`)
        .then(res => res.json())
        .then(topClients => {
            console.log("Fetched top clients data successfully");

            const topClientsBox = document.getElementById("clientsBox");
            topClientsBox.innerHTML ="";
            const header = document.createElement("div");
            header.classList.add("client-table", "client-header");
            header.innerHTML = `
                <span class="client-name"><strong>Name</strong></span>
                <span class="client-sales"><strong>Sales</strong></span>
                `;
            topClientsBox.appendChild(header);
                
            topClients.forEach(client => {
                const row = document.createElement("div");
                row.classList.add('client-table');
                row.innerHTML =`
                    <span class="client-name">${client.Client}</span>
                    <span class="client-sales">$${client.MonthlySales.toLocaleString()}</span>`;

                row.addEventListener("click", () => {
                    showClientHistory(client.Client); // pass name to the function
                    });
                topClientsBox.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching top clients data:', error));
}
function showClientHistory(clientName){
    fetch(`/api/client-history?client=${encodeURIComponent(clientName)}`)
        .then(res => res.json())
        .then(visits => {
        if (visits.length === 0) {
            showModal(`${clientName} has no visit history.`);
            return;
        }

        let content = `<h4 style="text-align: center;">Visit History for ${clientName}</h4><ul>`;
        visits.forEach(visit=>{
            content += `
                    <li style="display: flex; justify-content: space-between;">
                        <span class="visit-Date">${visit.Date}</span>
                        <span class="visit-teamMember">${visit.teamMember}</span>
                        <span class="visit-Service">${visit.Service}</span>
                        <span class="visit-Sales">$${visit.sales.toFixed(2)}</span>
                    </li>`;
        });
        content += '</ul';

        showModal(content);

    });  

}
function showModal(html) {
    document.getElementById("modalContent").innerHTML = html;
    document.getElementById("modal").style.display = "block";
  }

function plotSalesbyCategory(selectedStore, selectedYear, selectedMonth){
    fetch(`/api/sales-by-category?store=${selectedStore}&year=${selectedYear}&month=${selectedMonth}`)
    .then(res => res.json())
    .then(categorySales=> {
       console.log("fetched sales-by-category data successfully");
       console.log(categorySales)
       const categories = categorySales.map(cat => cat.Category);
       const sales = categorySales.map(sal => sal.MonthlySales);

       const config = {
           type : "bar",
           data: {
               labels: categories,
               datasets: [{
                   label: 'Sales by Category ($)',
                   data: sales,
                   backgroundColor: 'rgba(99,132,255,0.7)',
                   borderRadius: 6,
                   barThickness: 28,
                   maxBarThickness: 30
               }]
           },
           options: {
               indexAxis: 'y',
               responsive: true,
               maintainAspectRatio: false,
               layout: {
                   padding: { top:20, right: 20, left: 20, bottom: 20 }
               },
               plugins: {
                   legend: { display: false },
                   title: {
                       display: true,
                       text: 'Sales by Category ($)',
                       align: 'start',
                       font: { size: 20, weight: 'normal', family: 'Arial, sans-serif'},
                       color: '#333',
                       padding: { bottom: 20 }
                   },
                   tooltip: {
                       backgroundColor: '#333',
                       titleFont: { size: 14 },
                       bodyFont: { size: 12 },
                       callbacks: {
                           label: ctx => `Sales: ${ctx.raw.toLocaleString()}`
                       }
                   }
               },
               scales: {
                   x: {
                       beginAtZero: true,
                       title: {
                           display: true,
                           text: 'Sales ($)',
                           font: { size: 14 },
                           color: '#555'
                       },
                       ticks: {
                           font: { size: 12 },
                           color: '#333',
                           callback: value => `${value.toLocaleString()}`
                       },
                       grid: {
                           color: '#eee',
                           borderDash: [4,4]
                       }
                   },
                   y: {
                       title: {
                           display: true,
                           text: 'Category',
                           font: { size: 14 },
                           color: '#555'
                       },
                       ticks: {
                           font: { size: 12 },
                           color: '#333'
                       },
                       grid: {
                           display: false
                       }
                   }
               }
           }
       };
            if(categorySalesChartInstance) {
                categorySalesChartInstance.destroy();
            }

        const barchart = document.getElementById('CategorySalesChart').getContext('2d');
        categorySalesChartInstance = new Chart(barchart, config);
    })
    .catch(error => console.error('Error fetching sales-by-category data:', error));
}




async function displayDoughnutChart(selectedStore, selectedYear, selectedMonth) {
    try{
        const response = await fetch(`/api/sales-by-channel?store=${selectedStore}&year=${selectedYear}&month=${selectedMonth}`)

        if(!response.ok){
            throw new Error('network response was not ok: ${response.statusText}');
        }
        const topChannels = await response.json();

        console.log("Fetched top channels data successfully");
        console.log(topChannels);

        const labels = topChannels.map(data => data.Channel);
        const customer_count = topChannels.map(data => data['Customer Count']);
        const totalCustomers = customer_count.reduce((acc, count) => acc + count, 0);

        const ctx = document.getElementById('channelDoughnutChart').getContext('2d');

        if (doughnutChart) {
            doughnutChart.destroy();
        }
        doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales by Channel',
                    data: customer_count,
                    backgroundColor: [
                        'rgba(135, 206, 250, 0.6)',
                        'rgba(135, 206, 235, 0.6)',
                        'rgba(30, 144, 255, 0.6)',
                        'rgba(100, 149, 237, 0.6)',
                        'rgba(0, 0, 205, 0.6)',
                        'rgba(0, 0, 139, 0.6)'   
                    ],
                    borderColor: 'rgba(21, 20, 20, 0.42)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        // text: 'Channels Influence in Sales'
                    },
                    datalabels: {
                        formatter: (value, context) => {
                            const total = context.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                            const percentage = ((value / total) * 100).toFixed(2) + '%';
                            return percentage;
                        },
                        color: '#fff',
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }catch (error){
        console.error('Error fetching channel data:', error);
    }
}
function teamMemberRiskReport(selectedMonth, selectedYear){
    fetch(`/api/team-risk?year=${selectedYear}&month=${selectedMonth}`)
    .then(res => res.json())
    .then(report => {
        console.log("report")
        console.log(report)
        const riskTable = document.getElementById("teamRiskTable");
        riskTable.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Retention</th>
            <th>Drop %</th>
            <th>Mani/Pedi Ratio</th>
            <th>Volume</th>
            <th>Score</th>
            <th>Risk</th>
        </tr>
        `;

    report.forEach(member => {
      const row = document.createElement("tr");
      const riskColor = member.riskLevel === "High" ? "red" : member.riskLevel === "Medium" ? "orange" : "green";

        row.innerHTML = `
            <td>${member.teamMember}</td>
            <td>${member.retentionRatio}</td>
            <td>${member.monthlyDrop}%</td>
            <td>${member.maniPediRatio}%</td>
            <td>${member.avgMonthlySalesVolume}</td>
            <td>${member.riskScore}</td>
            <td style="color:${riskColor}">${member.riskLevel}</td>
        `;
        riskTable.appendChild(row);
    });
  });
}