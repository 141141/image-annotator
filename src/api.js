// API endpoint definition //

(function( $ ) {

  // The annotator function - appplicable to any jQuery object collection
  $.fn.annotator = function(input) {
    var w, h;

    if (typeof input.src === "undefined") {
      throw "Error: Input src (image source) is required";
    }

    if (typeof input.features === "undefined") {
      throw "Error: Input feature array is required";
    }
    else if (!input.features instanceof Array) {
      throw "Error: input.features is not a valid Array instance";
    }

    if (typeof input.width === "undefined")   {w = 640;}
    else                                      {w = input.width;}

    if (typeof input.width === "undefined")   {h = 480;}
    else                                      {h = input.height;}

    // Check for annotator class
    var $parent = $(this);
    var a;

    // Update if we're passed an existing annotator
    if ($parent.hasClass("annotator")) {
      a = $parent.data("Annotator");
      a.update(input.src, w, h);
    }
    else {
      a = new Annotator(input.src, w, h);
      a.parent = $parent;
      a.build($parent);
    }

    // Apply input
    a.featuresIn(input);
    a.attsIn(input);
    a.cssIn(input);

    a.updateControls();
    a.updateTitle();

    return a;
  };

}(jQuery));