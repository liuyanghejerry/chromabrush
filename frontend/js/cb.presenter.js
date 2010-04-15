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

cb.Presenter = Class.extend({
  init: function() {
    this.canvas_width = 600;
    this.canvas_height = 400;
    this.layers = 0;

    var body = $('body');
    body.empty();

    var vbox1 = $('<div class="vbox"></div>');
    vbox1.css('height', '100%');
    body.append(vbox1);
  
    this.menu_box = $('<div class="box boxFlex0" id="menu_box"></div>');
    this.menu_box.text('Menu box');
    vbox1.append(this.menu_box);
  
    var hbox1 = $('<div class="hbox boxFlex"></div>');
    vbox1.append(hbox1);
  
    this.control_box = $('<div class="box boxFlex0" id="control_box"></div>');
    this.control_box.text('Control box');
    hbox1.append(this.control_box);

    var vbox2 = $('<div class="vbox boxFlex"></div>');
    hbox1.append(vbox2);
  
    var canvas_wrap = $('<div class="box boxFlex vbox center"></div>');
    canvas_wrap.css('overflow', 'auto');
    vbox2.append(canvas_wrap);
    
    this.canvas_box = $('<div id="canvas_box"></div>');
    this.canvas_box.css('position', 'relative')
                   .css('width', this.canvas_width + 'px')
                   .css('height', this.canvas_height + 'px')
                   .css('-webkit-box-shadow', '2px 2px 4px #666')
                   .css('margin', '0 auto')
                   .css('overflow', 'hidden');
    canvas_wrap.append(this.canvas_box);
  
    this.brush_box = $('<div class="box boxFlex0" id="brush_box"></div>');
    this.brush_box.text('Brush box');
    vbox2.append(this.brush_box);
  
    this.panel_box = $('<div class="box boxFlex0" id="panel_box"></div>');
    this.panel_box.text('Panel box');
    hbox1.append(this.panel_box);
  
    this.layer_box = $('<div class="panel" id="layer_box"></div>');
    this.layer_box.text('Layer box');
    this.panel_box.append(this.layer_box);
  
    this.base_layer = $('<canvas class="center" style="margin: 0 auto; display: block; width: 600px;" />');
    this.base_layer.attr('width', this.canvas_width)
                   .attr('height', this.canvas_height);
    var base_canvas = this.base_layer.get(0);
    cb.util.fillCanvas(base_canvas, '#fff');
    cb.util.drawGrid(base_canvas, 5, '#eee');
    cb.util.drawGrid(base_canvas, 50, '#ccc');
    this.canvas_box.append(this.base_layer);
  },
  _getLayer: function(layer) {
    return $('#layer_box .layer[layer="' + layer + '"]');
  },
  _getCanvas: function(layer) {
    return $('#canvas_box canvas[layer="' + layer + '"]');
  },
  addLayer: function() {
    this.layers++;
    var dom_canvas = $('<canvas layer="' + this.layers + '"></canvas>');
    dom_canvas.attr('width', this.canvas_width)
              .attr('height', this.canvas_height)
              .css('position', 'absolute')
              .css('left', '0')
              .css('top', '0');
    var dom_layer = $('<div class="layer" layer="' + this.layers + '"></div>');
    dom_layer.text("Layer " + this.layers);
    this.canvas_box.append(dom_canvas);
    this.layer_box.append(dom_layer);
  }
});
