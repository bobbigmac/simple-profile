
Template.link.helpers({
	'mayRemove': function() {
		var userId = Meteor.userId();
		return ((this.link.owner === userId) || ((this.list && this.list.owner) === userId));
	},
	'mayArchive': function() {
		var userId = Meteor.userId();
		return userId && Roles.userIsInRole(userId, ['admin']);
	},
	showShare: function() {
		return Session.equals('share-link-visible', this.link._id);
	}
});

Template.link.events({
	'focus .share-input': function(event, template) {
		Meteor.setTimeout(function() {
			$(template.find('.share-input')).select();
		}, 100);
	},
	'dragstart img.single-image': function(event, template) {
		return false;
	},
	'click .toggle-share-link': function(event, template) {
		var unset = Session.equals('share-link-visible', this.link._id);
		Session.set('share-link-visible', unset ? false : this.link._id);
	},
	'click .archive-link': function(event, template) {
		Links.update({ _id: this.link._id }, {
			$set: { archived: !this.link.archived }
		});
	},
	'click .private-link': function(event, template) {
		Links.update({ _id: this.link._id }, {
			$set: { private: !this.link.private }
		});
	},
	'click .remove-link': function(event, template) {
		//console.log('removing', this.link);
		Links.remove({ _id: this.link._id }, function(err, affected) {
			if(!err) {
				//console.log('removed', affected)
			} else {
				console.log(err);
			}
		});
	},
	'click .rescan-link': function(event, template) {
		if(this.link && this.link._id) {
			Meteor.call('rescan-link', this.link._id);
		}
	},
	'click .like-link': function(event, template) {
		var userId = Meteor.userId();
		var link = this.link;
		if(userId && link) {
			var update = false;
			var liked = link && link.likes && link.likes.general && link.likes.general.indexOf && link.likes.general.indexOf(userId) > -1;
			if(liked) {
				update = {
					$pull: {
						'likes.general': userId
					}
				};
			} else {
				update = {
					$addToSet: {
						'likes.general': userId
					}
				};
			}

			if(update) {
				Links.update({ _id: link._id }, update);
			}
		}
	},
	'click .remove-image': function(event, template) {
		var imageId = $(template.find('.showing')).attr('imageId');
		//console.log('remove image', imageId, this.link._id);
		removeImage(imageId, this.link._id);
		return false;
	}
});


Template.imageList.events({
	'error img': function(event, template) {
		var img = template.$(event.target);
		var src = img.attr('src');
		if(src.indexOf('missing') === -1) {
			img.attr('src', '/missing.png');
			var parent = img.parent();
			if(!parent.find('img.showing').length) {
				parent.find('img.showable:first').addClass('showing');
			}
		}
	},
	'click .remove-image': function(event, template) {
		var parentData = Template.parentData();
		var imageId = $(template.find('.showing')).attr('imageId');

		if(imageId && parentData && parentData.link && parentData.link._id) {
			var linkId = parentData.link._id;

			removeImage(imageId, linkId);
		}
		return false;
	},
	'click .image-list': function(event, template) {
		var $img = template.$(template.find('img.showing'));

		var width = event && event.toElement && event.toElement.width;
		var xclick = event && event.offsetX;
		
		var goRight = true;
		if(width && xclick && (xclick < (width / 2))) {
			goRight = false;
		}

		var nextImage = false;
		if(goRight) {
			nextImage = $img.nextAll('img.showable:first');
		} else {
			nextImage = $img.prevAll('img.showable:first');
		}
		
		if(!nextImage || (nextImage && !nextImage.length)) {
			nextImage = $img.parents('.image-list').find('img.showable'+(goRight ? ':first' : ':last'));
		}

		if(!nextImage || (nextImage && !nextImage.length)) {
			//reset back to the beginning if I mess up.
			nextImage = $img.nextAll('img.showable:first');
		}

		var data = Template.parentData();
		if(data && data.link && data.link._id) {
			var nextUrl = getImageUrl({ _id: nextImage.attr('imageId') });
			sessionObjectProperty('displayedImage', data.link._id, nextUrl);
		}
	}
});

Template.imageList.helpers({
	imageUrl: function(linkId, images) {
		return getImageUrl(this);
	},
	showing: function(linkId) {
		var url = getImageUrl(this);
		var viewedLink = sessionObjectProperty('displayedImage', linkId);
		if(!viewedLink) {
			viewedLink = sessionObjectProperty('displayedImage', linkId, url);
		}
		return (viewedLink === url);
	},
	// imagepos: function() {
	// 	var linkId = this._id;
	// 	var viewedLink = sessionObjectProperty('displayedImage', linkId);

	// 	var template = Template.instance();
	// 	console.log(template.find('.showable'));
	// 	return ((viewedLink && this.images && (this.images.indexOf(viewedLink)+1)) || 1);
	// }
});

Template.addCommentForm.events({
	'submit .add-comment-form': function(event, template) {
		event.preventDefault();
		var userId = Meteor.userId();
		var text = template.find('.add-comment-text').value;
		var linkId = this.link && this.link._id;
		
		if(userId && text && linkId) {
			Comments.insert({ link: linkId, text: text });
			template.find('.add-comment-text').value = '';
		}
	}
});

Template.sharePanelBody.rendered = function() {
	var shareInput = $(this.find('.share-input'));
	Meteor.setTimeout(function() {
		shareInput.focus();
	}, 100);
};

Template.sharePanelBody.helpers({
	shareUrl: function() {
		if(this.link) {
			var linkId = this.link && this.link._id;
			var listId = this.list && this.list._id;

			//TODO: generate this link correctly
			var listSpec = { _id: listId, link: linkId };
			return Router.url('list', listSpec);
		}
	}
});