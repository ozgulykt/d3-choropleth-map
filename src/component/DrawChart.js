import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const width = 1200;
const height = 600;
const margin = { top: 20, right: 50, bottom: 50, left: 50 };
const innerHeight = height - margin.top - margin.bottom;
const innerWidth = width - margin.left - margin.right;

const drawChart = (education_data, county_data, props) => {
  d3.select(".map > * ").remove();

  const colorDomain = (min, max, count) => {
    const arr = [];
    const step = (max - min) / count;
    const base = min;
    for (let i = 1; i < count; i++) {
      arr.push(base + i * step);
    }
    return arr;
  }

  const bachelorsOrHigher = education_data.map(d => d.bachelorsOrHigher);
  const minPercent = d3.min(bachelorsOrHigher, d => d);
  const maxPercent = d3.max(bachelorsOrHigher, d => d);

  const svg = d3
    .select(".map")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .attr("id", "svg-map");

  const color = d3
    .scaleThreshold()
    .domain(colorDomain(minPercent, maxPercent, 9))
    .range(d3.schemePurples[9]);

  const tooltip = d3
    .select(".map")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  const path = d3.geoPath();

  const counties = svg.append("g")
    .attr("width", innerWidth)
    .attr("height", innerHeight);

  counties.selectAll("path")
    .data(topojson.feature(county_data, county_data.objects.counties).features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr(
      "data-state",
      d => education_data.filter(item => item.fips === d.id)[0].state
    )
    .attr(
      "data-education",
      d =>
        education_data.filter(item => item.fips === d.id)[0].bachelorsOrHigher
    )
    .attr(
      "data-county",
      d => education_data.filter(item => item.fips === d.id)[0].area_name
    )
    .attr("fill", d => color(education_data.filter(item => item.fips === d.id)[0].bachelorsOrHigher))
    .style("stroke", "white")
    .style("stroke-width", ".25")
    .on("mouseover", function (d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip
        .html(
          d3.select(this).attr("data-county") + ", " +
          d3.select(this).attr("data-state") + ": " +
          "%" + d3.select(this).attr("data-education")
        )
        .attr("data-education", d3.select(this).attr("data-education"))
        .style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY + 20 + "px");
    })
    .on("mouseout", (d) => {
      tooltip
        .transition()
        .duration(400)
        .style("opacity", 0);
    });

  const states = svg.append("g");
  states
    .selectAll("path")
    .data(topojson.feature(county_data, county_data.objects.states).features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "white")
    .style("stroke-width", "2")
    .style("fill", "none")
    .style("opacity", 0.5);

  const g = svg.append("g")
    .attr("transform", "translate(100, 450)");

  const legendScale = d3.scaleLinear()
    .domain([minPercent, maxPercent])
    .range([0, 300]);

  const legendXAxis = d3.axisBottom(legendScale)
    .tickValues(color.domain())
    .tickFormat(x => '%' + Math.round(x))
    .tickSize(9);

  const legend = g.append("g")
    .attr("id", "legend")
    .call(legendXAxis)
    .attr("transform", "translate(750, 130)");

  legend.selectAll("rect")
    .data(color.range().map((x) => {
      const d = color.invertExtent(x);
      if (d[0] == null) d[0] = legendScale.domain()[0]
      if (d[1] == null) d[1] = legendScale.domain()[1]
      return d;
    }))
    .enter()
    .append("rect")
    .attr("fill", function (d) { return color(d[0]) })
    .attr("x", function (d) { return legendScale(d[0]) })
    .attr("y", -10)
    .attr("height", 15)
    .attr("width", 37);

  svg.append("text")
    .attr("id", "title")
    .attr("x", width / 2)
    .attr("y", (margin.top))
    .attr("text-anchor", "middle")
    .attr("font-size", "30")
    .text("United States Educational Attainment");

  svg.append("text")
    .attr("id", "description")
    .attr("x", width / 2)
    .attr("y", (margin.top + 20))
    .attr("text-anchor", "middle")
    .attr("font-size", "15")
    .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)");

};

export default drawChart;