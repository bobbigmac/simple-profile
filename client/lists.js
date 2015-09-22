
Template.lists.helpers({
	recentLists: function() {
		var userId = Meteor.userId();
		if(userId) {
			var profile = Meteor.user().profile;
			var dates = {};
			var listIds = profile && profile.views && profile.views.map(function(view) {
				dates[view._id] = view.date;
				return view._id;
			});

			if(listIds && listIds instanceof Array && listIds.length > 1) {
				var lists = Lists.find({ _id: { $in: listIds }
			}, { 
					fields: { _id: 1, name: 1, 'public': 1 }
				}).fetch().map(function(list) {
					list.order = dates[list._id];
					return list;
				});
				return lists.sort(function(a, b) {
					return a.order > b.order ? -1 : 1;
				});
			}
		}
	},
	ownerLists: function() {
		var userId = Meteor.userId();
		if(userId) {
			return Lists.find({ owner: userId });
		}
	},
	publicLists: function() {
		var filter = { 'public': true };
		var userId = Meteor.userId();
		if(userId) {
			filter.owner = { $ne: userId };
		}
		return Lists.find(filter);
	}
});