var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var express = require('express');
var cors = require('cors')


// Route middlewares
var csrfProtection = csrf({
	cookie: {
		httpOnly: true,
        secure: false,
        sameSite: 'strict'
    }
});

var app = express();

app.use(cors({
	credentials: true,
	origin: 'http://localhost:3000',
	exposedHeaders: ['xsrf-token']
}));

app.use(express.json()); // JSON encoded body

// Parse cookies
// We need this because "cookie" is true in csrfProtection
app.use(cookieParser());


app.get('/', csrfProtection, function(req,res) {
  console.log("GET:");
  console.log(req.headers);

  // Send XSRF-TOKEN in header
  res.set('XSRF-TOKEN', req.csrfToken());

  // Empty body
  res.json({});

});

app.post('/login', csrfProtection, function(req, res) {
	console.log("POST:");
  	console.log(req.headers);

	res.json({loginStatus: "Logged In"});
});

var server = app.listen(3001,function() {});
console.log("Listening to server at port 3001")
