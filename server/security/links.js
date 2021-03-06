
var setLikeActivity = function(activity, doc, fields, modifier) {
	var liked = false;
	var likables = (modifier['$addToSet'] && Object.keys(modifier['$addToSet']).map(function(key) {
		liked = true;
		return key && key.split && key.split('.')[1];
	}));
	activity.action = (liked ? 'added' : 'removed');
	activity.meta = likables;
	return activity;
}

var setArchiveActivity = function(activity, doc, fields, modifier) {
	activity.action = (modifier['$set'] && (modifier['$set'].archived || modifier['$set'].private) ? 'set' : 'unset');
	return activity;
}

var setImagesActivity = function(activity, doc, fields, modifier) {
	if(modifier['$pull'] && modifier['$pull'].images) {
		activity.action = 'remove';
	}
	if(modifier['$push'] && modifier['$push'].images) {
		activity.action = 'add';
	}
	if(modifier['$addToSet'] && modifier['$addToSet'].images) {
		activity.action = 'add';
	}
	return activity;
}

var setLinkEditMeta = function(activity, doc, fields, modifier) {
	activity.meta = fields.join(',');
	return activity;
}

Links.permit('insert')
	.ifHasRole('admin')
	.setOwnerUser()
	.log(['_id', 'link', 'added'])
	.apply();

Links.permit('update')
	.ifHasRole('admin')
	.ownerIsLoggedInUser()
	.onlyProps(['likes'])
	.likesIsLoggedInUser()
	.log(['_id', 'like', setLikeActivity])
	.apply();

Links.permit('update')
	.ifHasRole('admin')
	.ownerIsLoggedInUser()
	.onlyProps(['archived', 'private'])
	.log(['_id', 'archive', setArchiveActivity])
	.apply();

Links.permit('update')
	.ifHasRole('admin')
	.ownerIsLoggedInUser()
	.onlyProps(['images'])
	.log(['_id', 'image', setImagesActivity])
	.apply();

Links.permit('update')
	.ifHasRole('admin')
	.ownerIsLoggedInUser()
	.onlyProps(['url'])
	.log([false, "edited", setLinkEditMeta])
	.apply();

Links.permit('remove')
	.ownerIsLoggedInUser()
	.log(['_id', 'link', 'removed'])
	.apply()
	
Links.permit('remove')
	.linkListOwnerIsLoggedInUser()
	.log(['_id', 'link', 'removed'])
	.apply()