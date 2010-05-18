importScripts('ejohn.Class.js');

var HistoryWorker = Class.extend({
  init: function() {
    this._MAX_UNDO = 10;
    this._history = [];
    this._lastdata = {};
  },
  _addState: function(state) {
    this._history.push(state);
    if (this._history.length > this._MAX_UNDO) {
      this._history.shift();
    }
  },
  parseState: function(data) {
    if (this._lastdata[data.index] == null) {
      this._lastdata[data.index] = data;
    }
    
    // We don't handle canvas movement or resizing correctly right now, so
    // clear the history.
    if (this._lastdata[data.index].x != data.x || 
        this._lastdata[data.index].y != data.y ||
        this._lastdata[data.index].w != data.w ||
        this._lastdata[data.index].h != data.h) {
      this._history = [];
      this._lastdata[data.index] = data;
      return;
    }
    
    
    var image_diff = this.diffImageData(
        this._lastdata[data.index].imagedata, 
        data.imagedata);
    
    if (image_diff != null) {
      this._addState({
        'type': 'paint',
        'diff': image_diff
      });
    }
    
    this._lastdata[data.index] = data;
  },
  diffImageData: function(last, curr) {
    var minW = Math.min(last.width, curr.width);
    var minH = Math.min(last.height, curr.height);
    var changed = false;
    var diff = {
        'data': new Array(minW * minH * 4),
        'width': minW,
        'height': minH
    };
        
    for (var i = 0; i < minW * minH * 4; i++) {
      if (changed == false && last.data[i] != curr.data[i]) {
        changed = true;
      }
      if (last.data[i] != curr.data[i]) {
        diff.data[i] = last.data[i] - curr.data[i];
      } else {
        diff.data[i] = 0;
      }
    }
    return (changed) ? diff : null;
  },
  mergeImageData: function(last, diff) {
    for (var i = 0; i < diff.width * diff.height * 4; i++) {
      last.data[i] += diff.data[i];
    }
    return last;
  },
  undo: function(data) {
    this.parseState(data);
    var data = this._lastdata[data.index];
    var diff = this._history.pop();
    if (diff == null) {
      return data;
    }
    
    switch (diff.type) {
      case 'translate':
        data.x += diff.x;
        data.y += diff.y;
        break;
      case 'paint':
        data.imagedata = this.mergeImageData(data.imagedata, diff.diff);
        break;
    }    
    
    return data;
  }
});

var history = new HistoryWorker();
onmessage = function (evt) {
  switch (evt.data.action) {
    case 'sethistory':
      history.parseState(evt.data);
      //setTimeout(postMessage, 1000, {'status': 'ready'});
      break;
    case 'undo':
      var data = history.undo(evt.data);
      data.status = 'undo';
      postMessage(data);
      break;
  }
};