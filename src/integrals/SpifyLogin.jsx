import * as React from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Divider, Grid, LinearProgress, Link, Paper, TextField, Typography } from "@mui/material";
import LoginIcon from '@mui/icons-material/Login';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SpifyLogo from "../components/SpifyLogo";
import '@fontsource/roboto/700.css';
import axios from 'axios';
import { serverURL } from '../middleware/SpifyServerParamConn';
import { getCurrentTheme } from '../middleware/SpifyAppThemeController';

const SpifyLogin = (props) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [authStatus, setAuthStatus] = React.useState(0);
    const navigate = useNavigate();
    const linkLocation = useLocation()
    
    React.useEffect(() => {
        axios
            .post(`${serverURL}/api/auth/verify`,
                undefined,
                { withCredentials: true }
            )
            .then((res) => {
                setTimeout(() => {
                    setAuthStatus(2);
                }, 700);
            })
            .catch((res) => {
                setAuthStatus(1);
            })
    }, []);

    const LoginSpinner = () => {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6">⚡ Blazzzing through the Internet...</Typography>
                <LinearProgress sx={{ width: '80%' }} />
            </Box>
        )
    }

    const LoginPage = () => {
        const [usernameText, setUsernameText] = React.useState("");
        const [passwordText, setPasswordText] = React.useState("");

        React.useEffect(() => {
            let background = new Image();
            background.onload = () => setImageLoaded(true);
            background.onerror = () => { setImageLoaded(true) };
            background.src = "https://source.unsplash.com/random?wallpapers";
        }, []);

        const handleForgotPassword = (e) => {
            e.preventDefault();
        }
    
        const handleLogin = () => {
            setIsConnecting(true);
            axios
            .post(`${serverURL}/api/auth/login`, {
                username: usernameText,
                password: passwordText
            }, { withCredentials: true })
            .then((res) => {
                let forLink = new URLSearchParams(linkLocation.search).get('for');
                forLink = (forLink === null) ? "" : forLink;
                (forLink === "/" || forLink.trim() === "") ? navigate("/dashboard") : navigate(forLink);
            })
            .catch((res) => {
                setTimeout(() => {
                    setIsConnecting(false);
                }, 400);
            });
        }

        return(
            (imageLoaded == false) ? <LoginSpinner /> :
            <Grid container component="main" sx={{ height: '100%' }}>
                <Grid 
                    item
                    xs={false}
                    sm={4}
                    md={7}
                >
                    <Box sx={{
                            background: 'rgba(0, 0, 0, 0.35) url(https://source.unsplash.com/random?wallpapers)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundBlendMode: 'darken',
                            height: '100%',
                            display: { xs: 'none', sm: 'flex' },
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Box sx={{
                            position: 'absolute', 
                            display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <SpifyLogo width="192px" />
                            <Typography variant="h2" boxShadow={4} sx={{
                                background: '#ffc627',
                                padding: '13px 30px 15px 30px',
                                display: { xs: 'none', md: 'flex' },
                                borderRadius: '10px',
                                marginTop: '-20px', 
                                userSelect: 'none',
                                color: "#000000"
                            }}>Spify Monitoring</Typography>
                        </Box>
                    </Box> 
                </Grid>
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box sx={{
                        display: 'flex',
                        height: '100%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Box sx={{ padding: '8px', alignSelf: 'end' }}>
                            <Button onClick={props.toggleTheme} variant='outlined' startIcon={getCurrentTheme() == 'light' ? <DarkModeIcon /> : <LightModeIcon />}>
                                {getCurrentTheme() == 'light' ? "Dark Mode" : "Light Mode"}
                            </Button>
                        </Box>
                        <Divider sx={{ width: '100%' }} />
                        <Box sx={{
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: 1
                        }}>
                            <LoginIcon sx={{ fontSize: "2.5rem" }} />
                            <Typography variant="h4" sx={{ userSelect: 'none' }}>Spify Login</Typography>
                            <TextField disabled={isConnecting} fullWidth variant="outlined" label="Username" onChange={(e) => { setUsernameText(e.target.value) }} sx={{ marginTop: '30px' }} />
                            <TextField disabled={isConnecting} fullWidth variant="outlined" type="password" onChange={(e) => { setPasswordText(e.target.value) }} label="Password" sx={{ marginTop: '10px' }} />
                            <Link sx={{ alignSelf: 'start', marginTop: '5px' }} href="" onClick={handleForgotPassword}>Forgot Password</Link>
                            <LoadingButton loading={isConnecting} onClick={handleLogin} variant="contained" sx={{ marginTop: '30px', width: '35%', alignSelf: 'start' }}>Sign In</LoadingButton>
                        </Box>
                        <Box sx={{ width: '100%' }}>
                            <Divider />
                            <Typography sx={{ fontSize: '0.9rem', padding: '10px', textAlign: 'center', userSelect: 'none' }}>
                                © Copyright 2023  Atheesh Thirumalairajan
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        )        
    }

    switch (authStatus) {
        case 0: return (<LoginSpinner />)
        case 1: return (<LoginPage />)
        case 2: return (<Navigate to="/dashboard" />)
    }
}

export default SpifyLogin;