//SEE https://github.com/ongoworks/meteor-security


Security.defineMethod("log", {
  deny: function(type, arg, userId, doc, fields, modifier) {
    //this helper is a bit messy, maybe rewrite one day.
    var activity = {
      subject: (arg && arg[1]),
      action: (arg && arg[2]),
      user: userId,
      created: (new Date())
    };

    if(doc) {
      if(arg && arg[0] === false) {
        activity.list = doc._id;
      }
      //can't set an _id manually. Will have to live without link-added
      //console.log(arg[0], doc[arg[0]], doc, type);
      if(arg && arg[0]) {
        // if(!doc[arg[0]] && type == 'insert') {
        //   doc["_id"] = Random.id();
        // }
        if(doc[arg[0]]) {
          activity.link = doc[arg[0]];
        }
      }

      if(doc.list) {
        activity.list = doc.list;
      } else if(doc.link) {
        var link = Links.findOne({ _id: doc.link }, { fields: { list: 1 }});
        activity.list = link.list
      } else {
        //not referencing a link
      }
    }

    if(typeof activity.action === 'function') {
      activity = activity.action(activity, doc, fields, modifier);
    }

    if(activity && activity.action === false) {
      //TODO: Globally try to determine action
    }

    if(activity.list) {
      Activities.insert(activity);
    } else {
      console.log('Could NOT log event', arg);
    }

    return false;
  }
});

Security.defineMethod("ownerIsLoggedInUser", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    return userId !== doc.owner;
  }
});

Security.defineMethod("linkListOwnerIsLoggedInUser", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    if(doc && doc.list) {
      var list = Lists.findOne({ _id: doc.list }, { fields: { owner: 1 }});
      return !(list && list.owner === userId);
    }
    return true;
  }
});

Security.defineMethod("idIsLoggedInUser", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    return userId !== doc._id;
  }
});

Security.defineMethod("docHasProperty", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    if(arg && arg instanceof Array) {
      return !arg.every(function(field) {
        return doc[field];
      });
    }
    return true;
  }
});

Security.defineMethod("likesIsLoggedInUser", {
  fetch: ['likes'],
  deny: function(type, arg, userId, doc, fields, modifier) {
    if(modifier && Object.keys(modifier).length === 1) {

      var totalLikes = 0;
      if(doc.likes && typeof doc.likes === 'object') {
        Object.keys(doc.likes).forEach(function(key) {
          if(doc.likes[key] && doc.likes[key] instanceof Array) {
            totalLikes += (doc.likes[key] && doc.likes[key].length) || 0;
          }
        });
      }

      var action = (modifier['$addToSet'] || modifier['$pull']);
      if(modifier['$addToSet']) {
        totalLikes++;
      } else {
        totalLikes--;
      }

      var okay = Object.keys(action).every(function(key) {
        return key.indexOf('likes.') === 0 && action[key] === userId;
      });

      if(okay) {
        Links.update({ _id: doc._id }, {
          $set: {
            'likes.total': totalLikes
          }
        });
      }

      return !okay;
    }
    return true;
  }
});

// Sets the owner property of document, and sets created date.
Security.defineMethod("setOwnerUser", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    doc.owner = userId;
    if(!doc.created) {
	    doc.created = new Date();
  	}
  	doc.modified = new Date();
    return false;
  }
});

// May be used as simple trigger responder to client-side updates
Security.defineMethod("watchChangesByBasic", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    if(type === 'update') {
      console.log('Had changes by basic user', userId, 'doc', doc._id);
    }
    return false;
  }
});
