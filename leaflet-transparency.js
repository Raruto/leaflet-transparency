L.Control.OpacitySlider = L.Control.extend({

  includes: L.Evented ? L.Evented.prototype : L.Mixin.Events,

  options: {
    position: 'topright',
    opacity: 100,
    backgroundColor: 'transparent',
    sliderImageUrl: 'images/opacity-slider3d14.png',
    margin: 5,
  },

  _OPACITY_MAX_PIXELS: 69,

  initialize: function(layer, options) {
    L.Util.setOptions(this, options);

    this.layer = layer;
    this.layers = this.layer ? [this.layer] : [];
  },

  onAdd: function(map) {

    var container = this._container = L.DomUtil.create('DIV', 'opacity-control');
    var slider = this._slider = L.DomUtil.create('DIV', 'opacity-slider');
    var knob = this._knob = L.DomUtil.create('DIV', 'opacity-knob');

    container.setAttribute("style", "cursor:pointer;");
    slider.setAttribute("style", "margin:" + this.options.margin + "px;overflow-x:hidden;overflow-y:hidden;background:url(" + this.options.sliderImageUrl + ") no-repeat;width:71px;height:21px;");
    knob.setAttribute("style", "padding:0;margin:0;overflow-x:hidden;overflow-y:hidden;background:url(" + this.options.sliderImageUrl + ") no-repeat -71px 0;width:14px;height:21px;");

    slider.appendChild(knob);
    container.appendChild(slider);

    this.knob = new this.DraggableObject(knob, {
      restrictY: true,
      container: container,
      onDragEnd: function(e) {
        var opacity = this.knob.getValueX();
        this.setOpacity(opacity);
      }.bind(this)
    });

    L.DomEvent.on(container, 'click mousedown mousemove mouseup', function(e) {
      L.DomUtil.disableTextSelection();
      if (e.type == 'mousedown') this._dragging = true;
      else if (e.type == 'mouseup' || e.type == 'click') this._dragging = false;

      if (e.type == 'mousemove' && this._dragging == true || e.type == 'click') {
        var left = this.findPosLeft(this._container);
        var x = e.pageX - left - this.options.margin;
        this.knob.setValueX(x);
        this.setOpacity(x);
      }
    }, this);

    L.DomEvent.disableClickPropagation(container);

    this._resetSlider();

    this.on('hidden', function(e) {
      for (var i in this.layers) {
        if (this.layers[i])
          this.layers[i].remove();
      }
    }, this);
    this.on('visible', function(e) {
      for (var i in this.layers) {
        if (this.layers[i])
          this.layers[i].addTo(this._map);
      }
    }, this);

    if (!this.layer) {
      if (map.options.layers && map.options.layers.length) {
        this.setLayer(map.options.layers[0]);
        this._setLayerOpacity(map.options.layers[0], this.opacity);
      }
      map.on('baselayerchange', function(e) {
        this.setLayer(e.layer);
        this._setLayerOpacity(e.layer, this.opacity);
      }, this);
    }

    return container;
  },

  setOpacity: function(pixelX) {
    // Range = 0 to OPACITY_MAX_PIXELS
    var value = (100 / this._OPACITY_MAX_PIXELS) * pixelX;
    value = value / 100;

    if (value < 0) {
      value = 0;
    }

    this.fire(value > 0 ? 'visible' : 'hidden');

    if (this.layer) {
      if (this.layer.eachLayer) {
        this.layer.eachLayer(function(layer) {
          this._setLayerOpacity(layer, value);
        }, this);
      } else {
        this._setLayerOpacity(this.layer, value);
      }
    }
  },

  _setLayerOpacity: function(layer, value) {
    if (layer.setStyle) {
      layer.setStyle({
        opacity: value
      });
      this.opacity = value;
    } else if (layer.setOpacity) {
      layer.setOpacity(value);
      this.opacity = value;
    }
  },

  findPosLeft: function(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        obj = obj.offsetParent;
      } while (obj);
      return curleft;
    }
    return undefined;
  },

  getLayer: function() {
    return this.layer;
  },

  setLayer: function(layer) {
    this.removeFeatureLayer(this.layer);
    this.addFeatureLayer(layer);
    this.layer = layer;
  },

  addFeatureLayer: function(layer) {
    this.layers.push(layer);
    return this.layers;
  },

  removeFeatureLayer: function(layer) {
    for (var i in this.layers) {
      if (this.layers[i] && this.layers[i]._leaflet_id === layer._leaflet_id) {
        this.layers.splice(i, 1);
      }
    }
    return this.layers;
  },

  _resetSlider: function() {
    // Set initial value
    this._initialValue = this._OPACITY_MAX_PIXELS / (100 / this.options.opacity);
    this.knob.setValueX(this._initialValue);
    this.setOpacity(this._initialValue);
  },

  /**
   * TODO: trying to replace with the "L.Draggable" class
   */
  DraggableObject: function(src, options) {
    var self = this;

    var _opts = {
      draggingCursor: "default",
      draggableCursor: "default",
      onDragStart: _dumbFunction,
      onDragEnd: _dumbFunction,
      onDragging: _dumbFunction,
      onMouseDown: _dumbFunction,
      onMouseUp: _dumbFunction,
      intervalX: 1,
      intervalY: 1,
      toleranceX: Infinity,
      toleranceY: Infinity,
      interval: 1
    };

    L.Util.extend(_opts, options);

    var _draggingCursor = _opts.draggingCursor;
    var _draggableCursor = _opts.draggableCursor;
    var _dragging = false;
    var _preventDefault;
    var _currentX, _currentY, _formerY, _formerX, _formerMouseX, _formerMouseY;
    var _top, _left;
    var _originalX, _originalY;
    var _target = src.setCapture ? src : document;

    _opts.left = _opts.left || src.offsetLeft;
    _opts.top = _opts.top || src.offsetTop;

    src.style.position = "absolute";

    src.addEventListener("mousedown", _mouseDown);
    _target.addEventListener("mouseup", _mouseUp);

    _setCursor(false);
    _moveTo(_opts.left, _opts.top, false);

    /**
     * Set the cursor for {@link src} based on whether or not
     *     the element is currently being dragged.
     * @param {Boolean} a Is the element being dragged?
     * @private
     */
    function _setCursor(a) {
      src.style.cursor = a ? _draggingCursor : _draggableCursor;
    }

    /**
     * Moves the element {@link src} to the given
     *     location.
     * @param {Number} x The left position to move to.
     * @param {Number} y The top position to move to.
     * @param {Boolean} prevent Prevent moving?
     * @private
     */
    function _moveTo(x, y, prevent) {
      _left = Math.round(x);
      _top = Math.round(y);

      if (_opts.intervalX > 1) {
        var halfIntervalX = Math.round(_opts.intervalX / 2);
        var roundedIntervalX = Math.round(_left % _opts.intervalX);
        _left = (roundedIntervalX < halfIntervalX) ? (_left - roundedIntervalX) : (_left + (_opts.intervalX - roundedIntervalX));
      }
      if (_opts.intervalY > 1) {
        var halfIntervalY = Math.round(_opts.intervalY / 2);
        var roundedIntervalY = Math.round(_top % _opts.intervalY);
        _top = (roundedIntervalY < halfIntervalY) ? (_top - roundedIntervalY) : (_top + (_opts.intervalY - roundedIntervalY));
      }
      if (_opts.container && _opts.container.offsetWidth) {
        _left = Math.max(0, Math.min(_left, _opts.container.offsetWidth - src.offsetWidth));
        _top = Math.max(0, Math.min(_top, _opts.container.offsetHeight - src.offsetHeight));
      }
      if (typeof _currentX === "number") {
        if (((_left - _currentX) > _opts.toleranceX || (_currentX - (_left + src.offsetWidth)) > _opts.toleranceX) || ((_top - _currentY) > _opts.toleranceY || (_currentY - (_top + src.offsetHeight)) > _opts.toleranceY)) {
          _left = _originalX;
          _top = _originalY;
        }
      }
      src.style.left = !_opts.restrictX && !prevent ? _left + "px" : src.style.left;
      src.style.top = !_opts.restrictY && !prevent ? _top + "px" : src.style.top;
    }

    /**
     * Handles the mousemove event.
     * @param {event} ev The event data sent by the browser.
     * @private
     */
    function _mouseMove(ev) {
      var e = ev || event;
      _currentX = _formerX + ((_getFormerMouseX(e)) - _formerMouseX);
      _currentY = _formerY + ((_getFormerMouseY(e)) - _formerMouseY);
      _formerX = _currentX;
      _formerY = _currentY;
      _formerMouseX = _getFormerMouseX(e);
      _formerMouseY = _getFormerMouseY(e);
      if (_dragging) {
        _moveTo(_currentX, _currentY, _preventDefault);
        _opts.onDragging({
          mouseX: _formerMouseX,
          mouseY: _formerMouseY,
          startLeft: _originalX,
          startTop: _originalY,
          event: e
        });
      }
    }

    /**
     * Handles the mousedown event.
     * @param {event} ev The event data sent by the browser.
     * @private
     */
    function _mouseDown(ev) {
      var e = ev || event;
      _setCursor(true);
      _opts.onMouseDown(e);
      if (src.style.position !== "absolute") {
        src.style.position = "absolute";
        return;
      }
      _formerMouseX = _getFormerMouseX(e);
      _formerMouseY = _getFormerMouseY(e);
      _originalX = src.offsetLeft;
      _originalY = src.offsetTop;
      _formerX = _originalX;
      _formerY = _originalY;
      _target.addEventListener("mousemove", _mouseMove);
      if (src.setCapture) {
        src.setCapture();
      }
      if (e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        e.cancelBubble = true;
        e.returnValue = false;
      }
      _dragging = true;
      _opts.onDragStart({
        mouseX: _formerMouseX,
        mouseY: _formerMouseY,
        startLeft: _originalX,
        startTop: _originalY,
        event: e
      });
    }

    /**
     * Handles the mouseup event.
     * @param {event} ev The event data sent by the browser.
     * @private
     */
    function _mouseUp(ev) {
      var e = ev || event;
      if (_dragging) {
        _setCursor(false);
        _target.removeEventListener("mousemove", _mouseMove);
        if (src.releaseCapture) {
          src.releaseCapture();
        }
        _dragging = false;
        _opts.onDragEnd({
          mouseX: _formerMouseX,
          mouseY: _formerMouseY,
          startLeft: _originalX,
          startTop: _originalY,
          event: e
        });
      }
      _currentX = _currentY = null;
      _opts.onMouseUp(e);
    }

    function _getFormerMouseX(e) {
      return e.pageX || (e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft);
    }

    function _getFormerMouseY(e) {
      return e.pageY || (e.clientY + document.body.scrollTop + document.documentElement.scrollTop);
    }

    function _dumbFunction(e) {}

    /**
     * Move the element {@link src} to the given location.
     * @param {Point} point An object with an x and y property
     *     that represents the location to move to.
     */
    self.moveTo = function(point) {
      _moveTo(point.x, point.y, false);
    };

    /**
     * Move the element {@link src} by the given amount.
     * @param {Size} size An object with an x and y property
     *     that represents distance to move the element.
     */
    self.moveBy = function(size) {
      _moveTo(src.offsetLeft + size.width, src.offsetHeight + size.height, false);
    };

    /**
     * Sets the cursor for the dragging state.
     * @param {String} cursor The name of the cursor to use.
     */
    self.setDraggingCursor = function(cursor) {
      _draggingCursor = cursor;
      _setCursor(_dragging);
    };

    /**
     * Sets the cursor for the draggable state.
     * @param {String} cursor The name of the cursor to use.
     */
    self.setDraggableCursor = function(cursor) {
      _draggableCursor = cursor;
      _setCursor(_dragging);
    };

    /**
     * Returns the current left location.
     * @return {Number}
     */
    self.left = function() {
      return _left;
    };

    /**
     * Returns the current top location.
     * @return {Number}
     */
    self.top = function() {
      return _top;
    };

    /**
     * Returns the number of intervals the element has moved
     *     along the X axis. Useful for scrollbar type
     *     applications.
     * @return {Number}
     */
    self.getValueX = function() {
      var i = _opts.intervalX || 1;
      return Math.round(_left / i);
    };

    /**
     * Returns the number of intervals the element has moved
     *     along the Y axis. Useful for scrollbar type
     *     applications.
     * @return {Number}
     */
    self.getValueY = function() {
      var i = _opts.intervalY || 1;
      return Math.round(_top / i);
    };

    /**
     * Sets the left position of the draggable object based on
     *     intervalX.
     * @param {Number} value The location to move to.
     */
    self.setValueX = function(value) {
      _moveTo(value * _opts.intervalX, _top, false);
    };

    /**
     * Sets the top position of the draggable object based on
     *     intervalY.
     * @param {Number} value The location to move to.
     */
    self.setValueY = function(value) {
      _moveTo(_left, value * _opts.intervalY, false);
    };

    /**
     * Prevents the default movement behavior of the object.
     *     The object can still be moved by other methods.
     */
    self.preventDefaultMovement = function(prevent) {
      _preventDefault = prevent;
    };
  }
  /**
   * @name DraggableObjectOptions
   * @class This class represents the optional parameter passed into constructor of
   * <code>DraggableObject</code>.
   * @property {Number} [top] Top pixel
   * @property {Number} [left] Left pixel
   * @property {HTMLElement} [container] HTMLElement as container.
   * @property {String} [draggingCursor] Dragging Cursor
   * @property {String} [draggableCursor] Draggable Cursor
   * @property {Number} [intervalX] Interval in X direction
   * @property {Number} [intervalY] Interval in Y direction
   * @property {Number} [toleranceX] Tolerance X in pixel
   * @property {Number} [toleranceY] Tolerance Y in pixel
   * @property {Boolean} [restrictX] Whether to restrict move in X direction
   * @property {Boolean} [restrictY] Whether to restrict move in Y direction
   */
});
