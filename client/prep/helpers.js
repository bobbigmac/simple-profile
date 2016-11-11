var settings = ((Meteor.settings && Meteor.settings.public) || {});

Session.setDefault('brand-name', settings.brand||'Loading...');

//TODO: Currently Chrome on ubuntu isn't playing nice with masonry layout (causing weird layout issues in panels after the first one)
// -webkit-column-count bug: https://code.google.com/p/chromium/issues/detail?id=530260&thanks=530260&ts=1441908471
// also see https://productforums.google.com/forum/#!topic/chrome/cSTmJmJLFVE
var useMasonry = true;
Handlebars.registerHelper('linkCardContainer', function() {
	return useMasonry ? 'masonry-wall' : 'row';
});
Handlebars.registerHelper('linkCardLayout', function() {
	return useMasonry ? 'masonry-brick masonry-no-break' : 'col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12';
});
Handlebars.registerHelper('bootstrapify', function() {
	return {
		//'class': 'input-group',
		'inputClass': 'form-control'
	}
});

Handlebars.registerHelper('brand', function() {
	return Session.get('brand-name');
});

Handlebars.registerHelper('showEditModeRoutes', function() {
	return ['lists', 'list', 'link'];
});

Handlebars.registerHelper('currentRouteName', function() {
	return Router.current().route.getName();
});

Handlebars.registerHelper('userIsOwner', function() {
	var userId = Meteor.userId();
	var owner = Meteor.users.findOne({ 'roles': 'admin' });
	return !!(userId && owner && userId === owner._id);
});

Handlebars.registerHelper('userIsNotOwner', function() {
	var userId = Meteor.userId();
	var owner = Meteor.users.findOne({ 'roles': 'admin' });
	return !(userId && owner && userId === owner._id);
});

Handlebars.registerHelper('currentUser', function() {
	return Meteor.user();
});

Handlebars.registerHelper('ownerUser', function() {
	return Meteor.users.findOne({ 'roles': 'admin' });
});

Handlebars.registerHelper('getSession', function(name) {
	return (name && Session.get(name));
});

Handlebars.registerHelper('inArray', function(val, arr) {
	if(val && arr && arr instanceof Array) {
		return (arr.indexOf(val) > -1);
	}
});

Handlebars.registerHelper('momentAgo', function(date) {
	return moment(date).fromNow();
});

moment.fn.fromNowOrNow = function (a) {
	if (Math.abs(moment().diff(this)) < 45000) {
		return 'just now';
	}
	return this.fromNow(a);
};

Handlebars.registerHelper('liveMomentAgo', function(date) {
	Chronos.liveUpdate(20000);
	return Chronos.liveMoment(date).fromNow();
});

Handlebars.registerHelper('either', function(a, b) {
	return a || b;
});

Handlebars.registerHelper('shareify', function(site, url) {
	if(site === 'facebook') {
		return 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
	} else if(site === 'twitter') {
		return 'https://twitter.com/home?status='+url;
	}
	return url;
});

Handlebars.registerHelper('editMode', function() {
	return Session.get('editMode');
});

Handlebars.registerHelper('and', function(a, b) {
	return a && b;
});

Handlebars.registerHelper('equals', function(a, b) {
	return a === b;
});

Handlebars.registerHelper('log', function(a) {
	console.log(a);
});

Handlebars.registerHelper('maxLength', function(str, length) {
	str = (str+'');
	return str.substring(0, length||str.length);
});

Handlebars.registerHelper('eitherMaxLength', function(a, b, length) {
	str = ((a||b)+'');
	return str.substring(0, length||str.length);
});