
Template.addLinkForm.helpers({
	'confirmRemoveList': function() {
		return Session.equals('confirm-remove-list', this._id);
	}
});

Template.addLinkForm.events({
	'click .remove-list': function(event, template) {
		Lists.remove(this._id);
		return false;
	},
	'click .confirm-remove-list': function(event, template) {
		var currListId = Session.get('confirm-remove-list');
		if(currListId === this._id) {
			Session.set('confirm-remove-list', false);
		} else {
			Session.set('confirm-remove-list', this._id);
		}
		Meteor.setTimeout(function() {
			Session.set('confirm-remove-list', false);
		}, 2000);
	},
	'submit .add-link-form': function(event, template) {
		event.preventDefault();
		var el = template.find('.add-link-url');
		var link = el.value;
		addLinkToList(link, this._id);
		el.value = '';
	}
});

Template.linkOptions.onRendered(initBootstrapJs);
Template.linkOptions.events({
	'click .link-upload': function(event, template) {
		$(template.find('.link-file')).trigger('click');
	},
	'change .link-file': function(event, template) {
		var linkId = (this && this.link && this.link._id);
		if(linkId) {
			FS.Utility.eachFile(event, function(file) {
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
			});
		}
	}
});

Template.list.onRendered(function() {
	Session.set('confirm-remove-list', false);
});

Template.list.helpers({
	links: function() {
		var filter = { list: this._id };
		if(!Session.get('editMode')) {
			filter.archived = { $ne: true };
		}
		return Links.find(filter);
	}
});