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

cb.Layer = Class.extend({
  init: function(width, height, zindex) {
    this.canvas = $('<canvas></canvas>');
    this.width = width;
    this.height = height;
    this.canvas.attr('width', width)
               .attr('height', height)
               .css('position', 'absolute')
               .css('left', '0')
               .css('top', '0')
               .css('z-index', zindex);
  },
  clear: function() {
    var context = this.getContext();
    context.clearRect(0, 0, this.width, this.height);
  },
  erasePixel: function(x, y, pixel_size) {
    var block_x = Math.floor(x / pixel_size);
    var block_y = Math.floor(y / pixel_size);
    var context = this.getContext();
    context.beginPath();
    context.clearRect(
        Math.round(block_x * pixel_size), 
        Math.round(block_y * pixel_size), 
        pixel_size, 
        pixel_size);
  },
  fill: function(color) {
    var context = this.getContext();
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(0, 0, this.width, this.height);
  },
  getCanvas: function() {
    return this.canvas.get(0);
  },
  getContext: function() {
    return this.canvas.get(0).getContext('2d');
  },
  paintFill: function(x, y, pixel_size, color) {
    var x0 = Math.floor(x / pixel_size);
    var y0 = Math.floor(y / pixel_size);
    var context = this.getContext();
    var stack = [x0, y0];
    var myself = this;

    // Read the image pixels into memory array and prepare a function for
    // accessing that array.
    var image = context.getImageData(0, 0, this.width, this.height);
    var pixel = function(bx, by) {
      // Read the color of the specified pixel.
      var x = bx * pixel_size;
      var y = by * pixel_size;
      var p = (x + y * myself.width) * 4;
      return [
        image.data[p],
        image.data[p + 1],
        image.data[p + 2],
        image.data[p + 3]];
    };

    // Remember the first pixel color because that's the color of the pixels we
    // fill.
    var seed_color = pixel(x0, y0);
    var is_open = function(x, y) {
      var c = pixel(x, y);
      return c[0] == seed_color[0] &&
             c[1] == seed_color[1] &&
             c[2] == seed_color[2] &&
             c[3] == seed_color[3];
    };

    // Set the pixel color and at the same time push the pixels above and below
    // to the stack.
    var set_pixel = function(bx, by) {
      // Set the pixel color to both the in memory image and the rendering
      // surface.
      var x = bx * pixel_size;
      var y = by * pixel_size;
      var p = (x + y * myself.width) * 4;
      // We just need to set the color to something other than seed_color;
      image.data[p] = seed_color[0] ^ 0x01;
      myself.paintPixel(x, y, pixel_size, color);

      // Later we need to check the scanlines above and blow this line.
      if (by > 0) {
        stack.push(bx);
        stack.push(by - 1);
      }
      if (by + 1 < myself.height / pixel_size) {
        stack.push(bx);
        stack.push(by + 1);
      }
    };

    // Fill the pixels to left and right as much as possible.
    var fillLine = function(x, y) {
      // Check if the seed pixel is still open.
      if (x < 0 || x >= myself.width || y < 0 || y >= myself.height ||
          !is_open(x, y)) {
        return;
      }

      // Extend the line to left.
      for (var x_min = x; x_min >= 0 && is_open(x_min, y); x_min--) {
        set_pixel(x_min, y);
      }

      // Extend the line to right.
      if (x + 1 < myself.width) {
        // Skip the first pixel because it's already colored.
        for (var x_max = x + 1;
             x_max < myself.width / pixel_size && is_open(x_max, y);
             x_max++) {
          set_pixel(x_max, y);
        }
      }
    };

    // Repeat until we finish all the items in the stack.
    while (stack.length > 0) {
      // We pushed in x, y order, need to pop y, x.
      var y = stack.pop();
      var x = stack.pop();
      fillLine(x, y);
    }
  },
  paintGrid: function(step, color) {
    var context = this.getContext();
    console.log(this.width, this.height);
    for (var x = 0.5; x <= this.width; x += step) {
      context.moveTo(x, 0);
      context.lineTo(x, this.height);
    }
    for (var y = 0.5; y <= this.height; y += step) {
      context.moveTo(0, y);
      context.lineTo(this.width, y);
    }
    context.strokeStyle = color;
    context.stroke();
    context.beginPath();
  },
  paintLine: function(x0, y0, x1, y1, pixel_size, color) {
    var delta_x = x1 >= x0 ? 1 : -1;
    var delta_y = y1 >= y0 ? 1 : -1;
    var distance_x = (x1 - x0) * delta_x;
    var distance_y = (y1 - y0) * delta_y;
    if (distance_x > distance_y) {
      var slope = distance_y / distance_x;
      for (var i = 0; i < distance_x; i++) {
        this.paintPixel(
            x0 + delta_x * i,
            y0 + Math.floor(slope * delta_y * i),
            pixel_size, 
            color);
      }
    } else {
      var slope = distance_x / distance_y;
      for (var i = 0; i < distance_y; i++) {
        this.paintPixel(
            x0 + Math.floor(slope * delta_x * i),
            y0 + delta_y * i,
            pixel_size, 
            color);
      }
    }
    this.paintPixel(x1, y1, pixel_size, color);
  },
  /** 
   * 
   */
  paintMarker: function(x, y, pixel_size, color) {
    var bx = Math.floor(x / pixel_size) * pixel_size;
    var by = Math.floor(y / pixel_size) * pixel_size;
    var context = this.getContext();
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(bx, by);
    context.lineTo(bx + pixel_size - 1, by + pixel_size - 1);
    context.moveTo(bx + pixel_size - 1, by);
    context.lineTo(bx, by + pixel_size - 1);
    context.stroke();
  },
  /**
   * Paints a square pixel on this canvas.
   * The square pixels are aligned in a grid, so the grid box containing the
   * x and y coordinates will be painted.
   */
  paintPixel: function(x, y, pixel_size, color) {
    var block_x = Math.floor(x / pixel_size);
    var block_y = Math.floor(y / pixel_size);
    var context = this.getContext();
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(
        Math.round(block_x * pixel_size), 
        Math.round(block_y * pixel_size), 
        pixel_size, 
        pixel_size);
  },
  setZIndex: function(zindex) {
    this.canvas.css('z-index', zindex);
  }
});