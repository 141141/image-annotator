// Annotation helper class definition //

// This deals with managing the annotation data,
// doing import/export etc

function AnnHelper(parent) {
  this.parent = parent;

  // Features
  this.ftrs = [];
  this.fInd = 0;
  this.aInd = 0;

  // Annotations
  this.anns = [createAnnotation("rect")];
  this.curType = "rect";

  // Drawing
  this.pInd = 0;
}
AnnHelper.fn = AnnHelper.prototype;

AnnHelper.fn.getAnn = function() {
  return this.anns[this.aInd];
};

AnnHelper.fn.setAnn = function(ann) {
  this.anns[this.aInd] = ann;
};

AnnHelper.fn.getFtr = function() {
  return this.ftrs[this.fInd];
};

// Resets to default state
AnnHelper.fn.reset = function() {
  // Reset annotation
  this.anns = [createAnnotation(this.curType)];
  this.aInd = 0;

  // Reset features
  this.fInd = 0;
  this.ftrs = [];
};

//////////////////////////////////////////////////////
// Data import / export

// Feature import
AnnHelper.fn.addFtrData = function(ftr) {
    this.ftrs.push(new Feature(ftr.name, ftr.required, ftr.shape));
};

AnnHelper.fn.importFeatures = function(input) {
  // Clear existing
  this.ftrs = [];

  for (var i = 0; i < input.length; i++) {
    this.addFtrData(input[i]);
  }

  this.ftrChanged();
};

// Annribute import - Depends on previous feature import
AnnHelper.fn.importAnns = function(anns) {
  // Iterate features
  for (var i = 0; i < this.ftrs.length; i++) {
    var f = this.ftrs[i];
    f.anns = [];

    if (typeof anns[f.name] === 'undefined') {
      continue; // Skip feature if there was no input annribute data
    }

    var input = anns[f.name];
    var shapes = input.shapes;

    for (var j = 0; j < shapes.length; j++) {
      var s = shapes[j];

      // Generate each annotation from input data
      var ann = createAnnotation(s.type);
      ann.valid = true;

      if (s.type === 'rect') {
        ann.pts[0] = s.pos;
        ann.pts[1] = {x : s.pos.x+s.size.width, y : s.pos.y+s.size.height};
      }
      else {
        ann.pts = s.points;
      }

      f.anns.push(ann);
    }
  }

  // Recapture current feature/annotation
  this.anns = this.getFtr().anns;
  this.parent.showChange();
};

// Annotation export
AnnHelper.fn.exportAnns = function() {
  // Empty output object
  var out = {};

  // Iterate the features
  for (var i = 0; i < this.ftrs.length; i++) {
    var f = this.ftrs[i];

    // Store shapes
    out[f.name] = {};
    out[f.name].shapes = [];

    // Iterate the annotatons for the feature
    for (var j = 0; j < f.anns.length; j++) {
      var ann = f.anns[j];

      // Check it's a valid shape
      if (typeof ann === 'undefined') {
        continue;
      }
      else if (!ann.valid) {
        continue;
      }

      // Get the export data from the shape
      var s = ann.getExport();
      out[f.name].shapes.push(s);
    }
  }

  return out;
};


//////////////////////////////////////////////////////
// Feature selection

// Common to feature changes
AnnHelper.fn.ftrChanged = function() {
  // Lock/unlock shape selection
  var lock = this.getFtr().shape !== "any";
  this.parent.lockSelect(this.getFtr().shape, lock);

  if (lock) {
    this.curType = this.getFtr().shape;
  }

  // Update annotations to match
  this.anns = this.getFtr().anns;
  this.aInd = 0;

  // Create an empty shape if there is none
  if (this.anns.length === 0) {
    this.anns.push(createAnnotation(this.curType));
  }

  // Update UI
  this.parent.showChange();
};

// Select the next feature
AnnHelper.fn.nextFtr = function() {
  this.fInd++;

  if (this.fInd >= this.ftrs.length) {
    this.fInd = this.ftrs.length - 1;
  }

  this.ftrChanged();
};

// Select the previous feature
AnnHelper.fn.prevFtr = function() {
  this.fInd--;

  if (this.fInd < 0) {
    this.fInd = 0;
  }

  this.ftrChanged();
};


//////////////////////////////////////////////////////
// Annotation selection

// Invalidates the current annotation -
// it will be removed when the next switch
// occurs
AnnHelper.fn.delAnn = function() {
  this.getAnn().invalidate();
};

// Select next annotation/start a new one
// Jumps to next ann index, creates a new annotation
// if we hit the end of the list
AnnHelper.fn.nextAnn = function() {
  this.aInd++;

  if (this.aInd === this.anns.length) {
    this.anns.push(createAnnotation(this.curType));
  }

  this.clrInvalid();
  this.parent.showChange();
};

// Select previous annotation, if one exists
AnnHelper.fn.prevAnn = function() {
  this.aInd--;

  if (this.aInd < 0) {
    this.aInd = 0;
  }

  this.clrInvalid();
  this.parent.showChange();
};


//////////////////////////////////////////////////////
// Annotation generation

AnnHelper.fn.newAnn = function() {
  this.aInd = this.anns.length - 1;
  this.nextAnn();
  return this.getAnn();
};


//////////////////////////////////////////////////////
// Annotation UI

// Picks the closest annotation point to
// the given image-space point
// Returns it, its index in the shape, and
// the annotation object itself
AnnHelper.fn.pickPt = function(x, y) {
  var pick = {};
  pick.pt = null;
  pick.dist = Infinity;
  pick.ann = null;

  for (var f = 0; f < this.ftrs.length; f++) {
    var anns = this.ftrs[f].anns;
    for (var a = 0; a < anns.length; a++) {
      var ann = anns[a];
      var pts = ann.getPts();
      for (var p = 0; p < pts.length; p++) {
        // (For every point currently in the annotator)
        var pt = pts[p];
        var d = Math.sqrt(Math.pow(x-pt.x,2) + Math.pow(y-pt.y,2));

        if (d < pick.dist) {
          pick.dist = d;
          pick.pt = pt;
          pick.ann = ann;
        }
      }
    }
  }

  return pick;
};

// Pick the closest annotation line to
// the given image-space point
// Returns the closest point on the line, the
// annotation which holds the line, and the indices
// of the endpoints which define the line
AnnHelper.fn.pickLn = function(x, y) {
  var pick = {};
  pick.pt = null;
  pick.dist = Infinity;
  pick.ann = null;
  pick.i0 = 0;
  pick.i1 = 0;

  for (var f = 0; f < this.ftrs.length; f++) {
    var anns = this.ftrs[f].anns;
    for (var a = 0; a < anns.length; a++) {
      var ann = anns[a];
      var pts = ann.getDrawPts();
      for (var p = 0; p < pts.length-1; p++) {
        // (For every line currently in the annotator)
        var i0 = p;
        var i1 = p+1;

        // These points define the line
        var p0 = pts[i0];
        var p1 = pts[i1];

        // 'u' defines a percentage along the line the closest point lies at
        var u = ((x - p0.x)*(p1.x - p0.x) + (y - p0.y)*(p1.y - p0.y)) /
                (Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
        u = Math.min(Math.max(u, 0), 1); // limit the range of 'u'

        // 'pu' is the closest point on the line
        var pu = {};
        pu.x = p0.x + u*(p1.x - p0.x);
        pu.y = p0.y + u*(p1.y - p0.y);

        var d = Math.sqrt(Math.pow(x-pu.x,2) + Math.pow(y-pu.y,2));

        // We're finding the closest "closest point"
        if (d < pick.dist) {
          pick.dist = d;
          pick.pt = pu;
          pick.ann = ann;
          pick.i0 = i0;
          pick.i1 = i1;
        }
      }
    }
  }

  return pick;
};


//////////////////////////////////////////////////////
// Misc functions

// Type selection
AnnHelper.fn.changeType = function(type) {
  this.curType = type;
};

// Clears invalid annotations
AnnHelper.fn.clrInvalid = function() {
  for (var i = 0; i < this.anns.length; i++) {
    if (i === this.aInd) {
      continue;
    }

    var ann = this.anns[i];

    if (!ann.valid) {
      this.anns.splice(i, 1);
      if (this.aInd > i) {
        this.aInd--;
      }
    }
  }
};
