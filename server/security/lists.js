var setListEditMeta = function(activity, doc, fields, modifier) {
	activity.meta = fields.join(',');
	return activity;
}

Lists.permit('insert')
	.ifHasRole('admin')
	.setOwnerUser()
	//.log([false, "created"])
	.apply();

Lists.permit('update')
	.ifHasRole('admin')
	.ownerIsLoggedInUser()
	.onlyProps(['public', 'name', 'description', 'order'])
	.log([false, "edited", setListEditMeta])
	.apply();

Lists.permit('remove')
	.ownerIsLoggedInUser()
	.log([false, "delete", "deleted"])
	.apply()