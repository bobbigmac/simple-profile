

if (Meteor.isServer) {
	Meteor.startup(function () {
	
		var existingUser = Meteor.users.findOne({});
		var activeOwner = false;
		if(existingUser)
		{
			activeOwner = existingUser._id;
		}
		
		SocialLinks.deny({
			insert: function (userId, doc) {
				if(!userId || userId !== Meteor.userId())
				{
					return true;
				}
				else
				{
					doc.creator = userId;
				}
			},
			fetch: ['_id', 'creator']
		});
		
		SocialLinks.allow({
			insert: function (userId, doc) {
				console.log('checking', userId, doc);
				if(userId && doc.creator == userId && activeOwner == userId)
				{
					return true;
				}
			},
			update: function (userId, doc, fields, modifier) {
				console.log('checking', userId, doc);
				if(doc.creator == userId && !_.contains(fields, 'creator') && activeOwner == userId)
				{
					return  true;
				}
			},
			remove: function(userId, doc) {
				console.log('checking', userId, doc);
				if(userId && doc.creator == userId && activeOwner == userId)
				{
					return true;
				}
			},
			fetch: ['_id', 'creator']
		});
		
		SocialEntries.allow({
		});
		
		Meteor.methods({
		});
		
		Meteor.publish('feedSocialLinks', function(filter) {
			if(filter)
			{
				//console.log(filter);
			}
			return SocialLinks.find({}, { order: { dateAdded: -1 } });
		});
		
		Accounts.validateNewUser(function (user) {
			blackListNames = ['root'];
			if(user.username && user.username.length >= 5 && blackListNames.indexOf(user.username) > -1)
			{
				activeOwner = user._id;
				return true;
			}
			throw new Meteor.Error(403, "Username must have at least 5 characters");
		});
	});
}
