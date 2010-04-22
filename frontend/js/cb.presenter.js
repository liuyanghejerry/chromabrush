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

cb.PixelSize = 5;

cb.Presenter = Class.extend({
  init: function() {
    this.canvas_width = 600;
    this.canvas_height = 400;
    this.layers = [];
    this.brushes = {};
    this.currentbrush = null;
    this.currentlayer = -1;
    var myself = this;

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
  
    var canvas_wrap = $('<div class="box boxFlex vbox center canvas-wrap"></div>');
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
  
    this.brush_box = $('<div class="hbox boxFlex0" id="brush_box"></div>');
    vbox2.append(this.brush_box);
  
    this.panel_box = $('<div class="box boxFlex0" id="panel_box"></div>');
    this.panel_box.text('Panel box');
    hbox1.append(this.panel_box);
  
    this.layer_box = $('<div class="panel" id="layer_box"></div>');
    this.layer_box.sortable({
      'axis' : 'y',
      'update' : function() { myself._setLayerOrder(); }
    });
    this.panel_box.append(this.layer_box);
    
    this.base_layer = new cb.Layer(this.canvas_width, this.canvas_height, 0);
    this.base_layer.fill('#fff');
    this.base_layer.paintGrid(cb.PixelSize, '#eee');
    this.base_layer.paintGrid(cb.PixelSize * 10, '#ccc');
    this.canvas_box.append(this.base_layer.getCanvas());

    this.tool_layer = new cb.Layer(this.canvas_width, this.canvas_height, 100);
    this.canvas_box.append(this.tool_layer.getCanvas());
    
    $(this.tool_layer.getCanvas()).bind('mousedown', function(evt) {
      myself._onToolMouseDown(evt);
    });
    $(window).bind('mousemove', function(evt) {
      myself._onToolMouseMove(evt);
    });
    $(window).bind('mouseup', function(evt) {
      myself._onToolMouseUp(evt);
    });
    $(document).bind('selectstart', function() { return false; });
  },
  _getRelativeMousePos: function(evt, elem) {
    var offset = $(elem).offset();
    return {
      'x' : evt.pageX - offset.left,
      'y' : evt.pageY - offset.top
    };
  },
  _onToolMouseDown: function(evt) {
    if (this.currentbrush) {
      var pos = this._getRelativeMousePos(evt, this.tool_layer.getCanvas());
      this.currentbrush.onMouseDown(pos.x, pos.y, this, evt);
    }
  },
  _onToolMouseUp: function(evt) {
    if (this.currentbrush) {
      var pos = this._getRelativeMousePos(evt, this.tool_layer.getCanvas());
      this.currentbrush.onMouseUp(pos.x, pos.y, this, evt);
    }
  },
  _onToolMouseMove: function(evt) {
    if (this.currentbrush) {
      var pos = this._getRelativeMousePos(evt, this.tool_layer.getCanvas());
      this.currentbrush.onMouseMove(pos.x, pos.y, this, evt);
    }
  },
  _setLayerOrder: function() {
    var myself = this;
    var num_layers = this.layers.length;
    this.layer_box.find('.layer').each(function(index) {
      var layer_index = $(this).attr('layer');
      myself.layers[layer_index].setZIndex(num_layers - index);
    });
  },
  addLayer: function() {
    var new_index = this.layers.length;
    var layer = new cb.Layer(this.canvas_width, this.canvas_height, new_index);
    this.layers.push(layer);
    this.canvas_box.append(layer.getCanvas());
    
    var thumb_width = 50;
    var thumb_height = (this.canvas_height / this.canvas_width) * thumb_width;
    var thumb_src = layer.getDataUrl(thumb_width, thumb_height);
    var dom_thumb = $('<img/>')
        .attr('src', thumb_src)
        .css('width', thumb_width)
        .css('height', thumb_height);
                               
    var dom_layer = $('<div></div>')
        .addClass('layer')
        .addClass('hbox')
        .css('line-height', thumb_height + 'px')
        .attr('layer', new_index)
        .append(dom_thumb)
        .append('<span>Layer ' + new_index + '</span>');
    
    $(layer).bind('updated', function() { 
      var thumb_src = layer.getDataUrl(thumb_width, thumb_height);
      dom_thumb.attr('src', thumb_src); 
    });
    
    var myself = this;
    dom_layer.bind('mousedown', function() {
      myself.selectLayer(new_index);
    });
    
    this.layer_box.prepend(dom_layer);
    this.selectLayer(new_index);
  },
  addBrush: function(name, brush) {
    this.brushes[name] = brush;
    var brush_selection = $('<div class="box" />');
    brush_selection.attr('id', 'brush_select_' + name)
                   .text(name)
                   .css('color', 'gray');
    var myself = this;
    brush_selection.bind('click', function(evt) {
      myself.selectBrush(name);
    });
    this.brush_box.append(brush_selection);
  },
  getCurrentLayer: function() {
    if (this.currentlayer > -1) {
      return this.layers[this.currentlayer];
    } else {
      return null;
    }
  },
  getToolLayer: function() {
    return this.tool_layer;
  },
  selectBrush: function(name) {
    if (this.currentbrush) {
      this.brush_box.children().css('color', 'gray');
      this.currentbrush.reset();
    }

    if (name == null) {
      this.currentbrush = null;
    } else if (this.brushes.hasOwnProperty(name)) {
      console.log('setting current brush', name, this.brushes[name]);
      this.brush_box.find('#brush_select_' + name).css('color', 'black');
      this.currentbrush = this.brushes[name];
    } 
  },
  selectLayer: function(index) {
    if (index > this.layers.length || index < 0) {
      return;
    }
    $('.layer.selected').removeClass('selected');
    this.currentlayer = index;
    $('.layer[layer=' + index + ']').addClass('selected');
  }
});
