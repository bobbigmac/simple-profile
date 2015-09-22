
var isScrolledIntoView = function(elem) {
	var $elem = $(elem);
	var $window = $(window);

	var docViewTop = $window && $window.scrollTop();
	var docViewBottom = $window && (docViewTop + $window.height());

	var elemTop = $elem && $elem.offset() && $elem.offset().top;
	var elemBottom = $elem && (elemTop + $elem.height());

	return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
};

var checkIsScrolled = function(event) {
	var nodes = $('.check-scroll');
	if(nodes) {
		nodes.each(function(pos, node) {
			node = $(node);
			var isInView = isScrolledIntoView(node);
			if(isInView) {
				node.addClass('in-view');
				node.removeClass('out-view');
			} else {
				node.removeClass('in-view');
				node.addClass('out-view');
			}
		});
	}
};

//TODO: Do something cool with content visibility when listItem is in view

// Template.list.rendered = function(e, t) {
// 	//initial check, then bind it for scroll and resize;
// 	checkIsScrolled();
// 	$(document).off('scroll').on('scroll', checkIsScrolled);
// 	$(document).off('resize').on('resize', checkIsScrolled);
// };