
var getActivitiesCursor = function(listIds, readUntil) {
	if(listIds && listIds instanceof Array && listIds.length) {
		var options = { sort: { created: -1 }, limit: 100 };
		var filter = {
			list: { '$in': listIds },
			subject: { $nin: ['like'] },
			action: { $nin: ['removed'] }
		};
		if(readUntil) {
			filter.created = { $gt: readUntil };
		}
		return Activities.find(filter, options);
	}
};

Meteor.publish('unread-activities-count', function(listIds, readUntil) {
	var activitiesCursor = getActivitiesCursor(listIds, readUntil);
	if(activitiesCursor) {
		var res = Counts.publish(this, 'unread-activities', activitiesCursor);
	}
	this.ready();
	return;
});

Meteor.publish('activities', function(listIds, readUntil) {
	var activitiesCursor = getActivitiesCursor(listIds, readUntil);
	if(activitiesCursor) {
		return activitiesCursor;
	}
	this.ready();
	return;
});

Meteor.publish('lists', function(listId) {
	var filter = { public: true };
	if(listId) {
		filter._id = listId;
	}
	return Lists.find(filter);
});

Meteor.publish('link-titles', function(linkIds) {
	if(linkIds && linkIds instanceof Array) {
		return Links.find({ _id: { '$in': linkIds }}, { fields: { title: 1 }});
	}
	this.ready();
	return;
});

Meteor.publish('list-names', function(listIds) {
	if(listIds && listIds instanceof Array) {
		return Lists.find({ _id: { '$in': listIds }}, { fields: { name: 1/*, image: 1, 'scanned.image': 1, 'scanned.images.0': 1*/ }});
	}
	this.ready();
	return;
});

Meteor.publish('links', function(listId, linkId) {
	var owner = Meteor.users.findOne({ 'roles': 'admin' });

	var filter =  {};
	if(listId) {
		filter.listId = listId;
	}
	if(linkId) {
		filter._id = linkId;
	}

	if(owner && this.userId && owner._id === this.userId) {
		//userIsOwner, return all.
	} else {
		filter.archived = { $ne: true };
		filter.private = { $ne: true };
	}

	return Links.find(filter, {});
});

Meteor.publish('owner', function() {
	return Meteor.users.find({ 'roles': 'admin' }, {
		fields: { _id: 1, username: 1, profile: 1, roles: 1 }
	});
});

Meteor.publish('owners', function(ownerIds) {
	if(ownerIds && ownerIds instanceof Array) {
		return Meteor.users.find({ _id: { '$in': ownerIds }}, { fields: { _id: 1, username: 1, 'profile.email_hash': 1 }});
	}
	this.ready();
	return;
});

Meteor.publish('link-comments', function(linkIds) {
	if(linkIds && linkIds instanceof Array) {
		return Comments.find({ link: { '$in': linkIds }}, { sort: { created: -1 }});
	}
	this.ready();
	return;
});