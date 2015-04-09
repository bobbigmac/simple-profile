
if (Meteor.isClient) {
	Template.socialLinks.links = function() {
		return SocialLinks.find();
	};
	Template.homePage.events({
		'click button.addLink': function(e, t) {
			var linkTextEl = t.find('input.addLinkText');
			var linkText = linkTextEl.value;
			console.log('adding', linkText);
			if(linkText)
			{
				SocialLinks.insert({
					url: linkText,
				}, function(err, id) {
					console.log('added', linkText, 'got', id, 'err', err);
				});
			}
			else
			{
				linkTextEl.focus();
			}
		}
	});
	Template.homePage.ownerLoggedIn = function() {
		var userId = Meteor.userId();
		return (userId && userId == Session.get('ownerId'));
	};
	Template.homePage.ownerId = function() {
		var user = false, ownerId = false;
		if(user = Meteor.user())
		{
			if(user._id && !Session.get('ownerId'))
			{
				Session.set('ownerId', user._id);
			}
		}
		return Session.get('ownerId');
	};
	Template.homePage.siteRoot = function() {
		return Meteor.absoluteUrl();
	};
	Template.homePage.siteName = function() {
		//TODO: Use to subscribe to owner data if not logged in.
		var user = Meteor.user();
		if(user)
		{
			var siteName = user.fullname || user.username || "Dev Profile";
			document.title = siteName;
			return siteName;
		}
	};
	
	Meteor.autorun(function () {
		Meteor.subscribe('feedSocialLinks', Session.get('ownerId'));
	});
  
	Accounts.ui.config({
		passwordSignupFields: 'USERNAME_AND_EMAIL'
	});
}