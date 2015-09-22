
Template.activities.events({
	'click .mark-read': function(event, template) {
		var userId = Meteor.userId();
		if(userId) {
			Meteor.users.update({ _id: userId }, {
				$set: { 'profile.readUntil': this.created }
			});
		}
	},
	'click .reset-read': function(event, template) {
		var userId = Meteor.userId();
		if(userId) {
			Meteor.users.update(userId, { $unset: { 'profile.readUntil': "" }});
		}
	}
});

Template.activities.helpers({
	user: function() {
		return this.user && Meteor.users.find({ _id: this.user });
	},
	linkTitle: function(linkId) {
		var link = Links.findOne({ _id: linkId });
		return ((link && link.title) || linkId);
	},
	linkImage: function(linkId) {
		var link = Links.findOne({ _id: linkId });
		return (link && link.scanned && (link.scanned.image || (link.scanned.images && link.scanned.images[0])));
	},
	listName: function(listId) {
		var list = Lists.findOne({ _id: listId });
		return ((list && list.name) || listId);
	},
	collated: function() {
		var items = [];
		this.fetch().forEach(function(activity) {
			var subItem = {
				_id: activity._id,
				subject: activity.subject,
				created: activity.created,
				action: activity.action,
				meta: activity.meta
			}

			var found = false;
			if(items.length) {
				if(items[items.length-1].link == activity.link &&
					items[items.length-1].list == activity.list &&
					items[items.length-1].user == activity.user) {
					
					found = true;
					items[items.length-1].created == activity.created;
				}
			}
			if(!found) {
				items.push({
					list: activity.list,
					link: activity.link,
					user: activity.user,
					created: activity.created,
					activities: []
				});
			}
			items[items.length-1].activities.push(subItem);
		});
		//console.log(items);
		return items;
	}
});