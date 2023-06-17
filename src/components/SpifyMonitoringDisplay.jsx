import PhonelinkOffIcon from "@mui/icons-material/PhonelinkOff";
import {
    Box,
  Button,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Slide,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import NoVncClient from '@novnc/novnc/core/rfb';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SpifyMonitoringDrawer = (props) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <Button variant="contained" color="error" sx={{ margin: '10px' }}>Disconnect</Button>
            <Divider />
            <Box sx={{ flexGrow: 1, maxHeight: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>

            </Box>
        </Box>
    )
}

const drawerWidth = 260;
const SpifyMonitoringDisplay = (props) => {
    const { windowProps } = props;
    const displayCanvas = React.useRef();
    const [viewOnly, setViewOnly] = React.useState(true);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isErrored, setIsErrored] = React.useState(false);
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const container =
    windowProps !== undefined ? () => windowProps().document.body : undefined;

    const handleClose = () => {
        /* Disconnect */
        props.onClose();
        if (window.rfb) {
            window.rfb.disconnect();
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    }

    React.useEffect(() => {
        if (Object.keys(props.data).length > 0) {
            setTimeout(() => {
                try {
                    setIsLoading(true);
                    let wsUrl = props.data.rfbWsIp.split(":");
                    if (wsUrl[0] == "0.0.0.0") {
                        let daemon_ip = props.data.daemonIp.split(":")[0]
                        wsUrl = `ws${(props.data.rfbWsSecure == false ? "" : "s")}://${daemon_ip}:${wsUrl[1]}`;
                    }
    
                    /* Create RFB Instance */
                    window.rfb = new NoVncClient(displayCanvas.current, wsUrl);
                    window.rfb.viewOnly = viewOnly;
                    window.rfb.background = "#000000";
                    window.rfb.clipViewport = true;
                    window.rfb.scaleViewport = true;
                    
                    /* Events */
                    window.rfb.addEventListener("connect", (e) => {
                        setTimeout(() => {
                            setIsErrored(false);
                            setIsLoading(false);
                        }, 1500);
                    });
                } catch (err) {
                    console.log(err);
                    setIsErrored(true);
                }
            }, 500);            
        }
    }, [props.data]);

        if (Object.keys(props.data).length > 0) {
            return (
                <>
                    <Dialog
                        fullScreen
                        open={props.open}
                        onClose={handleClose}
                        TransitionComponent={Transition}
                        transitionDuration={500}
                        PaperProps={{ sx: { bgcolor: "#000000", color: "#ffffff" } }}
                        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                    >
                        <Toolbar sx={{
                            zIndex: (theme) => theme.zIndex.drawer + 1,
                            display: { xs: "flex", md: "none" }
                        }}>
                            <IconButton><PhonelinkOffIcon /></IconButton>
                            <Button
                                color="display"
                                variant="outlined"
                                onClick={handleClose}
                                startIcon={<PhonelinkOffIcon />}
                            >
                            Disconnect
                            </Button>
                            <Box sx={{ flexGrow: 1, marginLeft: '15px' }}>
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{ lineHeight: "initial", marginTop: '-6px' }}
                            >
                                {props.data.username}
                            </Typography>
                            <Typography
                                variant="caption"
                                component="div"
                                sx={{ lineHeight: "initial" }}
                            >
                                {`${props.data.hostname} ➜ ${props.data.daemonIp}`}
                            </Typography>
                            </Box>
                        </Toolbar>
                        <Box
                            component="nav"
                            sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 } }}
                        >
                            <Drawer
                                container={container}
                                variant="temporary"
                                open={mobileOpen}
                                onClose={handleDrawerToggle}
                                anchor="right"
                                ModalProps={{
                                    keepMounted: true, // Better open performance on mobile.
                                }}
                                sx={{
                                    display: { xs: "block", md: "none" },
                                    "& .MuiDrawer-paper": {
                                        boxSizing: "border-box",
                                        width: drawerWidth,
                                    },
                                }}
                            >
                                <SpifyMonitoringDrawer />
                            </Drawer>
                            <Drawer
                                variant="permanent"
                                anchor="right"
                                sx={{
                                display: { xs: "none", md: "block" },
                                    "& .MuiDrawer-paper": {
                                        boxSizing: "border-box",
                                        width: drawerWidth,
                                    },
                                }}
                                open
                            >
                                <SpifyMonitoringDrawer />
                            </Drawer>
                        </Box>
                        <Box sx={{
                            flexGrow: 1,
                            mr: { md: `${drawerWidth}px` }, 
                            height: { xs: 'calc(100% - 64px)', lg: '100%' },
                            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                            display: (isLoading || isErrored) ? 'flex' : 'none',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '70%', justifyContent: 'center' }}>
                                    <Typography sx={{ alignSelf: 'center', marginBottom: '5px' }} variant="h6">📡 Buzzzzz! Decoding Pixels...</Typography>
                                    <LinearProgress color="secondary" />
                                </Box>
                            }
                        </Box>
                        <Box ref={displayCanvas} sx={{
                            flexGrow: 1, 
                            mr: { md: `${drawerWidth}px` }, 
                            height: { xs: 'calc(100% - 64px)', lg: '100%' },
                            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                            display: (isLoading || isErrored) ? 'none' : 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            
                        </Box>
                    </Dialog>
                </>
            );    
        }
};

export default SpifyMonitoringDisplay;
