/*
TODOs

  - [X] highlight dos bits do pixel selecionado
  - [X] quando pixel selecionado, atualizar color picker c/ cor do pixel
  - [X] quando pixel selecionado, atualizar cor do pixel ao mexer nos sliders
  - [X] quando pixel selecionado, atualizar bits ao mexer nos sliders
  - [X] modo hexadecimal
  - [ ] grids aleatorios no comeco
  - [ ] fazer coluna (in|de)crementar quando linha loopar (e vice-versa) 
*/

let canvasRef

let selectedColor;
let setColorArr;
let grid;

var slidersX = {};
let slidersArr = ["red", "green", "blue"];
let colorPreview;
let colorHex;


let bitsStr = "";
let bitsP;

let hexStr = "";
let hexsP;

let highlights = {
  "redIn": '<span class="highlight_red">',
  "greenIn": '<span class="highlight_green">',
  "blueIn": '<span class="highlight_blue">',
  "out": '</span>'
};

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

  hexsP = select("#hexs");
  updateHexs();

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
      if(selector.active){
        let p = (selector.column + selector.row * 8) * 4;
        grid.loadPixels();
        grid.pixels[p + i] = selectedColor.levels[i];
        grid.updatePixels();
        updateBits();
        updateHexs();
      }
    })
    slidersX[sliderStr] = actualSlider;
  }
  
  let pixelSelectorCheckbox = select("#select_pixel");
  pixelSelectorCheckbox.input((event) => {
    selector["active"] = pixelSelectorCheckbox.checked();
    updateHexs();
    updateBits();
    if(selector.active)
      updateColor();
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
    if(selector.active){
      updateBits();
      updateHexs();
      updateColor();
    }
  });
  columnPlus.mousePressed(() => {
    selector["column"] = (selector["column"] + 1) % 8;
    columnLabel.html(selector["column"]);
    if(selector.active){
      updateBits();
      updateHexs();
      updateColor();
    }
  });
  
  rowMinus.mousePressed(() => {
    selector["row"] = (selector["row"] - 1) % 8;
    if(selector["row"] < 0)
      selector["row"] = selector["row"] + 8; 
    rowLabel.html(selector["row"]);
    if(selector.active){
      updateBits();
      updateHexs();
      updateColor();
    }
  });
  rowPlus.mousePressed(() => {
    selector["row"] = (selector["row"] + 1) % 8;
    rowLabel.html(selector["row"]);
    if(selector.active){
      updateBits();
      updateHexs();
      updateColor();
    }
  });
  
}

function draw() {
  clear();
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
    stroke(230, 220, 10);
    strokeWeight(1);
    rect(25 + step * selector.column,
         25 + step * selector.row,
         step, step);
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
  updateHexs();
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
  if(selector.active){
    let strIn = selector.column  * 27 +
        selector.row * 8 * 27;
    bitsStr = bitsStr.slice(0, strIn) + 
      highlights.redIn +
      bitsStr.slice(strIn, strIn + 8) + 
      highlights.out +
      bitsStr.slice(strIn + 8, strIn + 9) +
      highlights.greenIn +
      bitsStr.slice(strIn + 9, strIn + 17) +
      highlights.out +
      bitsStr.slice(strIn + 17, strIn + 18) +
      highlights.blueIn +
      bitsStr.slice(strIn + 18, strIn + 26) +
      highlights.out +
      bitsStr.slice(strIn + 26);
  }
  bitsP.html(bitsStr);
}

function updateHexs(){
  hexStr = "";
  grid.loadPixels();
  for(let i = 0; i < grid.pixels.length; i = i + 1){
    if((i % 4) == 3)
      continue;
    hexStr += hex(grid.pixels[i], 2) + " ";
  }
  grid.updatePixels();
  if(selector.active){
    let strIn = selector.column * 9 +
        selector.row * 8 * 9;
    let strOut = strIn + 8;
    hexStr = hexStr.slice(0, strIn) +
      highlights.redIn +
      hexStr.slice(strIn, strIn + 2) +
      highlights.out +
      hexStr.slice(strIn + 2, strIn + 3) +
      highlights.greenIn +
      hexStr.slice(strIn + 3, strIn + 5) +
      highlights.out +
      hexStr.slice(strIn + 5, strIn + 6) +
      highlights.blueIn +
      hexStr.slice(strIn + 6, strIn + 8) +
      highlights.out + 
      hexStr.slice(strIn + 8);
  }
  hexsP.html(hexStr);
}

function updateColor(){
  let pix = selector.column + selector.row * 8;
  let pixIndex = pix * 4;
  grid.loadPixels();
  let c = color(Array.from(grid.pixels.slice(pixIndex, pixIndex + 4)));
  selectedColor.setRed(c.levels[0]);
  selectedColor.setGreen(c.levels[1]);
  selectedColor.setBlue(c.levels[2]);
  grid.updatePixels();
  colorPreview.style("background", selectedColor.toString());
  colorHex.html(selectedColor.toString('#rrggbb').toUpperCase());
  slidersX.red.redSlider.value(selectedColor.levels[0]);
  slidersX.red.redLabel.html(selectedColor.levels[0]);
  slidersX.green.greenSlider.value(selectedColor.levels[1]);
  slidersX.green.greenLabel.html(selectedColor.levels[1]);
  slidersX.blue.blueSlider.value(selectedColor.levels[2]);
  slidersX.blue.blueLabel.html(selectedColor.levels[2]);
}