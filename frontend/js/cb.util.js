/**
 * Copyright 2010 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var cb = cb || {};

cb.util = {};

cb.util.fillCanvas = function(canvas, color) {
  var context = canvas.getContext('2d');    
  context.beginPath();
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
};

cb.util.drawGrid = function(canvas, step, color) {
  var context = canvas.getContext('2d');
  console.log(canvas.width, canvas.height);
  for (var x = 0.5; x <= canvas.width; x += step) {
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
  }
  for (var y = 0.5; y <= canvas.height; y += step) {
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
  }
  context.strokeStyle = color;
  context.stroke();
  context.beginPath();
};

cb.util.paintPixel = function(canvas, x, y, pixel_size, color) {
  var block_x = Math.floor(x / pixel_size);
  var block_y = Math.floor(y / pixel_size);
  var context = canvas.getContext('2d');    
  context.beginPath();
  context.fillStyle = color;
  context.fillRect(Math.round(block_x * pixel_size), 
                   Math.round(block_y * pixel_size), 
                   pixel_size, 
                   pixel_size);
};

cb.util.paintMarker = function(canvas, x, y, pixel_size, color) {
  var bx = Math.floor(x / pixel_size) * pixel_size;
  var by = Math.floor(y / pixel_size) * pixel_size;
  var context = canvas.getContext('2d');    
  context.beginPath();
  context.strokeStyle = color;
  context.moveTo(bx, by);
  context.lineTo(bx + pixel_size - 1, by + pixel_size - 1);
  context.moveTo(bx + pixel_size - 1, by);
  context.lineTo(bx, by + pixel_size - 1);
  context.stroke();
};

cb.util.clearLayer = function(canvas) {
  var context = canvas.getContext('2d');    
  context.clearRect(0, 0, canvas.width, canvas.height);
}

cb.util.paintToolLine = function(canvas, x0, y0, x1, y1, pixel_size, color) {
  var start_x = Math.floor(x0 / pixel_size) * pixel_size + pixel_size / 2.0;
  var start_y = Math.floor(y0 / pixel_size) * pixel_size + pixel_size / 2.0;
  var end_x = Math.floor(x1 / pixel_size) * pixel_size + pixel_size / 2.0;
  var end_y = Math.floor(y1 / pixel_size) * pixel_size + pixel_size / 2.0;

  var context = canvas.getContext('2d');    
  context.beginPath();
  context.strokeStyle = color;
  context.moveTo(start_x, start_y);
  context.lineTo(end_x, end_y);
  context.stroke();
}

cb.util.erasePixel = function(canvas, x, y, pixel_size, color) {
  var block_x = Math.floor(x / pixel_size);
  var block_y = Math.floor(y / pixel_size);
  var context = canvas.getContext('2d');    
  context.beginPath();
  context.clearRect(Math.round(block_x * pixel_size), 
                    Math.round(block_y * pixel_size), 
                    pixel_size, 
                    pixel_size);
};

cb.util.paintLine = function(canvas, x0, y0, x1, y1, pixel_size, color) {
  var delta_x = x1 >= x0 ? 1 : -1;
  var delta_y = y1 >= y0 ? 1 : -1;
  var distance_x = (x1 - x0) * delta_x;
  var distance_y = (y1 - y0) * delta_y;
  if (distance_x > distance_y) {
    var slope = distance_y / distance_x;
    for (var i = 0; i < distance_x; i++) {
      cb.util.paintPixel(canvas,
                         x0 + delta_x * i,
                         y0 + Math.floor(slope * delta_y * i),
                         pixel_size, color);
    }
  } else {
    var slope = distance_x / distance_y;
    for (var i = 0; i < distance_y; i++) {
      cb.util.paintPixel(canvas,
                         x0 + Math.floor(slope * delta_x * i),
                         y0 + delta_y * i,
                         pixel_size, color);
    }
  }
  cb.util.paintPixel(canvas, x1, y1, pixel_size, color);
};
