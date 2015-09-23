
var setMetaCommentAdded = function(activity, doc, fields, modifier) {
	activity.action = 'added';
	activity.comment = doc._id;
	return activity;
};

var setMetaCommentRemoved = function(activity, doc, fields, modifier) {
	activity.action = 'removed';
	activity.comment = doc._id;
	return activity;
};

Comments.permit('insert')
	.ifHasRole('basic')
	.setOwnerUser()
	.docHasProperty(['link'])
	.log(['link', 'comment', setMetaCommentAdded])
	.apply();

Comments.permit('update')
	.ifHasRole('basic')
	.ownerIsLoggedInUser()
	.apply();

Comments.permit('update')
	.ifHasRole('admin')
	.apply();

Comments.permit('remove')
	.ownerIsLoggedInUser()
	.log(['link', 'comment', setMetaCommentRemoved])
	.apply()