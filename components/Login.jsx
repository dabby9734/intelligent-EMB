import { useState } from "react";

import { setCookie } from "../lib/cookieMonster";

import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  console.log(username, password);

  const loginUser = async () => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (response.status != 200) {
      console.log("error");
    }

    const data = await response.json();

    if (data.success) {
      setCookie("auth_token", data.AUTH_TOKEN, 1800);
      setCookie("sess_id", data.SESSION_ID, 1800);
      setCookie("veri_token", data.VERI_TOKEN_COOKIE, 1800);
      setCookie("username", username, 15552000);
      setCookie("password", password, 15552000);

      alert("Login Successful");
    }
  };

  return (
    <div className="login">
      <TextField
        id="outlined-basic"
        label="Username"
        variant="outlined"
        onChange={(e) => {
          setUsername(e.target.value);
        }}
      />
      <TextField
        id="outlined-basic"
        label="Password"
        variant="outlined"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        type="password"
      />
      <Button variant="contained" onClick={loginUser}>
        Login
      </Button>
    </div>
  );
};

export default Login;
