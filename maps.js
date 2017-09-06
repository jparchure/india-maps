var width = window.innerWidth, height = window.innerHeight;
var active = d3.select(null);
var projection = d3.geoMercator();

var path = d3.geoPath()
    .projection(projection)
    .pointRadius(2);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");

d3.json("india.json", function(error, data){

  var boundary = centerZoom(data);
  var subunits = drawSubUnits(data);
  colorSubunits(subunits);
  //drawSubUnitLabels(data);
  //drawPlaces(data);
  drawOuterBoundary(data, boundary);

});

function centerZoom(data){

  var o = topojson.mesh(data, data.objects.polygons, function(a, b) { return a === b; });

  projection
      .scale(1)
      .translate([0, 0]);

  var b = path.bounds(o),
      s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

  var p = projection
      .scale(s)
      .translate(t);


  return o;

}


function clicked(d,el) {

//Check if the state was already clicked, else zoom in
if (active.node() === el) return reset();
active.classed("active", false);
active = d3.select(el).classed("active", true);

var b = path.bounds(d),
    s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    g.transition()
          .duration(750)
          .style("stroke-width", .9 / s + "px")
          .attr("transform", "translate(" + t + ")scale(" + s + ")");
          drawStateInfo([d]); //Tooltip
  }

function reset() {
  active.classed("active", false);
  active = d3.select(null);
  //Reset if the state has already been clicked
  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "");

  d3.selectAll(".subunit-label").remove();
}


function drawOuterBoundary(data, boundary){

  g.append("path")
      .datum(boundary)
      .attr("d", path)
      .attr("class", "subunit-boundary")
      .attr("fill", "none")
      .attr("stroke", "#3a403d");

}

function drawPlaces(data){

  g.append("path")
      .datum(topojson.feature(data, data.objects.places))
      .attr("d", path)
      .attr("class", "place");

  g.selectAll(".place-label")
      .data(topojson.feature(data, data.objects.places).features)
    .enter().append("text")
      .attr("class", "place-label")
      .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
      .attr("dy", ".35em")
      .attr("x", 6)
      .attr("text-anchor", "start")
      .style("font-size", ".7em")
      .style("text-shadow", "0px 0px 2px #fff")
      .text(function(d) { return d.properties.name; });

}

function drawSubUnits(data){ //draw States

  var subunits = g.selectAll(".subunit")
      .data(topojson.feature(data, data.objects.polygons).features)
    .enter().append("path")
      .attr("class", "subunit")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1px");


  return subunits;

}


function drawStateInfo(state){
  //console.log(el);
  g.selectAll(".subunit-label")
      .data(state)
    .enter().append("text")
      .attr("class", "subunit-label")
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .style("font-size", ".5em")
      .style("fill","#fffeee")
      //.style("text-shadow", "0px 0px 2px #fff")
      .style("text-transform", "uppercase")
      .text(function(d) { return d.properties.st_nm; });
}

function colorSubunits(subunits) {

  var c = d3.scaleOrdinal(d3.schemeBlues[9]);
  subunits
      //.style("fill", function(d,i){ return c(i); })
      .style("opacity", "1")
      .on("click", function(d){clicked(d,this)})
  .on("mouseover",function(d){
        //d3.select(this).style("opacity","0.6");
        drawStateInfo([d]); //Show state name on hover
      })
      .on("mouseout",function(){
        //d3.select(this).style("opacity","1");
        d3.selectAll(".subunit-label").remove();
      })
      ;

}
