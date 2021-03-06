/**
 * Parent class for the different annotation types.
 * @constructor
 */
function SuperShape() {
  /** @type {Boolean} Indicates validity of the shape */
  this.valid = false;
  /** @type {Array} The array of points defining the shape */
  this.pts = [];
  /** @type {String} Indicates the type of the shape, e.g. "rect" */
  this.type = 'none';
}

SuperShape.fn = SuperShape.prototype;

/*jshint unused:vars*/
// Available functions for shapes with default/empty defns

/**
 * Invalidates the shape
 * @memberOf SuperShape#
 * @method   invalidate
 */
SuperShape.fn.invalidate  = function() {this.valid = false;};

/**
 * Determines if the shape is valid.
 * @return {Boolean} Whether the shape is valid.
 * @memberOf SuperShape#
 * @method   isValid
 */
SuperShape.fn.isValid     = function() {return this.valid;};

/**
 * Adds a point to the shape.
 * @abstract 
 * @param {Object} pt
 * @return {Boolean} False if the shape is complete
 * @memberOf SuperShape#
 * @method   addPt
 */
SuperShape.fn.addPt       = function(pt) {return false;};

/**
 * Modifies the last point to match the input.
 * @abstract
 * @param  {Object} pt
 * @memberOf SuperShape#
 * @method   modLastPt
 */
SuperShape.fn.modLastPt   = function(pt) {};

/**
 * Modifies the point at the given index to match the input.
 * @abstract
 * @param  {Number} ind
 * @param  {Object} pt
 * @memberOf SuperShape#
 * @method   modPt
 */
SuperShape.fn.modPt       = function(ind, pt) {};

/**
 * Inserts a point after the given index.
 * @abstract
 * @param  {Number} ind
 * @param  {Object} pt
 * @memberOf SuperShape#
 * @method   insPt
 */
SuperShape.fn.insPt       = function(ind, pt) {};

/**
 * Deletes the point at the given index.
 * @abstract
 * @param  {Number} ind
 * @memberOf SuperShape#
 * @method   delPt
 */
SuperShape.fn.delPt       = function(ind) {};

/**
 * Gets an array of points to draw - called by the {@link CanvasHelper}.
 * @abstract
 * @return {Array} Array of points to draw
 * @memberOf SuperShape#
 * @method   getDrawPts
 */
SuperShape.fn.getDrawPts  = function() {return [];};

/**
 * Gets the export data for the annotation.
 * @abstract
 * @return {Object} Data for export to client application
 * @memberOf SuperShape#
 * @method   getExport
 */
SuperShape.fn.getExport   = function() {return {};};

/**
 * Gets the number of points in the shape.
 * @return {Number} Number of points
 * @memberOf SuperShape#
 * @method   getNumPts
 */
SuperShape.fn.getNumPts   = function() {return this.pts.length;};

/**
 * Gets the points array as the user will interact with them - see {@link SuperShape#getDrawPts} for points to be drawn.
 * @return {Array} Array of points
 * @memberOf SuperShape#
 * @method   getPts
 */
SuperShape.fn.getPts      = function() {return this.pts;};

/**
 * Whether or not a point can be inserted into the shape.
 * @abstract
 * @return {Boolean}
 * @memberOf SuperShape#
 * @method   canInsPt
 */
SuperShape.fn.canInsPt    = function() {return false;};

/**
 * Calculates the rectangular boudns of a shape. The default implementation of this method should suffice for most shapes.
 * @return {Object}
 * @memberOf SuperShape#
 * @method   getBounds
 */
SuperShape.fn.getBounds   = function() {
  if (this.pts.length === 0) {
    return null;
  }

  var out = {};
  out.x0 = this.pts[0].x;
  out.y0 = this.pts[0].y;
  out.x1 = out.x0;
  out.y1 = out.y0;

  for (var i = 1; i < this.pts.length; i++) {
    var pt = this.pts[i];
    out.x0 = Math.min(out.x0, pt.x);
    out.x1 = Math.max(out.x1, pt.x);
    out.y0 = Math.min(out.y0, pt.y);
    out.y1 = Math.max(out.y1, pt.y);
  }

  return out;
};

/*jshint unused:true*/

module.exports = SuperShape;
