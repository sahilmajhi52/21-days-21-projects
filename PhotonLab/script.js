const canvas = document.getElementById("canvas");
const fileInput = document.getElementById("inputFile");
const brightnessBtn = document.getElementById("brightness");
const contrastBtn = document.getElementById("contrast");
const saturationBtn = document.getElementById("saturation");
const blurBtn = document.getElementById("blur");
const grayScaleBtn = document.getElementById("grayScale");
const sepiaBtn = document.getElementById("sepia");
const resetBtn = document.getElementById("reset");
const downloadBtn = document.getElementById("downloadBtn");

const ctx = canvas.getContext("2d");

let image = new Image();
let isSpeia = false;

const activeBtnColor = "#4896fcff";
const btnColor = "#ffdab3";

fileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];

  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

image.onload = () => {
  canvas.height = image.height;
  canvas.width = image.width;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
};

function applyBrightFilters() {
  const brightnessValue = brightnessBtn.value;
  const saturationValue = saturationBtn.value;
  const contrastValue = contrastBtn.value;
  const blurValue = blurBtn.value;
  const sepiaValue = isSpeia ? 100 : 0;
  ctx.filter = `brightness(${brightnessValue}%)saturate(${saturationValue}%)contrast(${contrastValue}%)blur(${blurValue}px)sepia(${sepiaValue}%)`;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (saturationValue == 0) {
    grayScaleBtn.style.backgroundColor = activeBtnColor;
  } else {
    grayScaleBtn.style.backgroundColor = btnColor;
  }
}

function handleReset() {
  brightnessBtn.value = 100;
  saturationBtn.value = 100;
  contrastBtn.value = 100;
  blurBtn.value = 0;
  if (isSpeia) {
    handleSepiaFilter();
  }
  applyBrightFilters();
}
function handleGreyScale() {
  saturationBtn.value = 0;
  applyBrightFilters();
}

function handleSepiaFilter() {
  isSpeia = !isSpeia;
  applyBrightFilters();
  if (isSpeia) {
    sepiaBtn.style.backgroundColor = activeBtnColor;
  } else {
    sepiaBtn.style.backgroundColor = btnColor;
  }
}

function handleDownloadBtn() {
  const imageData = canvas.toDataURL("image/png");
  const anchorTag = document.createElement("a");
  anchorTag.href = imageData;
  anchorTag.download = "Photon-lab.png";
  document.body.appendChild(anchorTag);
  anchorTag.click();
  document.body.removeChild(anchorTag);
}

brightnessBtn.addEventListener("input", applyBrightFilters);
saturationBtn.addEventListener("input", applyBrightFilters);
contrastBtn.addEventListener("input", applyBrightFilters);
blurBtn.addEventListener("input", applyBrightFilters);
resetBtn.addEventListener("click", handleReset);
grayScaleBtn.addEventListener("click", handleGreyScale);
sepiaBtn.addEventListener("click", handleSepiaFilter);
downloadBtn.addEventListener("click", handleDownloadBtn);