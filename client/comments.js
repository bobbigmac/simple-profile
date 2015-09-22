
Template.comments.helpers({
	comments: function() {
		var linkId = this.link && this.link._id;
		return Comments.find({ link: linkId }, { sort: { created: 1 }});
	}
});

Template.comment.helpers({
	hasLink: function() {
		var links = getUrlsFromText(this.text);
		return (links && links.length);
	},
	hasOneLink: function() {
		var links = getUrlsFromText(this.text);
		//console.log(links);
		return (links && links.length === 1);
	},
	linked: function() {
		splitUrlsFromText(this.text);
	},
	delinked: function() {
		var links = getUrlsFromText(this.text);
		if(links && links.length) {
			var notLinked = getNotUrlsFromText(this.text, links);
			return (notLinked && (notLinked+'').trim()) || this.text;
		}
		return this.text;
	},
	firstLink: function() {
		var links = getUrlsFromText(this.text);
		return (links && links[0]);
	}
});

Template.comment.events({
	'click .remove-comment': function(event, template) {
		Comments.remove({ _id: this._id });
	}
});