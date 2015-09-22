
var parsers = [
	// {
	// 	match: ".*\\.?somesite\\.co.*\\??.*",
	// 	paths: {
	// 		title: { path: 'title', content: true },
	// 	}
	// },
];

Meteor.startup(function() {
	if(typeof ScrapeParser !== 'undefined') {
		parsers.forEach(function(parser) {
			if(parser.match && parser.paths) {
				var savedParser = ScrapeParser.parser(parser.match, parser.paths);
				//console.log(savedParser._id, 'added for', savedParser.match, Object.keys(savedParser.paths).length, 'fields');
			}
		});

		Links.find({
			url: { $exists: true }, 
			scanning: { $exists: false },
			scanned: { $exists: false }
		}).observe({
		  added: function(link) {
		  	console.log('Scanning', link.url);
		  	
		  	Links.update({ _id: link._id }, { $set: {
		  		scanning: true
		  	}});

		  	var scanned = ScrapeParser.get(link.url);
		  	//console.log(link.url, 'scanned', Object.keys(scanned));

		  	Links.update({ _id: link._id }, { $set: {
		  		image: scanned.image,
		  		title: scanned.title,
		  		description: scanned.description,
		  		scanning: false,
		  		scanned: scanned 
		  	}});
		  }
		});
	}
});
