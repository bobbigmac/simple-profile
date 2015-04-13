

if (Meteor.isServer) {
	Meteor.startup(function () {
		
		SocialLinks.deny({
			insert: function (userId, doc) {
				doc.creator = userId;
			},
			update: function (userId, doc, fields, modifier) {
				if(userId !== doc.creator) {
					return true;
				}
			},
			remove: function (userId, doc) {
				if(userId !== doc.creator) {
					return true;
				}
			},
			fetch: ['_id', 'creator']
		});
		
		SocialEntries.deny({
		});
		
		Meteor.methods({
		});
		
		Meteor.publish('feedSocialLinks', function(filter) {
			if(filter)
			{
				console.log('filtering social links', filter);
			}
			return SocialLinks.find({}, { order: { dateAdded: -1 } });
		});
		
		Accounts.validateNewUser(function (user) {
			blackListNames = ['root', 'admin', 'master', 'administrator', 'home'];
			if(user.username && user.username.length >= 5 && blackListNames.indexOf(user.username) > -1) {
				return true;
			}
			throw new Meteor.Error(403, "Username must have at least 5 characters");
		});
	});
}
