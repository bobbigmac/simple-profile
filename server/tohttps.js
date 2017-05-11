// Redirect to a random URL, better handled client-side
WebApp.connectHandlers
  .use(function(req, res, next) {
    // console.log(req.headers);
    if (req.headers && req.headers.host && 
        req.headers['x-forwarded-proto'] &&
        req.headers.host.indexOf('localhost') == -1 && 
        req.headers['x-forwarded-proto'] == 'http') {
      console.log('redirect to https');
      
      res.writeHead(301, {
        'Location': 'https://' + req.headers.host + req.url
      });
      res.end();
      // next();
    } else {
      // Let other handlers match
      next();
    }
  });