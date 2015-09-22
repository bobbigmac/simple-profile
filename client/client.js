
//TODO: Get this from host-user configuration
Session.set('brand-name', 'Simple-profile');

Template.nav.helpers({
	unreadActivities: function() {
		return Counts.get('unread-activities');
	}
});

Template.nav.events({
	'click .toggle-editmode': function() {
		var editMode = Session.get('editMode');
		Session.set('editMode', !editMode);
	},
	'click .new-list': function() {
		Lists.insert({
			'name': 'New List: '+moment().format('LL'),
			'public': true
		});
	}
});

Avatar.setOptions({
	fallbackType: 'initials',
	gravatarDefault: 'wavatar',
	emailHashProperty: 'profile.email_hash',
});

EditableText.userCanEdit = function(doc,Collection) {
	var userId = Meteor.userId();
	var owner = Meteor.users.findOne({ 'roles': 'admin' });
	return !!(userId && owner && userId === owner._id);
};

Template.layout.helpers({
	loggingIn: function() {
		return Meteor.loggingIn();
	}
})

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_AND_EMAIL'
	// passwordSignupFields: 'USERNAME_AND_OPTIONAL_EMAIL'
});