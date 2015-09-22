
//Allow loading of sortables based on the scanned fields available
Session.setDefault('sortables', [
	{
		field: 'created',
		value: -1,
		name: 'Newest First'
	}, {
		field: 'created',
		value: 1,
		name: 'Oldest First'
	}, {
		field: 'likes.total',
		value: -1,
		name: 'Most Likes'
	}, {
		field: 'likes.total',
		value: 1,
		name: 'Least Likes'
	}, {
		field: 'scanned.price',
		value: 1,
		name: 'Lowest Price'
	}, {
		field: 'scanned.price',
		value: -1,
		name: 'Highest Price'
	}
]);

Session.setDefault('sortPosition', 0);