
Images.deny({
	insert: function(userId) { return !(userId && Roles.userIsInRole(userId, ['admin'])); },
	update: function(userId) { return !(userId && Roles.userIsInRole(userId, ['admin'])); },
	remove: function(userId) { return !(userId && Roles.userIsInRole(userId, ['admin'])); },
	download: function(userId, fileObj) { /*console.log('deny', userId);*/ return false; }
});

Images.allow({
	insert: function(userId) { return (userId && Roles.userIsInRole(userId, ['admin'])); },
	update: function(userId) { return (userId && Roles.userIsInRole(userId, ['admin'])); },
	remove: function(userId) { return (userId && Roles.userIsInRole(userId, ['admin'])); },
	download: function(userId, fileObj) { /*console.log('userId', allow);*/ return true; }
});
