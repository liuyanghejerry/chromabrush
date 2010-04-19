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

cb.Brush = Class.extend({
  init: function() {
    
  },
  reset: function() {
    this.init();
  },
  onMouseDown: function(evt, layer) {
    console.log('cb.Brush.onMouseDown', evt, layer);
  },
  onMouseUp: function(evt, layer) {
    console.log('cb.Brush.onMouseUp', evt, layer);
  },
  onMouseMove: function(evt, layer) {
    //console.log('cb.Brush.onMouseMove', evt, layer);
  }
});

cb.PencilBrush = cb.Brush.extend({
  init: function() {
    this.drawing = false;
  },
  paint: function(evt, layer) {
    var x = evt.offsetX || evt.pageX - canvas.offsetLeft;
    var y = evt.offsetY || evt.pageY - canvas.offsetTop;
    var canvas = layer.get(0);
    if (canvas) {
      cb.util.paintPixel(canvas, x, y, cb.PixelSize, '#36b');
    }
  },
  onMouseDown: function(evt, layer) {
    this.drawing = true;
    this.paint(evt, layer);
  },
  onMouseUp: function(evt, layer) {
    this.drawing = false;
  },
  onMouseMove: function(evt, layer) {
    if (this.drawing) {
      this.paint(evt, layer);
    }
  }
});

cb.PenBrush = cb.Brush.extend({
  init: function() {
    this.startX = this.startY = null;
  },
  onMouseDown: function(evt, layer) {
    var x = evt.offsetX || evt.pageX - canvas.offsetLeft;
    var y = evt.offsetY || evt.pageY - canvas.offsetTop;
    cb.util.paintPixel(layer.get(0), x, y, cb.PixelSize, '#36b');
    this.previousX = x;
    this.previousY = y;
  },
  onMouseUp: function(evt, layer) {
    this.previousX = this.previousY = null;
  },
  onMouseMove: function(evt, layer) {
    if (!this.previousX) { return; }
    var x = evt.offsetX || evt.pageX - canvas.offsetLeft;
    var y = evt.offsetY || evt.pageY - canvas.offsetTop;
    cb.util.paintLine(layer.get(0),
        this.previousX, this.previousY, x, y, cb.PixelSize, '#36b');
    this.previousX = x;
    this.previousY = y;
  }
});

cb.EraserBrush = cb.Brush.extend({
  init: function() {
    this.drawing = false;
  },
  paint: function(evt, layer) {
    var x = evt.offsetX || evt.pageX - canvas.offsetLeft;
    var y = evt.offsetY || evt.pageY - canvas.offsetTop;
    var canvas = layer.get(0);
    if (canvas) {
      cb.util.erasePixel(canvas, x, y, cb.PixelSize, '#36b');
    }
  },
  onMouseDown: function(evt, layer) {
    this.drawing = true;
    this.paint(evt, layer);
  },
  onMouseUp: function(evt, layer) {
    this.drawing = false;
  },
  onMouseMove: function(evt, layer) {
    if (this.drawing) {
      this.paint(evt, layer);
    }
  }
});

cb.LineBrush = cb.Brush.extend({
  init: function(presenter) {
    this.presenter = presenter;
    this.startX = this.startY = null;
  },
  reset: function() {
    var canvas = this.presenter.tool_layer.get(0);
    cb.util.clearLayer(canvas);
    this.startX = this.startY = null;
  },
  onMouseUp: function(evt, layer) {
    var x = evt.offsetX || evt.pageX - canvas.offsetLeft;
    var y = evt.offsetY || evt.pageY - canvas.offsetTop;
    var canvas = layer.get(0);
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      return;
    }

    if (this.startX) {
      // Draw a line.
      cb.util.clearLayer(this.presenter.tool_layer.get(0));
      cb.util.paintLine(canvas,
          this.startX, this.startY, x, y, cb.PixelSize, '#36b');
      if (!evt.shiftKey) {
        // End of line.
        this.startX = this.startY = null;
        return;
      }
    }
    this.startX = x;
    this.startY = y;
  },
  onMouseMove: function(evt, layer) {
    if (!this.startX) { return; }
    var x = evt.offsetX || evt.pageX - canvas.offsetLeft;
    var y = evt.offsetY || evt.pageY - canvas.offsetTop;
    var canvas = this.presenter.tool_layer.get(0);
    cb.util.clearLayer(canvas);
    cb.util.paintToolLine(canvas,
        this.startX, this.startY, x, y, cb.PixelSize, '#c48');
  }
});

cb.FillBrush = cb.Brush.extend({
  onMouseUp: function(evt, layer) {
    var x = evt.offsetX || evt.pageX - canvas.offsetLeft;
    var y = evt.offsetY || evt.pageY - canvas.offsetTop;
    var canvas = layer.get(0);
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
      return;
    }
    cb.util.fillLayer(canvas, x, y, cb.PixelSize, '#4c8');
  },
});

