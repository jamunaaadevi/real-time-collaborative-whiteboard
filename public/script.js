const socket = io();

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 50;

const colorPicker = document.getElementById('colorPicker');
const widthSlider = document.getElementById('widthSlider');
const clearBtn = document.getElementById('clearBtn');

let drawing = false;
let lastX = 0;
let lastY = 0;

// Draws one line segment and (optionally) tells the server about it.
// Every segment carries its own color/width, so it never depends on
// canvas state left over from a previous stroke by someone else.
function drawSegment(segment) {
  ctx.strokeStyle = segment.color;
  ctx.lineWidth = segment.width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(segment.x0, segment.y0);
  ctx.lineTo(segment.x1, segment.y1);
  ctx.stroke();
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;

  const segment = {
    x0: lastX,
    y0: lastY,
    x1: e.offsetX,
    y1: e.offsetY,
    color: colorPicker.value,
    width: Number(widthSlider.value),
  };

  drawSegment(segment);
  socket.emit('draw', segment);

  lastX = e.offsetX;
  lastY = e.offsetY;
});

window.addEventListener('mouseup', () => (drawing = false));

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit('clear');
});

// Events coming from other users.
socket.on('draw', drawSegment);
socket.on('clear', () => ctx.clearRect(0, 0, canvas.width, canvas.height));
socket.on('history', (segments) => segments.forEach(drawSegment));
