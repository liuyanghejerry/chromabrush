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