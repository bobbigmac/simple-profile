
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
				Links.update({ _id: link._id }, update, function(err, affected) {
					// if(affected) {
					// 	console.log($(template.find('.btn')).parents('.link-card')[0]);
					// 	var el = ($(template.find('.btn')).parents('.link-card')[0]);
					// 	if(el) {
					// 		el.scrollIntoView();
					// 	}
					// }
				});
			}
		}
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
	'load .image-list img.showable': function(event, template) {
		var $img = template.$(template.find('img.showing'));
		var $div = template.$(template.find('.image-list'));
		var url = ''+this;
		var height = $img.height();
		$div.css({ minHeight: height });
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
			nextImage = $img.nextAll('img.showable:first').attr('source');
		} else {
			nextImage = $img.prevAll('img.showable:first').attr('source');
		}
		
		if(!nextImage) {
			nextImage = $img.parents('.image-list').find('img.showable'+(goRight ? ':first' : ':last')).attr('source');
		}

		if(!nextImage) {
			//reset back to the beginning if I mess up.
			nextImage = $img.nextAll('img.showable:first').attr('source');
		}

		var data = Template.parentData();
		if(data && data.link && data.link._id) {
			sessionObjectProperty('displayedImage', data.link._id, nextImage);
		}
	}
});

Template.imageList.helpers({
	showIt: function(linkId, images) {
		var url = (''+this);
		var viewedLink = sessionObjectProperty('displayedImage', linkId);
		if(!viewedLink) {
			viewedLink = sessionObjectProperty('displayedImage', linkId, url);
		}
		showIt = (viewedLink === url ? url : false);

		if(images && images.length > 1) {
			var viewedIndex = images.indexOf(viewedLink);
			var thisIndex = images.indexOf(url);
			//console.log('viewedIndex', viewedIndex, thisIndex);
			//
			if(thisIndex === (viewedIndex + 1) || thisIndex === (viewedIndex - 1)) {
				showIt = url;
			}
			if(viewedIndex === 0 && thisIndex === (images.length-1)) {
				showIt = url;
			}
			if(thisIndex === 0 && viewedIndex === (images.length-1)) {
				showIt = url;
			}
		}
		return showIt;
	},
	showing: function(linkId) {
		var url = (''+this);
		var viewedLink = sessionObjectProperty('displayedImage', linkId);
		if(!viewedLink) {
			viewedLink = sessionObjectProperty('displayedImage', linkId, url);
		}
		return viewedLink === url;
	},
	imagepos: function() {
		var linkId = this._id;
		var viewedLink = sessionObjectProperty('displayedImage', linkId);
		return ((viewedLink && this.images && (this.images.indexOf(viewedLink)+1)) || 1);
	}
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