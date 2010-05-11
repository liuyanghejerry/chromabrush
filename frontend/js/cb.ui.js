var cb = cb || {};
cb.ui = cb.ui || {};

cb.ui.CLASS_POSITIONER = 'cb_ui_positioner';
cb.ui.CLASS_HIDDEN = 'cb_ui_hidden';
cb.ui.CLASS_POPUP = 'cb_ui_popup';
cb.ui.CLASS_POPUPWRAP = 'cb_ui_popupwrap';
cb.ui.CLASS_MODALBG = 'cb_ui_modalbg';
cb.ui.CLASS_CLOSEBUTTON = 'cb_ui_closebutton';

cb.ui.CLASS_POINTERUP = 'cb_ui_pointerup';
cb.ui.URL_POINTERUP = '/img/pointer-up.png';

cb.ui.Dom = Class.extend({
  init: function(dom) {
    this._dom = $(dom);
  },
  getDom: function() {
    return this._dom.get(0);
  }
});

cb.ui.Popup = Class.extend({
  init: function(content, opt_args) {
    this._dom_popup = $('<div></div>')
        .addClass(cb.ui.CLASS_POPUP)
        .append($(content));

    this._dom_wrap = $('<div></div>')
        .addClass(cb.ui.CLASS_POPUPWRAP)
        .append(this._dom_popup);
    
    this._dom_positioner = $('<div></div>')
        .addClass(cb.ui.CLASS_POSITIONER)
        .addClass(cb.ui.CLASS_HIDDEN)
        .append(this._dom_wrap);

    if (opt_args) {
      if (opt_args.closeable && opt_args.closeable == true) {
        this._dom_closebutton = $("<div>x</div>")
            .addClass(cb.ui.CLASS_CLOSEBUTTON)
            .click($.proxy(this, 'hide'));
        this._dom_wrap.append(this._dom_closebutton);
      }
      
      if (opt_args.autoclose && opt_args.autoclose == true) {
        this._dom_wrap.bind('mouseleave', $.proxy(this, 'hide'));
      }
    }

    $(document.body).append(this._dom_positioner);
  },
  show: function() {
    this._dom_positioner.removeClass(cb.ui.CLASS_HIDDEN);
    $(this).trigger('showpopup');
  },
  hide: function() {
    this._dom_positioner.addClass(cb.ui.CLASS_HIDDEN);
    $(this).trigger('hidepopup');
  },
});

cb.ui.ModalPopup = cb.ui.Popup.extend({
  init: function(content, opt_args) {
    this._super(content, opt_args);
    this._dom_positioner.addClass(cb.ui.CLASS_MODALBG);
  }
});

cb.ui.PointingPopup = cb.ui.Popup.extend({
  init: function(content, target, opt_args) {
    this._super(content, opt_args);
    this._dom_target = $(target);
            
    this._dom_pointerup = $("<img/>")
        .load($.proxy(this, 'adjustPosition'))
        .attr('src', cb.ui.URL_POINTERUP)
        .addClass(cb.ui.CLASS_POINTERUP);
    this._dom_wrap.append(this._dom_pointerup);
  },
  adjustPosition: function() {
    var target_pos = this._dom_target.position();
    var pointer_pos = this._dom_pointerup.position();
    var pointer_width = this._dom_pointerup.outerWidth();
    var pointer_height = this._dom_pointerup.outerHeight();
    var target_width = this._dom_target.outerWidth();
    var target_height = this._dom_target.outerHeight();

    var target_x = target_pos.left + target_width / 2;
    var target_y = target_pos.top + target_height;
    
    var wrap_x = target_x - (pointer_pos.left + pointer_width / 2);
    var wrap_y = target_y + pointer_height;
    
    this._dom_wrap
        .css('left', wrap_x)
        .css('top', wrap_y);
  },
  show: function() {
    this._super();
    this.adjustPosition();
  }
});