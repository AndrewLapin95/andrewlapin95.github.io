var dataLink = 'https://flunky.github.io/cars2017.csv'
var scenes = ['scene1', 'scene2', 'scene3'];
var sceneIdx = 0;

function getSVG(scene) {
    return d3.select(scene)
             .append('svg')
             .attr('width', 850)
             .attr('height', 450)
             .append('g')
             .attr('transform', `translate(140,20)`);
}

function getTooltip() {
    var tooltip = d3.select('body').select('.tooltip');
    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div').attr('class', 'tooltip');
    }
    return tooltip;
}

function displayTooltip(content, event) {
    getTooltip().html(content)
                .style('top',  event.pageY + 'px')
                .style('left', event.pageX + 'px')
                .style('opacity', 1);
}

function removeTooltip() {
    getTooltip().style('opacity', 0);
}

function firstScene(data) {
    var cylinders = d3.groups(data, d => d.EngineCylinders)
                      .sort((a, b) => parseInt(a[0], 10) - parseInt(b[0], 10));
    
    var meanHighwayMPG = cylinders.map(g => 
        ({
            cylinders: g[0], avgMPG: d3.mean(g[1], d => +d.AverageHighwayMPG)
        })
    );

    var meanCityMPG = cylinders.map(g => 
        ({
            cylinders: g[0], avgMPG: d3.mean(g[1], d => +d.AverageCityMPG)
        })
    );
    
    var x = d3.scaleBand()
              .padding(0.2)
              .domain(cylinders.map(g => g[0]))
              .range([0, 700]);

    var y = d3.scaleLinear()
              .domain([0, d3.max(meanHighwayMPG, d => d.avgMPG)])
              .nice()
              .range([380, 0]);
    

    var svg = getSVG('#scene1');

    svg.append('g')
       .call(d3.axisBottom(x))
       .attr('transform', `translate(0,380)`);

    svg.append('g')
       .call(d3.axisLeft(y))
       .attr('class', 'y');


    svg.append('text')
        .style('font-size', '12px')
        .style('font-style', 'italic')
        .attr('x', 450)
        .text('Point at the bars or the trend line for more info.');

    svg.append('text')
        .attr('x', 350)
        .attr('y', 425)
        .attr('text-anchor', 'middle')
        .text('Number of Engine Cylinders');

    svg.append('text')
        .text('Mean MPG')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -190)
        .attr('y', -50)
        .attr('dy', '1em');
        

    var barWidth = x.bandwidth() / 2;

    svg.selectAll('.highway-bars')
       .data(meanHighwayMPG)
       .enter()
       .append('rect')
       .attr('class', 'highway-bars')
       .attr('x', d => x(d.cylinders))
       .attr('y', d => y(d.avgMPG))
       .attr('width', barWidth)
       .attr('fill', 'steelblue')
       .attr('height', d => 380 - y(d.avgMPG))
       .on('mouseover', function(event, d) {
            displayTooltip(`Cars with ${d.cylinders} cylinders had a mean MPG of ${d.avgMPG.toFixed(1)} on highway`, event);
            d3.select(this)
              .attr('fill', '#1560bd');
        })
        .on('mouseout', function() {
            removeTooltip();
            d3.select(this)
              .attr('fill', 'steelblue');
        });

    svg.selectAll('.city-bars')
       .data(meanCityMPG)
       .enter()
       .append('rect')
       .attr('class', 'city-bars')
       .attr('x', d => x(d.cylinders) + barWidth)
       .attr('y', d => y(d.avgMPG))
       .attr('fill', 'orange')
       .attr('width', barWidth)
       .attr('height', d => 380 - y(d.avgMPG))
       .on('mouseover', function(event, d) {
            d3.select(this)
              .attr('fill', 'darkorange');
            displayTooltip(`Cars with ${d.cylinders} cylinders had a mean MPG of ${d.avgMPG.toFixed(1)} in city`, event);
        })
        .on('mouseout', function() {
            removeTooltip();
            d3.select(this)
              .attr('fill', 'orange');
        });


    svg.append('path')
        .datum(meanHighwayMPG)
        .attr('stroke', 'red')
        .attr('fill', 'none')
        .attr('stroke-width', 3)
        .attr('d', d3.line().x(d => x(d.cylinders) + barWidth).y(d => y(d.avgMPG)))
        .on('mouseover', function(event) {
            displayTooltip(`As is evident from the trend line, cars with fewer cylinders generally have higher fuel efficiency.`, event);
        })
        .on('mouseout', function() {
            removeTooltip();
        });
}

function secondScene(data) {
    var svg = getSVG('#scene2');

    var x = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.AverageHighwayMPG)])
        .nice()
        .range([0, 700]);
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.AverageCityMPG)])
        .nice()
        .range([380, 0]);

    svg.append('g')
        .call(d3.axisBottom(x))
        .attr('transform', 'translate(0,380)');

    svg.append('g')
        .call(d3.axisLeft(y))
        .attr('class', 'y');

    svg.append('text')
        .text('Point at the circles for more info.')
        .style('font-size', '12px')
        .style('font-style', 'italic')
        .attr('x', 450);

    svg.append('text')
        .text('Mean Highway MPG')
        .attr('x', 350)
        .attr('y', 425)
        .attr('text-anchor', 'middle');

    svg.append('text')
        .text('Mean City MPG')
        .attr('transform', 'rotate(-90)')
        .attr('x', -190)
        .attr('y', -50)
        .attr('dy', '1em')
        .attr('text-anchor', 'middle');

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(d.AverageHighwayMPG))
        .attr('cy', d => y(d.AverageCityMPG))
        .attr('fill', d => {
            if (d.Fuel === 'Electricity') {
                return '#FFC72C';
            }
            else if (d.Fuel === 'Gasoline') {
                return 'blue';
            }
            else if (d.Fuel === 'Diesel') {
                return 'red';
            }
            else {
                return 'orange';
            }
        })
        .attr('r', 3.5)
        .attr('opacity', 0.65)
        .on('mouseover', function(event, d) {
            if (d.Fuel === 'Electricity') {
                displayTooltip(`Electric cars consume the least fuel on average: ${d.AverageHighwayMPG} highway MPG and ${d.AverageCityMPG} city MPG.`, event);
            }
            else if (d.Fuel === 'Gasoline') {
                displayTooltip(`Gasoline engines are generally the least fuel-efficient: ${d.AverageHighwayMPG} highway MPG and ${d.AverageCityMPG} city MPG.`, event);
            }
            else if (d.Fuel === 'Diesel') {
                displayTooltip(`Diesel cars are generally more fuel-efficient compared to the gasoline ones : ${d.AverageHighwayMPG} highway MPG and ${d.AverageCityMPG} city MPG.`, event);
            }
        })
        .on('mouseout', function() {
            removeTooltip();
        });
}

function thirdScene(data) {
    var svg = getSVG('#scene3');

    var brands = d3.groups(data, d => d.Make);
    var meanHighwayMPG = brands.map(group => ({
        brand: group[0],
        avgMPG: d3.mean(group[1], d => +d.AverageHighwayMPG)
    }));

    meanHighwayMPG.sort((a, b) => parseInt(b.avgMPG, 10) - parseInt(a.avgMPG, 10));

    var x = d3.scaleLinear()
        .domain([0, d3.max(meanHighwayMPG, d => d.avgMPG)])
        .nice()
        .range([0, 600]);

    var y = d3.scaleBand()
        .domain(meanHighwayMPG.map(g => g.brand))
        .range([0, 380])
        .padding(0.2);

    svg.append('g')
        .call(d3.axisLeft(y));

    svg.append('g')
        .call(d3.axisBottom(x))
        .attr('transform', 'translate(0,380)');

    svg.append('text')
        .text('Brands are sorted descendingly from top to bottom by fuel-efficiency. Point at the bars for more info.')
        .style('font-size', '12px')
        .style('font-style', 'italic')
        .attr('x', 10);

    svg.append('text')
        .text('Mean Highway MPG')
        .attr('x', 350)
        .attr('y', 425)
        .attr('text-anchor', 'middle');

    svg.selectAll('.bar')
        .data(meanHighwayMPG)
        .enter()
        .append('rect')
        .attr('fill', 'steelblue')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => y(d.brand))
        .attr('width', d => x(d.avgMPG))
        .attr('height', y.bandwidth())
        .on('mouseover', function(event, d) {
            displayTooltip(`Brand: ${d.brand}, mean highway MPG: ${d.avgMPG}`, event);
            d3.select(this)
              .attr('fill', '#1560bd');
        })
        .on('mouseout', function() {
            removeTooltip();
            d3.select(this)
              .attr('fill', 'steelblue');
        });
}

function display(idx) {
    scenes.forEach((scene, i) => {
        d3.select(`#${scene}`).classed('current', i === idx);
    });
}

d3.csv(dataLink).then(input => {
    firstScene(input);
    secondScene(input);
    thirdScene(input);
});

d3.select('#next').on('click', () => {
    if (sceneIdx < scenes.length - 1) {
        sceneIdx++;
    }
    display(sceneIdx)
});

d3.select('#prev').on('click', () => {
    if (sceneIdx > 0) {
        sceneIdx--;
    }
    display(sceneIdx);
});

d3.select('#button1').on('click', () => {
    sceneIdx = 0;
    display(sceneIdx);
});

d3.select('#button2').on('click', () => {
    sceneIdx = 1;
    display(sceneIdx);
});

d3.select('#button3').on('click', () => {
    sceneIdx = 2;
    display(sceneIdx);
});