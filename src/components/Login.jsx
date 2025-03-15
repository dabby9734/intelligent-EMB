import { useState, useContext } from "react";
import {
  TextField,
  createTheme,
  ThemeProvider,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";
import { notifContext } from "../pages/_app";
import { setCookie } from "../lib/cookieMonster";
import { useRouter } from "next/router";
import { getApiURL, validateRedirect } from "../lib/util";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rem, setRem] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const notif = useContext(notifContext);

  const loginUser = async () => {
    setLoading(true);
    const url = new URL(getApiURL("login"));
    url.searchParams.append("username", username);
    url.searchParams.append("password", password);
    const response = await fetch(url);

    switch (response.status) {
      case 200:
        break;
      default:
        setLoading(false);
        return notif.open("Login failed", "error");
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

      if (router.query.next && validateRedirect(router.query.next)) {
        router.push(router.query.next);
      } else {
        router.push("/student?type=inbox");
      }
    } else {
      setLoading(false);
      notif.open(data.message, "error");
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
        <div className="login__hero">
          <p className="login__hero__main-text">iEMB</p>
          <p className="login__hero__description">
            integrated E-Message Board, now made intelligent.
          </p>
        </div>
        <div className="login__content-bg">
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
                        control={<Checkbox />}
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
                      type="submit"
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

              <div className="login__content-links">
                <p>
                  <Link href="/articles/about" passHref className="underline">
                    About
                  </Link>
                  &nbsp;⋅&nbsp;
                  <Link href="/articles/faq" passHref className="underline">
                    FAQ
                  </Link>
                  &nbsp;⋅&nbsp;
                  <Link
                    href="/articles/privacy-policy"
                    passHref
                    className="underline"
                  >
                    Privacy Policy
                  </Link>
                  &nbsp;⋅&nbsp;
                  <Link
                    href="/articles/terms-and-conditions"
                    passHref
                    className="underline"
                  >
                    {"Terms & Conditions"}
                  </Link>
                </p>
                <p>
                  Source code for&nbsp;
                  <a
                    href="https://github.com/dabby9734/intelligent-EMB"
                    className="underline"
                  >
                    Frontend
                  </a>
                  &nbsp;and&nbsp;
                  <a
                    href="https://github.com/dabby9734/iemb-backend"
                    className="underline"
                  >
                    Backend
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
