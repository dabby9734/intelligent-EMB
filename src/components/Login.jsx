import { useState, useEffect } from "react";
import {
  Button,
  Snackbar,
  TextField,
  Alert,
  createTheme,
  ThemeProvider,
  Stack,
} from "@mui/material";

import { getCookie, setCookie } from "../lib/cookieMonster";
import { useRouter } from "next/router";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

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
      return setErr("Login Failed");
    }

    const data = await response.json();

    if (data.success) {
      setCookie("auth_token", data.AUTH_TOKEN, 1800);
      setCookie("sess_id", data.SESSION_ID, 1800);
      setCookie("veri_token", data.VERI_TOKEN_COOKIE, 1800);
      setCookie("username", username, 15552000);
      setCookie("password", password, 15552000);

      setSuccess("Login Successful");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      setErr(data.message);
    }
  };

  useEffect(() => {
    if (!getCookie("username") || !getCookie("password")) {
      return;
    }
  });

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  return (
    <div className="login-bg">
      <div className="login">
        <Snackbar
          open={!!err}
          autoHideDuration={3000}
          onClose={() => setErr("")}
        >
          <Alert severity="error" onClose={() => setErr("")}>
            {err}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess("")}
        >
          <Alert severity="success" onClose={() => setErr("")}>
            {success}
          </Alert>
        </Snackbar>
        <div className="login__hero">
          <p className="login__hero__main-text">iEMB</p>
          <p className="login__hero__description">
            This one is better though, and is fighting iEMB&apos;s
            anticompetitive behaviours 👍
          </p>
        </div>
        <div className="login__content-wrapper">
          <div className="login__content">
            <h1>Login</h1>
            <ThemeProvider theme={darkTheme}>
              <Stack spacing={2}>
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
                <div className="login-button-right-align">
                  <Button
                    variant="contained"
                    onClick={loginUser}
                    sx={{ maxWidth: "8rem", textTransform: "none" }}
                    type="submit"
                  >
                    Login
                  </Button>
                </div>
              </Stack>
            </ThemeProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
