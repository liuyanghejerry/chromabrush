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
  init: function() {},
  reset: function() {
    this.init();
  },
  setPresenter: function(presenter) {
    this.presenter = presenter;
  },
  onMouseDown: function(x, y, evt) {},
  onMouseUp: function(x, y, evt) {},
  onMouseMove: function(x, y, evt) {}
});

cb.PencilBrush = cb.Brush.extend({
  init: function() {
    this.drawing = false;
  },
  onMouseDown: function(x, y, evt) {
    this.drawing = true;
    var layer = this.presenter.getCurrentLayer();
    layer.paintPixel(x, y,
        this.presenter.currentBrushSize(),
        this.presenter.currentColor());
  },
  onMouseUp: function(x, y, evt) {
    this.drawing = false;
  },
  onMouseMove: function(x, y, evt) {
    if (this.drawing) {
      var layer = this.presenter.getCurrentLayer();
      layer.paintPixel(x, y,
          this.presenter.currentBrushSize(),
          this.presenter.currentColor());
    }

    var toollayer = this.presenter.getToolLayer();
    var radius = this.presenter.currentBrushSize() / 2 * cb.PixelSize;
    var pos = this.presenter.getCurrentLayer().getPosition();
    var adjX = x + pos.x;
    var adjY = y + pos.y;
    
    toollayer.clear();
    toollayer.paintCircle(adjX, adjY, radius, 1, '#000000');
  }
});

cb.PenBrush = cb.Brush.extend({
  init: function() {
    this.previousX = this.previousY = null;
  },
  onMouseDown: function(x, y, evt) {
    var layer = this.presenter.getCurrentLayer();
    var radius = this.presenter.currentBrushSize() / 2 * cb.PixelSize;
    layer.fillCircle(x, y, radius, this.presenter.currentColor());
    this.previousX = x;
    this.previousY = y;
  },
  onMouseUp: function(x, y, evt) {
    this.previousX = this.previousY = null;
  },
  onMouseMove: function(x, y, evt) {
    var toollayer = this.presenter.getToolLayer();
    var radius = this.presenter.currentBrushSize() / 2 * cb.PixelSize;
    var pos = this.presenter.getCurrentLayer().getPosition();
    var adjX = x + pos.x;
    var adjY = y + pos.y;

    toollayer.clear();
    toollayer.paintCircle(adjX, adjY, radius, 1, '#000000');
    
    if (!this.previousX) { return; }
    var layer = this.presenter.getCurrentLayer();
    layer.paintLine(
        this.previousX,
        this.previousY,
        x,
        y,
        this.presenter.currentBrushSize(),
        this.presenter.currentColor());
    this.previousX = x;
    this.previousY = y;
  }
});

cb.EraserBrush = cb.Brush.extend({
  init: function() {
    this.drawing = false;
  },
  onMouseDown: function(x, y, evt) {
    this.drawing = true;
    var layer = this.presenter.getCurrentLayer();
    layer.erasePixel(x, y, this.presenter.currentBrushSize());
  },
  onMouseUp: function(x, y, evt) {
    this.drawing = false;
  },
  onMouseMove: function(x, y, evt) {
    if (this.drawing) {
      var layer = this.presenter.getCurrentLayer();
      layer.erasePixel(x, y, this.presenter.currentBrushSize());
    }
    var toollayer = this.presenter.getToolLayer();
    var radius = this.presenter.currentBrushSize() / 2 * cb.PixelSize;
    var pos = this.presenter.getCurrentLayer().getPosition();
    var adjX = x + pos.x;
    var adjY = y + pos.y;

    toollayer.clear();
    toollayer.paintRect(
        adjX - radius, 
        adjY - radius, 
        radius * 2, 
        radius * 2, 
        1, '#000000');
  }
});

cb.LineBrush = cb.Brush.extend({
  init: function() {
    this.startX = this.startY = null;
  },
  onMouseDown: function(x, y, evt) {
    var layer = this.presenter.getCurrentLayer();
    if (x < 0 || x >= layer.width || y < 0 || y >= layer.height) {
      return;
    }

    if (this.startX) {
      // Draw a line.
      this.presenter.getToolLayer().clear();
      layer.paintLine(
          this.startX, 
          this.startY, 
          x, 
          y, 
          this.presenter.currentBrushSize(), 
          this.presenter.currentColor());
      console.log(evt, evt.shiftKey);
      if (!evt.shiftKey) {
        // End of line.
        this.startX = this.startY = null;
        return;
      }
    }
    this.startX = x;
    this.startY = y;
  },
  onMouseUp: function(x, y, evt) {
    this.presenter.getToolLayer().clear();
  },
  onMouseMove: function(x, y, evt) {
    var toollayer = this.presenter.getToolLayer();
    var layer_position = this.presenter.getCurrentLayer().getPosition();
    var adjX = x + layer_position.x;
    var adjY = y + layer_position.y;
    
    toollayer.clear();
    
    if (this.startX) {
      toollayer.paintLine(
          this.startX + layer_position.x, 
          this.startY + layer_position.y, 
          adjX, 
          adjY, 
          this.presenter.currentBrushSize(), 
          this.presenter.currentColor());
    }
    
    var radius = this.presenter.currentBrushSize() / 2 * cb.PixelSize;
    toollayer.paintLine(adjX - radius, adjY, adjX + radius, adjY, 1, '#000000');
    toollayer.paintLine(adjX, adjY - radius, adjX, adjY + radius, 1, '#000000');
  }
});

cb.FillBrush = cb.Brush.extend({
  onMouseDown: function(x, y, evt) {
    var layer = this.presenter.getCurrentLayer();
    if (x < 0 || x >= layer.width || y < 0 || y >= layer.height) {
      return;
    }
    layer.paintFill(x, y, this.presenter.currentColor());
  },
  onMouseMove: function(x, y, evt) {
    var toollayer = this.presenter.getToolLayer();
    var radius = this.presenter.currentBrushSize() / 2 * cb.PixelSize;
    var pos = this.presenter.getCurrentLayer().getPosition();
    var adjX = x + pos.x;
    var adjY = y + pos.y;

    toollayer.clear();
    toollayer.paintLine(adjX - radius, adjY, adjX + radius, adjY, 1, '#000000');
    toollayer.paintLine(adjX, adjY - radius, adjX, adjY + radius, 1, '#000000');
  }
});

cb.MoveTool = cb.Brush.extend({
  init: function() {
    this.startX = this.startY = this.startLX = this.startLY = null;
  },
  onMouseDown: function(x, y, evt) {
    var canvas_position = this.presenter.getCanvasMousePos(evt);
    this.startX = canvas_position.x;
    this.startY = canvas_position.y;
    var layer_position = this.presenter.getCurrentLayer().getPosition();
    this.startLX = layer_position.x;
    this.startLY = layer_position.y;
  },
  onMouseUp: function(x, y, evt) {
    if (this.startX) {
      var canvas_position = this.presenter.getCanvasMousePos(evt);
      this.presenter.getCurrentLayer().lockPosition(
        this.startLX + canvas_position.x - this.startX,
        this.startLY + canvas_position.y - this.startY);
    }
    this.startX = this.startY = this.startLX = this.startLY = null;
    this.presenter.getToolLayer().clear();
  },
  onMouseMove: function(x, y, evt) {
    var toollayer = this.presenter.getToolLayer();
    var radius = this.presenter.currentBrushSize() / 2 * cb.PixelSize;
    var pos = this.presenter.getCurrentLayer().getPosition();
    var adjX = x + pos.x;
    var adjY = y + pos.y;
    
    toollayer.clear();
    toollayer.paintLine(adjX - radius, adjY, adjX + radius, adjY, 1, '#000000');
    toollayer.paintLine(adjX, adjY - radius, adjX, adjY + radius, 1, '#000000');

    if (!this.startX) { return; }
    var canvas_position = this.presenter.getCanvasMousePos(evt);
    var layer = this.presenter.getCurrentLayer();
    layer.setPosition(
      this.startLX + canvas_position.x - this.startX,
      this.startLY + canvas_position.y - this.startY);

    // Draw a box around the canvas on the tool layer.
    this.presenter.getToolLayer().clear();
    this.presenter.getToolLayer().paintLayerBox(
        this.presenter.getCurrentLayer(), 5.0, '#668');
  }
});
