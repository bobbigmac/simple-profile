Meteor.startup(function() {
	//Add any extra roles
	var roles = ['basic', 'admin'];

	if(Meteor.roles.find().count() != roles.length) {
		roles.map(function(role) {
			Roles.createRole(role);
		});
	}
});

Accounts.onCreateUser(function(options, user) {
  user.roles = ['basic'];

	if(options.profile) {
		user.profile = options.profile;
	};

	//set the owner user
  if(Meteor.users.find().count() === 0) {
  	user.roles.push('admin');
  }

	var email = (user && user.emails && typeof(user.emails) === 'object' && user.emails instanceof Array && user.emails[0] && user.emails[0].address);
	if(user && user.profile && email) {
		user.profile.email_hash = Gravatar.hash(email);
	}

	return user;
});