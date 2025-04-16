/*
TODOs

  - [ ] highlight dos bits do pixel selecionado
  - [ ] quando pixel selecionado, atualizar color picker c/ cor do pixel
  - [ ] quando pixel selecionado, atualizar cor do pixel ao mexer nos sliders
  - [ ] quando pixel selecionado, atualizar bits ao mexer nos sliders
  - [ ] modo hexadecimal
*/

let canvasRef

let selectedColor;
let grid;

let sliders = {};

let bitsStr = "";
let bitsP;

let selector = {};

function setup() {
  
  grid = createImage(8, 8);
  grid.loadPixels();
  for(let i = 0; i < grid.pixels.length; i = i + 1){
    grid.pixels[i] = 255;
  }
  grid.updatePixels();
  bitsP = select("#bits");
  updateBits();
  canvasRef = createCanvas(400, 400);
  let context = canvasRef.elt.getContext("2d");
  //context.mozImageSmoothingEnabled = false;
  //context.webkitImageSmoothingEnabled = false;
  //context.msImageSmoothingEnabled = false;
  context.imageSmoothingEnabled = false;
  let containerDiv = select('#canva_container');
  canvasRef.parent(containerDiv);

  selectedColor = color(0, 0, 0);
  setColorArr = [
    selectedColor.setRed.bind(selectedColor),
    selectedColor.setGreen.bind(selectedColor),
    selectedColor.setBlue.bind(selectedColor)
  ];
  colorPreview = select('#color_preview');
  colorHex = select('#color_hex');
  
  let slidersArr = ["red", "green", "blue"];
  for(let i = 0; i < slidersArr.length; i = i + 1){
    let actualSlider = {};
    let sliderStr = slidersArr[i];
    actualSlider[sliderStr + "Slider"] = select("#slider_" + sliderStr);
    actualSlider[sliderStr + "Label"] = select("#" + sliderStr + "_label");
    actualSlider[sliderStr + "Slider"].input((event) => {
      actualSlider[sliderStr + "Label"].html(actualSlider[sliderStr + "Slider"].value());
      setColorArr[i](actualSlider[sliderStr + "Slider"].value());
      colorPreview.style("background", selectedColor.toString());
      colorHex.html(selectedColor.toString('#rrggbb').toUpperCase());
    })
    sliders[sliderStr] = actualSlider;
  }
  
  let pixelSelectorCheckbox = select("#select_pixel");
  pixelSelectorCheckbox.input((event) => {
    selector["active"] = pixelSelectorCheckbox.checked();
  });
  
  selector["column"] = 0;
  selector["row"] = 0;

  let columnLabel = select("#selected_column");
  let rowLabel = select("#selected_row");

  let columnMinus = select("#col_minus");
  let columnPlus = select("#col_plus");
  let rowMinus = select("#row_minus");
  let rowPlus = select("#row_plus");
  
  columnMinus.mousePressed(() => {
    selector["column"] = (selector["column"] - 1) % 8;
    if(selector["column"] < 0)
      selector["column"] = selector["column"] + 8; 
    columnLabel.html(selector["column"]);
  });
  columnPlus.mousePressed(() => {
    selector["column"] = (selector["column"] + 1) % 8;
    columnLabel.html(selector["column"]);
  });
  
  rowMinus.mousePressed(() => {
    selector["row"] = (selector["row"] - 1) % 8;
    if(selector["row"] < 0)
      selector["row"] = selector["row"] + 8; 
    rowLabel.html(selector["row"]);
  });
  rowPlus.mousePressed(() => {
    selector["row"] = (selector["row"] + 1) % 8;
    rowLabel.html(selector["row"]);
  });
  
}

function draw() {
  background(220);
  noFill();
  image(grid, 25, 25, width - 50, height - 50);
  stroke(150, 150, 150);
  strokeWeight(1);
  // FIXME! make in a render once buffer! check cruzamento carrinho for ref.
  for(let i = 0; i <= 8; i = i + 1){
    let step = 25 + i * 350 / 8;
    line(step, 25, step, 375);
    line(25, step, 375, step);
  }
  if(selector.active){
    stroke(230, 50, 50);
    strokeWeight(4);
    let step = 350 / 8;
    rect(25 + step * selector.column, 25, step, 350);
    rect(25, 25 + step * selector.row, 350, step);
  }
}

function mousePressed() {
  if(mouseX < 25 || mouseX > 375 || mouseY < 25 || mouseY > 375)
    return;
  let cellSize = 350 / 8;
  let x = Math.floor((mouseX - 25) / cellSize);
  let y = Math.floor((mouseY - 25) / cellSize);
  grid.set(x, y, selectedColor);
  grid.updatePixels();
  updateBits();
}

function updateBits(){
  bitsStr = "";
  grid.loadPixels();
  for(let i = 0; i < grid.pixels.length; i = i + 1){
    if((i % 4) == 3)
      continue;
    bitsStr += Number(grid.pixels[i]).toString(2).padStart(8, "0") + " ";
  }
  grid.updatePixels();
  bitsP.html(bitsStr);
}