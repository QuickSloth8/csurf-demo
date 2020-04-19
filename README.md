# Applying csurf middleware to NodeJS backend & ReactJS frontend

Here's a summary of the main parts that should be implemented in order to utilize [csurf middleware](https://github.com/expressjs/csurf).
The code was written in NodeJS for the backend, and ReactJS for the frontend.

## Backend

### 1. Imports: express, cookie-parser, csurf, cors

	var express = require('express');
	var cookieParser = require('cookie-parser');
	var csrf = require('csurf');
	var cors = require('cors')

### 2. Config & apply cookie-parser

	app.use(cookieParser());

* We need cookie-parser because we chose to manage user connections in cookies, in a stateless manner.

### 3. Config & apply cors

	app.use(cors({
	  credentials: true,
	  origin: 'http://localhost:3000',
	  exposedHeaders: ['xsrf-token']
	}));

* You can choose to specify HTTP methods as well

### 4. Config & apply csurf

config with:
	
	var csrfProtection = csrf({
	  cookie: {
	    httpOnly: true,
	    secure: true,
	    sameSite: 'strict'
	  }
	});

and apply by either using the middleware on all routes

	app.use(csrfProtection);

or, by using the middleware on specific routes

	app.get('/', csrfProtection, function(req,res) {
	  ...
	}

An XSRF-TOKEN should be generated on the first request (GET) in order to secure the following requests.
This is done by calling `res.set('XSRF-TOKEN', req.csrfToken());`.
For example:

	app.get('/', csrfProtection, function(req,res) {
	  console.log("GET:");
	  console.log(req.headers);

	  // Send XSRF-TOKEN in header
	  res.set('XSRF-TOKEN', req.csrfToken());

	  // Empty body
	  res.json({});

	});


### Notes

* Cookie parameters shown above are **very important!**. Here's a [web page](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) that explains them.
* csurf generates a token called XSRF token, which should be sent to the user on the first get connection.
* In case of using app.use for applying csurf (applying it to every route), it should come after cookie parser.
* Choosing to set cookie in options means the token secret will be stored in the cookie. Storing the token secret in a cookie implements the [double submit cookie pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie).
* For detailed csurf documentation: [https://github.com/expressjs/csurf](https://github.com/expressjs/csurf).



## Frontend

As mentioned above, the XSRF-TOKEN should be retrieved from the server at the first request.
The XSRF-TOKEN value is managed by a state variable, which receives the token value upon calling getXsrfToken().
As you well see in the code, getXsrfToken() is called only after the user clicks the submit button, and the useEffect hook guaranties to proceed with POST-ing only after XSRF-TOKEN is retrieved from the server.

### 1. Initializing relevant state variables

	const [xsrfToken, setXsrfToken] = useState("");
	const [waitingLogin, setWaitingLogin] = useState(false);

### 2. Retrieving XSRF-TOKEN

	const getXsrfToken = () => {
	  axios.get('http://localhost:3001/', {withCredentials: true})
	  .then(res => {
	    setXsrfToken(res.headers['xsrf-token']);
	  });
	}

### 3. Passing XSRF-TOKEN back to the server with POST request

	const performLogin = () => {
	  axios.post('http://localhost:3001/login',
        loginInfo,
        {withCredentials: true, headers: {'xsrf-token': xsrfToken}}
      )
      .then(res => {
        setLoginStatus(res.data['loginStatus']);
        setWaitingLogin(false);
      });
	}
	
	useEffect(() => {
	  if (xsrfToken !== "" && waitingLogin === true)
	    performLogin();
	}, [xsrfToken, waitingLogin]);


### 4. Triggering getXsrfToken()

    const loginHandler = (event) => {
      event.preventDefault();
      
      if (xsrfToken === "")
        getXsrfToken();

      setWaitingLogin(true);
    }


**Notes:**

* In our example, XSRF-TOKEN was sent in a header. other options exist.
* For detailed csurf documentation: [https://github.com/expressjs/csurf](https://github.com/expressjs/csurf).

---

***Hope you find this helpful.***

***In case of questions, suggestions, typos, etc., you can open an issue, or contact me at QuickSloth8@gmail.com.***
