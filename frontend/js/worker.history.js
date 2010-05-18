importScripts('ejohn.Class.js');

var HistoryWorker = Class.extend({
  init: function() {
    this._lastdata = null;
    this._initDatabase();
    this._initSchema();
  },
  _initDatabase: function() {
    var dbSize = 5 * 1024 * 1024; // 5MB
    this._db = openDatabase("History", "1.0", "History support", dbSize);
  },
  _initSchema: function() {
    this._db.transaction(function(tx) {
      tx.executeSql(
          "CREATE TABLE IF NOT EXISTS history(" +
          "id INTEGER PRIMARY KEY ASC, " +
          "type VARCHAR(64), " +
          "data TEXT" + 
          "added_on DATETIME)", []);
    });
  },
  _onSuccess: function() {
    setTimeout(postMessage, 1000, {'status': 'ready'});
  },
  _onError: function() {},
  storeHistory: function(type, data) {
    var myself = this;
    if (typeof(data) != 'string') {
      data = JSON.encode(data);
    }
    this._db.transaction(function(tx){
      tx.executeSql(
          "INSERT INTO history(type, data, added_on) VALUES (?,?,?)", 
          [type, data, new Date()],
          myself._onSuccess,
          myself._onError);
    });
  },
  parseState: function(data) {
    if (this._lastdata.x != data.x || this._lastdata.y != data.y) {
      var diff = {
        'x': this._lastdata.x - data.x,
        'y': this._lastdata.y - data.y
      }; 
      this.storeHistory('translate', diff);
    }
    this._lastdata = data;
  }
});

var history = new HistoryWorker();
onmessage = function (evt) {
  switch (evt.data.action) {
    case 'sethistory':
      history.parseState(evt.data);
      break;
  }
};