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
      cb.util.paintPixel(canvas, x, y, 5, '#36b');
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
