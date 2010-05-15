var cb = cb || {};

cb.filters = {};

cb.filters.Filter = Class.extend({
  init: function() {
    this._LAST_PROGRESS = 0;
  },
  filter: function(canvas) {
    return canvas;
  },
  _setProgress: function(progress) {
    if (this._LAST_PROGRESS != progress) {
      $(this).trigger('progress', progress);
      this._LAST_PROGRESS = progress;
    }
  }
});

cb.filters.Blur = cb.filters.Filter.extend({
  init: function(radius) {
    this.RADIUS = radius;
  },
  filter: function(layer) {
    var imagedata = layer.getImageData();
    var dim = layer.getSize();
    var sum_r, sum_g, sum_b, sum_a;
    var scale = (this.RADIUS * 2 + 1) * (this.RADIUS * 2 + 1);
    console.log(scale, this.RADIUS);
    var num_pixels = dim.w * dim.h;
    
    function getPixel(x, y) {
      if (x < 0) { x = 0; }
      if (y < 0) { y = 0; }
      if (x >= dim.w) { x = dim.w - 1; }
      if (y >= dim.h) { y = dim.h - 1; }
      var index = (y * dim.w + x) * 4;
      return [
        imagedata.data[index + 0],
        imagedata.data[index + 1],
        imagedata.data[index + 2],
        imagedata.data[index + 3],
      ];
    };
    
    function setPixel(x, y, r, g, b, a) {
      var index = (y * dim.w + x) * 4;
      imagedata.data[index + 0] = r;
      imagedata.data[index + 1] = g;
      imagedata.data[index + 2] = b;
      imagedata.data[index + 3] = a;
    };
    
       for (y = 0; y < dim.h; y++) {
         for (x = 0; x < dim.w; x++) {
        
        var progress = Math.round((((y * dim.w) + dim.h) / num_pixels) * 100);
        if (progress % 2 == 0) {
          this._setProgress(progress);
        }
        
        sum_r = 0;
        sum_g = 0;
        sum_b = 0;
        sum_a = 0;
        for (var dy = -this.RADIUS; dy <= this.RADIUS; dy++) {
          for (var dx = -this.RADIUS; dx <= this.RADIUS; dx++) {
            var pixeldata = getPixel(x + dx, y + dy);
            sum_r += pixeldata[0];
            sum_g += pixeldata[1];
            sum_b += pixeldata[2];
            sum_a += pixeldata[3];
          }
        }
        setPixel(
          x, y, 
          Math.round(sum_r / scale), 
          Math.round(sum_g / scale), 
          Math.round(sum_b / scale), 
          Math.round(sum_a / scale));
      }
    }
    
    layer.setImageData(imagedata);
  }
});
