import React, { useState, useEffect } from 'react';
import axios from 'axios'
import './App.css';
import TextField from '@material-ui/core/TextField';


function App() {
  const [loginInfo, setLoginInfo] = useState({
    username: "",
    password: ""
  });
  const [loginStatus, setLoginStatus] = useState("Not Logged In");
  const [xsrfToken, setXsrfToken] = useState("");
  const [waitingLogin, setWaitingLogin] = useState(false);

  
  const getXsrfToken = () => {
    axios.get('http://localhost:3001/', {withCredentials: true})
    .then(res => {
      setXsrfToken(res.headers['xsrf-token']);
    });
  }

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

  const loginHandler = (event) => {
    event.preventDefault();
    
    if (xsrfToken === "")
      getXsrfToken();

    setWaitingLogin(true);
  }

  const changeUsername = e => {
    setLoginInfo({username: e.target.value, password: loginInfo.password});
  }

  const changePassword = e => {
    setLoginInfo({username: loginInfo.username, password: e.target.value});
  }

  return (
    <div className="App">
      <p>Login Status: {loginStatus}</p>
      <p>XSRF Token: {xsrfToken}</p>
      <form onSubmit={loginHandler}>
        <TextField
         label="Username"
         value={loginInfo.username}
         onChange={changeUsername}
         margin="normal"
        />
        <TextField
         label="Password"
         value={loginInfo.password}
         onChange={changePassword}
         margin="normal"
        />
        <input type="submit" value="Submit" />
      </form>
     </div> 
  );
}


export default App;
