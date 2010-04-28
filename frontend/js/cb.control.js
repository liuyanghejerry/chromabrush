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

cb.ColorSelector = Class.extend({
  init: function(container) {
    // Using this canvas to draw HSV control.
    var canvas = $('<canvas />');
    canvas.css('width', '150px')
          .css('height', '150px');
          //.css('position', 'absolute')
          //.css('overflow', 'visible')
          //.css('z-index', '1000');
    container.append(canvas);
    container.append($('<br>'));

    var context = canvas.get(0).getContext('2d');
    // TODO: I couldn't figure out why, but we need to scale 2.0 in X direction
    // to draw correctly...

    // Control geometry.
    var center_x = 75;
    var center_y = 75;
    var hue_radius1 = 55;
    var hue_radius2 = 70;
    var hue_tick_len = 3;
    var quad_size = Math.sqrt(2.0) * hue_radius1;
    var quad_steps = 12;
    var hue_steps = 32;
    var hue_strip_width = 60.0 / hue_steps;

    // Control states.
    this.hue = 85.0;
    this.darkness = 0.5;
    this.lightness = 0.5;

    // A few utilitiy functions that draw onto the canvas.
    var myself = this;
    var draw_arc = function(d, r1, r2) {
      // Paint a strip of degree x plus / minux 0.5.
      var rad1 = (d - hue_strip_width / 2.0) * Math.PI / 180.0;
      var rad2 = (d + hue_strip_width / 2.0) * Math.PI / 180.0;
      var s1 = Math.sin(rad1);
      var s2 = Math.sin(rad2);
      var c1 = Math.cos(rad1);
      var c2 = Math.cos(rad2);
      context.beginPath();
      context.moveTo(c1 * r1, s1 * r1);
      context.lineTo(c1 * r2, s1 * r2);
      context.lineTo(c2 * r2, s2 * r2);
      context.lineTo(c2 * r1, s2 * r1);
      context.closePath();
      context.fill();
    };
    var paint_hue_circle = function() {
      context.setTransform(2.0, 0.0, 0.0, 1.0, 0.0, 0.0);
      context.translate(center_x, center_y);

      var line = function(d, r, g, b) {
        context.fillStyle = cb.util.normalizedColor(r, b, g);
        draw_arc(d, hue_radius1, hue_radius2);
      }
      for (var i = 0; i < hue_steps; i++) {
        var x = 1.0 * i / hue_steps;
        line(             i * hue_strip_width, 1.0,   x, 0.0);
        line(120 - hue_strip_width - i * hue_strip_width,   x, 1.0, 0.0);
        line(120        + i * hue_strip_width, 0.0, 1.0,   x);
        line(240 - hue_strip_width - i * hue_strip_width, 0.0,   x, 1.0);
        line(240        + i * hue_strip_width,   x, 0.0, 1.0);
        line(360 - hue_strip_width - i * hue_strip_width, 1.0, 0.0,   x);
      }

      // Draw cursor.
      context.fillStyle = '#ccc';
      draw_arc(-myself.hue, hue_radius1, hue_radius2);
    };
    var paint_bw_quad = function() {
      context.setTransform(2.0, 0.0, 0.0, 1.0, 0.0, 0.0);
      context.translate(center_x, center_y);
      context.rotate(Math.PI * 0.75 - myself.hue * Math.PI / 180.0);
      context.translate(-quad_size / 2.0, -quad_size / 2.0);
      context.scale(quad_size / quad_steps, quad_size / quad_steps);

      var rgb = cb.util.hueToRGB(myself.hue);
      for (var i = 0; i < quad_steps; i++) {
        for (var j = 0; j < quad_steps; j++) {
          var ii = 1.0 * i / quad_steps;
          var jj = 1.0 * j / quad_steps;
          var black = Math.max(ii - jj * 0.5, 0.0);
          var white = Math.max(jj - ii * 0.5, 0.0);
          var color = 1.0 - black - white;
          context.fillStyle = cb.util.normalizedColor(
              rgb[0] * color + white,
              rgb[1] * color + white,
              rgb[2] * color + white);
          context.beginPath();
          context.moveTo(i, j);
          context.lineTo(i + 1, j);
          context.lineTo(i + 1, j + 1);
          context.lineTo(i, j + 1);
          context.closePath();
          context.fill();
        }
      }

      // Draw cursor.
      var rgb = cb.util.hueToRGB(myself.hue + 180);
      context.strokeStyle = cb.util.normalizedColor(rgb[0], rgb[1], rgb[2]);
      context.lineWidth = 0.2;
      context.beginPath();
      context.arc(myself.darkness * quad_steps, myself.lightness * quad_steps,
          0.4, 0, Math.PI * 2.0, false);
      context.stroke()
      context.lineWidth = 1;
    };

    // Initialize the canvas.
    paint_hue_circle();
    paint_bw_quad();

    // Bind event handlers so we can control the color.
    //canvas.bind('mousedown', function(evt) {
    canvas.bind('mousedown', function(evt) {
      var x = evt.pageX - canvas.offset().left - center_x;
      var y = evt.pageY - canvas.offset().top - center_y;

      if (x * x + y * y >= hue_radius1 * hue_radius1) {
        // Recalculate hue.
        myself.hue = Math.atan2(y, x) / Math.PI * 180;
        myself.hue = (360 - myself.hue) % 360;
      } else {
        // Recalculate saturation-value.
        var rad = Math.PI * 0.75 - myself.hue * Math.PI / 180.0;
        var s = Math.sin(-rad);
        var c = Math.cos(-rad);
        myself.darkness = (c * x - s * y) / quad_size + 0.5;
        myself.lightness = (s * x + c * y) / quad_size + 0.5;
        myself.darkness = Math.max(Math.min(1.0, myself.darkness), 0.0);
        myself.lightness = Math.max(Math.min(1.0, myself.lightness), 0.0);
      }

      // Redraw the control.
      context.setTransform(2.0, 0.0, 0.0, 1.0, 0.0, 0.0);
      context.clearRect(0, 0, canvas.width(), canvas.height());

      paint_hue_circle();
      paint_bw_quad();
    });
  },

  currentColor: function() {
    // Convert hue, darknes, and lightness into RGB.
    var rgb = cb.util.hueToRGB(this.hue);
    var black = Math.max(this.darkness - this.lightness * 0.5, 0.0);
    var white = Math.max(this.lightness - this.darkness * 0.5, 0.0);
    var color = 1.0 - black - white;
    return cb.util.normalizedColor(
        rgb[0] * color + white,
        rgb[1] * color + white,
        rgb[2] * color + white);
  }
});

cb.BrushSizeSelector = Class.extend({
  init: function(container) {
    var text = $('<div />');
    container.append(text);
    container.append($('<br>'));

    var canvas = $('<canvas />');
    canvas.css('width', '150px')
          .css('height', '50px');
    container.append(canvas);
    container.append($('<br>'));

    var context = canvas.get(0).getContext('2d');

    var size_min = 1.0;
    var size_max = 8.0;
    this.size = 1.0;

    var myself = this;
    var slider_redraw = function() {
      context.setTransform(2.0, 0.0, 0.0, 1.0, 0.0, 0.0);
      context.clearRect(0, 0, canvas.width(), canvas.height());

      // Draw the background triangle.
      context.fillStyle = '#aaa';
      context.beginPath();
      context.moveTo(10, 25);
      context.lineTo(140, 5);
      context.lineTo(140, 45);
      context.closePath();
      context.fill();

      // Draw the handle.
      var x = (myself.size - size_min) / (size_max - size_min) * 130 + 10;
      context.strokeStyle = '#222';
      context.beginPath();
      context.moveTo(x - 2, 0);
      context.lineTo(x - 2, 50);
      context.stroke();
      context.beginPath();
      context.moveTo(x + 2, 0);
      context.lineTo(x + 2, 50);
      context.stroke();

      // Update the text as well.
      text.text(myself.size + 'px');
    };

    slider_redraw();
    canvas.bind('mousedown', function(evt) {
      var x = evt.pageX - canvas.offset().left;
      myself.size = Math.max(
          Math.floor((x - 10) / 130 * (size_max - size_min) + 0.5), 0.0) + size_min;

      slider_redraw();
    });
  },

  currentBrushSize: function() { return this.size; }
});
