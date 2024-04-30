// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true })
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  //set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;
let g_FHAngle=0;
let g_NAngle=0;
let g_headanim=false;

//Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  //Button Events (Shape Type)
  //document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
  //document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
  //document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };

  //document.getElementById('pointButton').onclick = function() { g_selectedType=POINT };
  //document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE };
  //document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE };

  document.getElementById('headanimoff').onclick = function() { g_headanim = false; };
  document.getElementById('headanimon').onclick = function() { g_headanim = true; };

  // Color Slider Events
  //document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  //document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('FHSlide').addEventListener('mousemove', function() { g_FHAngle = this.value; renderAllShapes(); });
  document.getElementById('NSlide').addEventListener('mousemove', function() { g_NAngle = this.value; renderAllShapes(); });

  // Size Slider Events
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function main() {
  
  //Set up canvas and gl variables
  setupWebGL();

  //Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  //Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  //canvas.onmousemove = click;

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000;
var g_seconds = performance.now()/1000 - g_startTime;

function tick() {

  g_seconds = performance.now()/1000 - g_startTime;
  //console.log(g_seconds);

  renderAllShapes();

  requestAnimationFrame(tick);
}


var g_shapesList = [];

//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

function click(ev) {

  // Extract the event click and return it in WebGL coordinates
  let [x, y] = convertCoordinatesEventToGL(ev);

  //Create and store the new point
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  //g_points.push([x, y]);

  //Store the color to g_colors array
  //g_colors.push(g_selectedColor.slice());

  //Store the size to g_colors array
  //g_sizes.push(g_selectedSize);

  // Store the coordinates to g_points array
  /*
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }
  */

  //Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}


// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {

  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x, y]);
}

//Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  /*
  var len = g_shapesList.length;

  for(var i = 0; i < len; i++) {

    g_shapesList[i].render();

  }
  */

  //draw a test triangle
  //drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0] );

  //draw the body cube
  var body = new Cube();
  body.color = [0.35,0.35,0.35,1.0];
  body.matrix.translate(0.1, -0.2, 0.1);
  body.matrix.rotate(-50, 4, 4, -1);
  body.matrix.scale(0.7, 0.5, 0.5);
  body.render();

  var backh = new Cube();
  backh.color = [0.45,0.45,0.45,1.0];
  backh.matrix.translate(-0.2, -0.4, -0.1);
  backh.matrix.rotate(-50, 4, 4, -1);
  backh.matrix.scale(0.5, 0.7, 0.6);
  backh.render();


  //first rotate
  var fronth = new Cube();
  fronth.color = [0.5,0.5,0.5,1.0];
  fronth.matrix.translate(-0.4, -0.35, -0.2);
  fronth.matrix.rotate(-50, 4, 4, -1);
  
  if (g_headanim) {
    fronth.matrix.rotate(20*Math.sin(g_seconds), 4, 4, -1);
  } else {
    fronth.matrix.rotate(g_FHAngle, 4, 4, -1);
  }
  
  var fhm = new Matrix4(fronth.matrix);
  fronth.matrix.scale(0.3, 0.5, 0.5);
  fronth.render();


  var nose = new Cube();
  nose.color = [0.35,0.35,0.35,1.0];
  nose.matrix = fhm;
  nose.matrix.translate(-0.3, 0, 0.13);
  nose.matrix.rotate(g_NAngle, 7, 4, -1.5);
  //nose.matrix.rotate(0, 7, 4, -1.5);
  nose.matrix.scale(0.4, 0.25, 0.25);
  nose.render();


  var tail = new Cube();
  tail.color = [0.4,0.4,0.4,1.0];
  tail.matrix.translate(0.4, 0.2, 0.4);
  tail.matrix.rotate(-50, 4, 5, 2.5);

  if (g_headanim) {
    tail.matrix.rotate(40*Math.sin(g_seconds), 4, 5, 2.5);
  }

  tail.matrix.scale(0.7, 0.15, 0.15);
  tail.render();


  var fl = new Cube();
  fl.color = [0.4,0.4,0.4,1.0];
  fl.matrix.translate(-0.25, -0.5, 0.3);
  fl.matrix.rotate(-50, 4, 4, -1);

  if (g_headanim) {
    fl.matrix.rotate(20*Math.sin(g_seconds), 4, 4, -1);
  }

  fl.matrix.scale(0.15, 0.4, 0.15);
  fl.render();

  var fr = new Cube();
  fr.color = [0.4,0.4,0.4,1.0];
  fr.matrix.translate(-0.15, -0.6, 0.2);
  fr.matrix.rotate(-50, 4, 4, -1);

  if (g_headanim) {
    fr.matrix.rotate(20*Math.sin(g_seconds), 4, 4, -1);
  }

  fr.matrix.scale(0.15, 0.4, 0.15);
  fr.render();

  var bl = new Cube();
  bl.color = [0.4,0.4,0.4,1.0];
  bl.matrix.translate(0.3, -0.2, 0.7);
  bl.matrix.rotate(-50, 4, 4, -1);

  if (g_headanim) {
    bl.matrix.rotate(20*Math.sin(g_seconds), 4, 4, -1);
  }

  bl.matrix.scale(0.15, 0.4, 0.15);
  bl.render();

  var br = new Cube();
  br.color = [0.4,0.4,0.4,1.0];
  br.matrix.translate(0.4, -0.3, 0.6);
  br.matrix.rotate(-50, 4, 4, -1);

  if (g_headanim) {
    br.matrix.rotate(20*Math.sin(g_seconds), 4, 4, -1);
  }

  br.matrix.scale(0.15, 0.4, 0.15);
  br.render();



  /*
  var leftArm = new Cube();
  leftArm.color = [1.0,1.0,0.0,1.0];
  leftArm.matrix.setTranslate(0.7, 0.0, 0.0);
  leftArm.matrix.rotate(45, 0, 0, 1);
  leftArm.matrix.scale(0.25, 0.7, 0.5);
  leftArm.render();
  

  var box = new Cube();
  box.color = [1.0,0.0,1.0,1.0];
  box.matrix.translate(0.0, 0.0, -0.5, 0.0);
  box.matrix.rotate(-30, 1, 1, 0);
  box.matrix.scale(0.5, 0.5, 0.5);
  box.render();
  */
  


  //Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

//Set the text of an HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}








