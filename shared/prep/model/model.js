Lists = new Mongo.Collection('lists');
Links = new Mongo.Collection('links');
Comments = new Mongo.Collection('comments');

Activities = new Mongo.Collection('activities');

//TODO: Use cfs:s3 if you want to offload the images
var ImageStore = new FS.Store.GridFS("images");
Images = new FS.Collection("images", {
 stores: [ImageStore]
});