
var width = 750,
    height = 453,
    num = 3100;

var projection = d3.geo.conicConformal()
    .rotate([98, 0])
    .center([0, 38])
    .parallels([29.5, 45.5])
    .scale(1000) // Change to 300 to zoom out
    .translate([width / 2, height / 2]);

var svg = d3.select(".g-chart").append("svg")
    .attr("width", width)
    .attr("height", height);

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

context.scale(ratio, ratio);
offscreenContext.scale(ratio, ratio);
offscreenContext.globalAlpha = .9;



var path = d3.geo.path()
    .projection(projection)
    .context(context);

var particles = d3.range(num).map(function(i) {
  return [Math.round(width*Math.random()), Math.round(height*Math.random())];
}); 

//d3.timer(step);

function step() {
  context.fillStyle = "rgba(255,255,255,0.3)";
  context.fillRect(0,0,width,height);
  context.fillStyle = "rgba(0,0,0,0.5)";
  particles.forEach(function(p) {
    p[0] += Math.round(5*Math.random()-1);
    p[1] += 0;
    if (p[0] < 0) p[0] = width;
    if (p[0] > width) p[0] = 0;
    if (p[1] < 0) p[1] = height;
    if (p[1] > height) p[1] = 0;
    drawPoint(p);
  });
};

function drawPoint(p) {
  context.fillRect(p[0],p[1],5,1);
};

d3.json("food_fs.json", function(error, us) {
  bg = topojson.feature(us, us.objects.food_fs)
  var counties = topojson.feature(us, us.objects.food_fs).features

  svg.append("g")
      .attr("class", "land")
    .selectAll("path")
      .data(counties) // us.objects.state_pol cooresponds to the original file name, state_pol.shp
    .enter().append("path")
      .attr("d", d3.geo.path().projection(projection))


  counties.forEach(function(d) {
    d.p = path.centroid(d);
    d.c = path.centroid(d);
    if(d.properties.increase_a !='Null'){
      d.a = +d.properties.increase_a
    } else {
      d.a = 0.0;
    }
    context.fillRect(d.p[0],d.p[1],5,1)
  })

  function step() {
    context.fillStyle = "rgba(255,255,255,0.3)";
    context.fillRect(0,0,width,height);

    counties.forEach(function(d) {
      if(d.a > 0.3){
        context.fillStyle = "rgba(77,175,74,0.7)";
      } else{
        context.fillStyle = "rgba(228,26,28,0.7)";
      }
      d.p[0] += d.a/1.2;
      context.fillRect(d.p[0],d.p[1],3,1.5);
      if (d.p[0] >=15 + d.c[0]) d.p = path.centroid(d)
    });
  };

  d3.timer(step)


})