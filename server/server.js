
Meteor.startup(function () {
  //Ensure all users have email_hash
  Meteor.users.find({
    $or: [
      { 'profile.email_hash': { $exists: false } },
      { 'profile.email_hash': null }
    ],
    emails: { $exists: true }
  }, {
    fields: { _id: 1, emails: 1, 'profile.email_hash': 1 }
  }).fetch().forEach(function(user) {
    var hash = Gravatar.hash(user.emails[0].address);
    console.log('Creating gravatar hash', user._id, hash);
    Meteor.users.update({ _id: user._id }, { $set: {
      'profile.email_hash': hash
    }});
  });

  //Reset scanning on any halted links
  Links.update({ scanning: true, scanned: { $exists: false }}, { $unset: { scanning: "" } }, { multi: true });

	//Clean out any Lists with no Links
  Lists.find({}, { fields: { _id: 1, name: 1 }})
  	.fetch()
  	.forEach(function(list) {

  	var links = Links.find({ list: list._id });
  	if(!links.count()) {
  		console.log('Removing empty list', list.name);
  		Lists.remove({ _id: list._id });
  	}
  });

  var defaultAdmins = ['admin@bobbigmac.com', 'bobbigmac'];
  defaultAdmins.forEach(function(defaultAdmin) {
    var user = Meteor.users.findOne({
      $or: [
        { 'emails.address': defaultAdmin }, 
        { 'username': defaultAdmin }
      ]
    });
    if(user && user._id) {
      if(!Roles.userIsInRole(user, 'admin')) {
        console.log('Assigning', defaultAdmin, 'to admin role');
        Roles.addUsersToRoles(user._id, 'admin');
      }
    }
  });
  
  Meteor.methods({
    'rescan-link': function(linkId) {
      Links.update({ _id: linkId }, {
        $unset: { 
          scanned: "", 
          scanning: "" 
        }
      });
    }
  });
});