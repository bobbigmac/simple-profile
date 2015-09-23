initBootstrapJs = function() {
  $('[data-toggle="dropdown"]').dropdown();
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="popover"]').popover();
};

var urlRegex =/(\b((https?|ftp|file):\/\/)?[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/igm;
var notUrlRegex = /^[\d.,]+$/igm;

setOwnerBrand = function() {
	var ownerUser = Meteor.users.findOne({ 'roles': 'admin' });
	if(ownerUser) {
		Session.set('brand-name', ((ownerUser.profile && ownerUser.profile.name) || ownerUser.username));
	}
};

setListField = function(fieldName, val, listId) {
	if(fieldName && listId) {
		var setField = {};
		setField[fieldName] = val;

		Lists.update({ _id: listId }, {
			$set: setField
		});

		Session.set('editing', false);
	}
};

getNotUrlsFromText = function(text, urls) {
	if(text && urls && urls.length) {
		var comment = text;
		urls.forEach(function(url) {
			comment = comment.replace(url, '');
		});
		comment = comment.trim().replace(/\s+/gim, ' ');
		if(comment) {
			return comment;
		}
	}
	return false;
};

prettifyLink = function(link) {
	return link.replace(/https?:\/\/[w\.]*/gim, '');
};

getUrlsFromText = function(text) {
	var urls = [];
	if(text) {
		var matches = (text+'').match(urlRegex);
		
		matches.forEach(function(url) {
			if(/.+\..+/gim.test(url) && !notUrlRegex.test(url)) {
				urls.push(/^[a-zA-Z]+:\/\//.test(url) ? url : 'http://'+url);
			}
		});
	}
	return urls;
};

addLinkToList = function (url, listId) {
	var urls = getUrlsFromText(url);
	var comment = getNotUrlsFromText(url, urls);

	urls.forEach(function(url) {
		if(url && listId) {
			if(!Links.find({ url: url }).count()) {
				var linkId = Links.insert({ url: url, list: listId }, function(err, affected) {
					if(err) {
						console.log(err);
					} else {
						if(comment) {
							Comments.insert({ link: linkId, text: comment });
						}
					}
				});
			} else {
				var link = Links.findOne({ url: url });
				if(link && comment) {
					Comments.insert({ link: link._id, text: comment });
				}
			}
		}
	});
};

sessionObjectProperty = function(name, property, newValue) {
	if(name && property) {
		var obj = Session.get(name);
		if(!obj || typeof obj !== 'object') {
			Session.set(name, {});
			obj = Session.get(name);
		}
		if(typeof newValue !== 'undefined') {
			//Set
			obj[property] = newValue;
			Session.set(name, obj);
		} else {
			//Just get
		}
		return obj[property];
	}
};