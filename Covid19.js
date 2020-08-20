const url = "https://d3js.org/us-10m.v1.json"
const file = "covid.csv"
let casesByStates = {}
let deathByStates = {}
let recoveredByStates = {}
let mapIdToStates = {}
let myBarChart

Promise.all([d3.csv(file), d3.json(url)]).then(drawUSMap)

d3.csv('sum_result.csv').then(trend)
d3.csv('sex_age_demographic.csv').then(drawDoughnut)
d3.csv('sex_age_demographic.csv').then(drawBarChart)

function updateBar(statesId) {
    const data = {
        datasets: [{
            label: mapIdToStates[statesId],
            data: [casesByStates[statesId], deathByStates[statesId], recoveredByStates[statesId]],
            backgroundColor: 'rgb(255,165,0)',
        }],
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Cases',
            'Deaths',
            'Recovered'
        ]
    };
    myBarChart.data = data
    myBarChart.update()
}

function drawBar() {
    const data = {
        datasets: [{
            label: 'All States',
            data: [casesByStates[100], deathByStates[100], recoveredByStates[100]],
            backgroundColor: 'rgb(230,149,0)',

        }],
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Cases',
            'Deaths',
            'Recovered'
        ]
    };
    myBarChart = new Chart("statesDetail", {
        type: 'bar',
        data: data,
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    barPercentage: 0.4
                }]
            },
            hover: {
                animationDuration: 0
            },
            animation: {
                duration: 1,
                onComplete: function () {
                    const chartInstance = this.chart,
                        ctx = chartInstance.ctx;
                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function (dataset, i) {
                        const meta = chartInstance.controller.getDatasetMeta(i);
                        meta.data.forEach(function (bar, index) {
                            const data = dataset.data[index];
                            ctx.fillText(data, bar._model.x, bar._model.y - 5);
                        });
                    });
                }
            }
        }
    });
}

// legend()

function drawUSMap(d) {
    const svg = d3.select("#map");
    svg.attr("width", 960).attr("height", 700)
    const path = d3.geoPath();
    const data = d[0]
    const us = d[1]
    const colorScale = d3.scaleThreshold()
        .domain([5000, 8000, 11000, 14000, 17000, 20000, 23000, 26000])
        .range(d3.schemeOranges[9]);
    const border = ({top: 20, bottom: 20, left: 60, right: 60})
    data.forEach(function (d) {
        casesByStates[d.Id] = +d.Confirmed
        deathByStates[d.Id] = +d.Deaths
        recoveredByStates[d.Id] = +d.Recovered
        mapIdToStates[d.Id] = +d.States
    })

    let mouseClick = (d) => updateBar(d.id)

    // draw state borders
    svg.append("path")
        .attr("class", "state-borders")
        .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) {
            return a !== b;
        })));

    // draw states, add color, interaction
    svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr('text', (d) => d.id)
        .attr('fill', (d) => colorScale(casesByStates[d.id]))
        .on("click", mouseClick)
    drawBar()
}

function trend(d) {
    let confirmedArr = []
    let deathsArr = []
    let recoveredArr = []
    let dateArr = []
    d.map((value,index)=>{
        confirmedArr.push(value.Confirmed)
        deathsArr.push(value.Deaths)
        recoveredArr.push(value.Recovered)
        dateArr.push(value.Date)
    })

    const data = {
        labels: dateArr,
        datasets: [
            {
                label: "Confirmed",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: confirmedArr
            },
            {
                label: "Deaths",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: deathsArr
            },
            {
                label: "Recovered",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: recoveredArr
            }
        ]
    };
    // const ctx = document.getElementById("trend").getContext("2d");
    const options = { };
    const myLineChart = new Chart("trend", {
        type: 'line',
        data: data,
        options: options
    });


}

function drawDoughnut(d) {
    const result = d.filter(it => it.AgeGroup === "All Ages")[0]
    const female = parseFloat(result.Female.replace(',', ''))
    const male = parseFloat(result.Male.replace(',', ''))
    const options = {}
    const data = {
        datasets: [{
            data: [female, male],
            backgroundColor: ['rgb(23,207,115)', 'rgb(43,205,236)']
        }],
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Female',
            'Male'
        ]
    };
    const myDoughnutChart = new Chart("sex", {
        type: "doughnut",
        data: data,
        options: options
    });
}

function drawBarChart(data){
    const margin = { top: 10, right: 30, bottom: 60, left: 100 },
        width = 600 - margin.left - margin.right,
        height = 440 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3
        .select("#age")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const subgroups = data.columns.slice(2,4);

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = d3
        .map(data, function (d) {
            return d.AgeGroup;
        })
        .keys();

    // Add X axis
    const x = d3.scaleBand().domain(groups).range([0, width]).padding([0.2]);
    svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0));

    svg
        .append("text")
        .attr(
            "transform",
            "translate(" + width / 2 + " ," + (height + margin.top + 20) + ")"
        )
        .style("text-anchor", "middle")
        .text("AgeGroup");

    // Add Y axis
    const y = d3.scaleLinear().domain([0, 22000]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("death cases");

    // Another scale for subgroup position?
    const xSubgroup = d3
        .scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05]);

    // color palette = one color per subgroup
    const color = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(["#377eb8", "#e41a1c"]);

    // Show the bars
    svg
        .append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function (d) {
            return "translate(" + x(d.AgeGroup) + ",0)";
        })
        .selectAll("rect")
        .data(function (d) {
            return subgroups.map(function (key) {
                return { key: key, value: d[key] };
            });
        })
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return xSubgroup(d.key);
        })
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .attr("fill", function (d) {
            return color(d.key);
        });
    const legend = svg
        .selectAll(".legend")
        .data(subgroups)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend
        .append("rect")
        .attr("x", 200)
        .attr("y", 9)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend
        .append("text")
        .attr("x", 280)
        .attr("y", 18)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d) {
            return d.slice();
        });

}

// function drawBarChart(data) {
//     let femaleArr = []
//     let maleArr = []
//     let labelArr = []
//     data.map((value, index) => {
//         labelArr.push(value.AgeGroup)
//         femaleArr.push(parseFloat(value.Female.replace(',', '')))
//         maleArr.push(parseFloat(value.Male.replace(',', '')))
//     })
//     const option = {
//         scales: {
//             yAxes: [{
//                 ticks: {
//                     beginAtZero:true
//                 }
//             }],
//         }
//     }
//     const drawData = {
//         labels: labelArr,
//         datasets: [{
//             backgroundColor:'rgb(23,207,115)',
//             label: "Female",
//             data: femaleArr
//         }, {
//             backgroundColor: 'rgb(43,205,236)',
//             label: "Male",
//             data: maleArr
//         }]
//     }
//     const myBarChart = new Chart("age", {
//         type: "bar",
//         data: drawData,
//         options: option
//     })
// }
