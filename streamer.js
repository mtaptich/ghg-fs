var width = 750,
    height = 453,
    num = 3100;

var projection = d3.geo.conicConformal()
    .rotate([98, 0])
    .center([0, 38])
    .parallels([29.5, 45.5])
    .scale(1000) // Change to 300 to zoom out
    .translate([width / 2, height / 2]);

var canvas = d3.select(".g-chart").append("canvas").node(),
    offscreenCanvas = d3.select(document.createElement("canvas")).node(),
    context = canvas.getContext("2d"),
    offscreenContext = offscreenCanvas.getContext("2d"),
    ratio = (window.devicePixelRatio / context.webkitBackingStorePixelRatio) || 1;

d3.selectAll([canvas, offscreenCanvas])
    .attr("width", width * ratio)
    .attr("height", height * ratio)
    .style("width", width + "px")
    .style("height", height + "px");

var svg = d3.select(".g-chart").append("svg")
    .attr("width", width)
    .attr("height", height);

context.scale(ratio, ratio);
offscreenContext.scale(ratio, ratio);
offscreenContext.globalAlpha = .9;

var path = d3.geo.path()
    .projection(projection)
    .context(context);

var velocity = d3.scale.linear().domain([21800, 97200]).range([0.1,1])

queue()
    .defer(d3.json, "us_food.json")
    .defer(d3.json, "food_term.json")
    .await(ready);


function ready(error, us, ramps){ 
  var bg = topojson.feature(us, us.objects.us_food),
      counties = topojson.feature(us, us.objects.us_food).features,
      terms = topojson.feature(ramps, ramps.objects.food_term).features

  svg.append("g")
      .attr("class", "land")
    .selectAll("path")
      .data(counties) // us.objects.state_pol cooresponds to the original file name, state_pol.shp
    .enter().append("path")
      .attr("d", d3.geo.path().projection(projection))
      .on("mouseover", function(d){
        var rad = (2*Math.PI - +d.properties.degrees*Math.PI/180 + Math.PI/2)
        //console.log(rad*180/Math.PI, Math.cos(rad), Math.sin(rad))
      })

  svg.append("g")
    .selectAll("circle")
   .data(terms).enter()
    .append("circle")
    .attr("class", "terms")
    .attr("cx", function(d) {
           return projection(d.geometry.coordinates)[0]; // return x location on svg
           })
    .attr("cy", function(d) {
           return projection(d.geometry.coordinates)[1]; // return 7 location on svg
           })
    .attr("r", 4); 

  counties.forEach(function(d) {
    d.p = path.centroid(d);
    d.c = [0,0];
    d.rad = (2*Math.PI - +d.properties.degrees*Math.PI/180 + Math.PI/2);
    if(d.properties.meat_acc !='Null'){
      d.a = velocity(+d.properties.meat_acc);
    } else {
      d.a = 0.0;
    }
    context.fillRect(d.p[0],d.p[1],5,1)
  })

  function step() {
    context.fillStyle = "rgba(255,255,255,0.3)";
    context.fillRect(0,0,width,height);

    counties.forEach(function(d) {
      console.log(d.a)
      if(d.a > 0.4){
        context.fillStyle = "#777777";
      } else{
        context.fillStyle = "#777777";
      }
      d.c[0] += d.a*Math.cos(d.rad); // x direction, azimuth
      d.c[1] += d.a*Math.sin(d.rad)*-1; // y direction, azimuth
      context.fillRect(d.p[0]+d.c[0],d.p[1]+d.c[1],1.5,1.5);
      if (Math.abs(d.c[0]) + Math.abs(d.c[1]) >= 15) d.c = [0,0]
    });
  };

  d3.timer(step)
}