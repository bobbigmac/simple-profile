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
			currentUser
		];
	},
	data: function() {
		setOwnerBrand();
		
		var activitiesCursor = Activities.find({}, { sort: { created: -1 }});

		Tracker.autorun(function () {
			var filter = {};
			var user = Meteor.user();
			var subscriptions = Lists.find().fetch().map(function(list) {
				return list._id;
			});
			var readUntil = (user && user.profile && user.profile.readUntil);
			
			Session.set('page-title', subscriptions.length+' subscriptions');

			//TODO: Subscribe to all owned lists by default.
			Meteor.subscribe('activities', subscriptions, readUntil);
			Meteor.subscribe('unread-activities-count', subscriptions, readUntil);

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
		];
	},
	data: function() {
		setOwnerBrand();

		var filter = {};

		var lists = Lists.find(filter, { sort: { order: 1 }});
		Tracker.autorun(function() {
			commentIds = Links.find().fetch().map(function(link) {
				return link._id;
			});
			Meteor.subscribe('link-comments', commentIds);
		});

		return lists;
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