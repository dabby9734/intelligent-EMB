import { useState, useEffect } from "react";
import {
  Snackbar,
  TextField,
  Alert,
  createTheme,
  ThemeProvider,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import LoginIcon from "@mui/icons-material/Login";

import { getCookie, setCookie } from "../lib/cookieMonster";
import { useRouter } from "next/router";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rem, setRem] = useState(true);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loginUser = async () => {
    setLoading(true);
    const response = await fetch(
      `https://iemb-backend.azurewebsites.net/api/login?username=${encodeURI(
        username
      )}&password=${encodeURI(password)}`
    );

    if (response.status != 200) {
      setLoading(false);
      return setErr("Login Failed");
    }

    const data = await response.json();

    if (data.success) {
      setCookie("auth_token", data.AUTH_TOKEN, 1800);
      setCookie("sess_id", data.SESSION_ID, 1800);
      setCookie("veri_token", data.VERI_TOKEN_COOKIE, 1800);

      if (rem) {
        setCookie("username", username, 2592000);
        setCookie("password", password, 2592000);
      }

      router.push("/student?type=inbox");
    } else {
      setLoading(false);
      setErr(data.message);
    }
  };

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
        <div className="login__hero">
          <p className="login__hero__main-text">iEMB</p>
          <p className="login__hero__description">
            This one is better though, and is fighting HCI IT Department&apos;s
            anticompetitive behaviours 👍
          </p>
        </div>
        <div className="login__content-wrapper">
          <div className="login__content">
            <h1>Login</h1>
            <ThemeProvider theme={darkTheme}>
              <Stack spacing={2} component="form">
                <TextField
                  id="username"
                  label="Username"
                  variant="outlined"
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  autoComplete="username"
                />
                <TextField
                  id="password"
                  label="Password"
                  variant="outlined"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  type="password"
                  autoComplete="current-password"
                />
                <div className="login-button-right-align">
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label="Remember Me"
                      sx={{
                        color: "text.secondary",
                        paddingLeft: "1rem",
                      }}
                      onChange={(e) => {
                        setRem(e.target.checked);
                      }}
                    />
                  </FormGroup>
                  <LoadingButton
                    variant="contained"
                    onClick={loginUser}
                    endIcon={<LoginIcon />}
                    loading={loading}
                    loadingPosition="end"
                    sx={{ maxWidth: "8rem", textTransform: "none" }}
                  >
                    Login
                  </LoadingButton>
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
