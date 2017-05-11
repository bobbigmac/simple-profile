
var bootstrapTimeout = false;
initBootstrapJs = function() {
	if(bootstrapTimeout) {
		Meteor.clearTimeout(bootstrapTimeout);
		bootstrapTimeout = false;
	}
	bootstrapTimeout = Meteor.setTimeout(function() {
	  $('[data-toggle="dropdown"]').dropdown();
	  $('[data-toggle="tooltip"]').tooltip();
	  $('[data-toggle="popover"]').popover();
	}, 500);
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

uploadImage = function(file, linkId) {
	if(file && linkId) {
		Images.insert(file, function (err, fileObj) {
			if (err){
				console.error(err);
			} else {
				var fileRecord = fileObj.getFileRecord();
				if(fileRecord) {
					var imageRecord = { _id: fileRecord._id };
					Links.update(linkId, {
						$addToSet: {
							images: imageRecord
						}
					}, function() {
						Meteor.setTimeout(function() {
							sessionObjectProperty('displayedImage', linkId, getImageUrl(imageRecord));
						}, 500);
					});
				}
			}
		});
	}
};

removeImage = function(imageId, linkId) {
	if(imageId && linkId) {
		Links.update(linkId, {
			$pull: {
				images: { _id: imageId }
			}
		}, function(err, affected) {
			if(!err) {
				Images.remove({ _id: imageId });
				sessionObjectProperty('displayedImage', linkId, false);
			} else {
				console.log('err', err);
			}
		});
	}
};

getImageUrl = function(imageObj) {
	var url = false;
	if(typeof imageObj === 'object' && imageObj._id) {
		if(imageObj.url) {
			url = imageObj.url;
		} else {
			var fileRecord = Images.findOne(imageObj._id);
			if(fileRecord) {
				url = fileRecord.url();
			}
		}
	} else {
		url = ''+imageObj;
	}
	return url;// && url.replace('http://', 'https://');
};
