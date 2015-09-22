
// Allow users to register
Security.permit('insert')
	.collections([Meteor.users])
	.apply();

// Allow user to remove their own user account.
// TODO: Remove if you want to archive them instead.
Security.permit('remove')
	.collections([Meteor.users])
	.idIsLoggedInUser()
	.apply();

// Allow user to update their own account profile properties
Security.permit('update')
	.collections([Meteor.users])
	.onlyProps(['profile'])
	.idIsLoggedInUser()
	.apply();

// Allow admin to update any user
Security.permit('update')
	.collections([Meteor.users])
	.ifHasRole('admin')
	.apply();