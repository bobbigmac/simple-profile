Router.configure({
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  layoutTemplate: 'layout'
});

var currentUser = {
  ready: function() {
    var user = Meteor.user();
    return (user === null || typeof user !== "undefined");
  }
};

Router.route('/activity', {
	name: 'activities',
	waitOn: function() {
		return [
			currentUser,
			Meteor.subscribe('owner'),
		];
	},
	data: function() {
		setOwnerBrand();
		
		var activitiesCursor = Activities.find({}, { sort: { created: -1 }});

		Tracker.autorun(function () {
			var filter = {};
			var user = Meteor.user();
			var listIds = Lists.find().fetch().map(function(list) {
				return list._id;
			});
			var readUntil = (user && user.profile && user.profile.readUntil);

			Session.set('page-title', listIds.length+' lists');

			//TODO: Subscribe to all owned lists by default.
			Meteor.subscribe('activities', readUntil);
			Meteor.subscribe('unread-activities-count', readUntil);

			var owners = {};
			var lists = {};
			var links = {};
			activitiesCursor.fetch().forEach(function(activity) {
				if(!lists[activity.list]) {
					lists[activity.list] = true;
				}
				if(!links[activity.link]) {
					links[activity.link] = true;
				}
				if(!owners[activity.user]) {
					owners[activity.user] = true;
				}
			});

			Meteor.subscribe('list-names', Object.keys(lists));
			Meteor.subscribe('link-titles', Object.keys(links));
			Meteor.subscribe('owners', Object.keys(owners));
		});

		return activitiesCursor;
	},
	fastRender: true
});

Router.route('/', {
	name: 'lists',
	waitOn: function () {
		return [
			currentUser,
			Meteor.subscribe('owner'),
			Meteor.subscribe('lists'),
			Meteor.subscribe('links'),
			Meteor.subscribe('images')
		];
	},
	data: function() {
		setOwnerBrand();

		var filter = {};

		var listsCursor = Lists.find(filter, { sort: { order: 1 }});
		Tracker.autorun(function() {

			var user = Meteor.user();

			linkIds = Links.find().fetch().map(function(link) {
				return link._id;
			});

			Meteor.subscribe('link-comments', linkIds);
			Meteor.subscribe('unread-activities-count', user && user.profile && user.profile.readUntil);

			var commentOwners = {};
			Comments.find().fetch().map(function(comment) { 
				commentOwners[comment.owner] = true; 
				return comment.owner;
			});

			Meteor.subscribe('owners', Object.keys(commentOwners));
		});

		return listsCursor;
	},
  fastRender: true
});

//TODO: This is going to need to some tweaking
// Router.route('/list/:_id/:link?', {
// 	name: 'list',
// 	template: 'lists',
// 	waitOn: function() {
// 		if(this.params._id) {
// 			return [
// 				currentUser,
// 				Meteor.subscribe('owner'),
// 				Meteor.subscribe('lists', this.params._id),
// 				Meteor.subscribe('links', this.params._id, this.params.link)
// 			];
// 		}
// 	},
// 	data: function() {
		// setOwnerBrand();
// 		return Lists.find({});
// 	}
// });