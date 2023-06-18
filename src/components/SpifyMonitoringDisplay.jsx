import PhonelinkOffIcon from "@mui/icons-material/PhonelinkOff";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
  Button,
  Dialog,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slide,
  Switch,
  Toolbar,
  Typography,
} from "@mui/material";
import React from "react";
import NoVncClient from '@novnc/novnc/core/rfb';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { serverAddress, serverProtocol, serverURL } from '../middleware/SpifyServerParamConn';
import { format } from "date-fns";
import { Computer, History, Lan, Lock, Logout, Person3, PowerOff, RestartAlt, Security } from "@mui/icons-material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const drawerWidth = 350;
const SpifyMonitoringDisplay = (props) => {
    const { windowProps } = props;
    const displayCanvas = React.useRef();
    const [viewOnly, setViewOnly] = React.useState(true);
    const [dotCursor, setDotCursor] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isErrored, setIsErrored] = React.useState(false);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [sessionOptions, setSessionOptions] = React.useState([]);
    const [powerSettings, setPowerSettings] = React.useState([]);
    const [remoteSettings, setRemoteSettings] = React.useState([]);
    const [drawerAccordionOpen, setDrawerAccordionOpen] = React.useState(1);

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
            /* Update Settings */
            setDrawerAccordionOpen(1);
            setPowerSettings((ps) => ([{
                primary: 'Power Off',
                secondary: 'Turns off the Computer',
                icon: <PowerOff />
            }, {
                primary: 'Reboot',
                secondary: 'Restarts the Computer',
                icon: <RestartAlt />
            }, {
                primary: 'Lock',
                secondary: 'Locks the Current Session',
                icon: <Lock />
            }, {
                primary: 'Sign Out',
                secondary: 'Logs off the Current Session',
                icon: <Logout />
            }]));

            setSessionOptions((ps) => ([{
                primary: props.data.username,
                secondary: "Current User",
                icon: <Person3 />
            }, {
                primary: format(new Date(props.data.logontime * 1000), "MMMM do @ h:mm a OOOO"),
                secondary: "Most Recent Logon",
                icon: <History />
            }, {
                primary: props.data.hostname,
                secondary: "Computer Name",
                icon: <Computer />
            }, {
                primary: props.data.daemonIp,
                secondary: "IP Address",
                icon: <Lan />
            }]));

            setRemoteSettings((ps) => ([{
                primary: "Send Ctrl + Alt + Delete",
                secondary: "Shows Security Options",
                icon: <Security />,
                onClick: () => {
                    window.rfb.sendCtrlAltDel()
                }
            }]))

            /* Wait for Ref to initialize */
            setTimeout(() => {
                try {
                    setIsLoading(true);

                    /*
                        For Direct WSS Connections with the Daemon, spawn the 
                        daemon with the --wss=[IP:PORT] flag, use rfbWsIp:
                        `ws${(props.data.rfbWsSecure == false ? "" : "s")}://${daemon_ip}:${endpointUrl[1]}`
                    */

                    let endpointUrl = props.data.rfbTcpIp.split(":");
                    if (endpointUrl[0] == "0.0.0.0") {
                        let daemon_ip = props.data.daemonIp.split(":")[0]
                        endpointUrl = `${daemon_ip}:${endpointUrl[1]}`;
                    }
    
                    /* Create RFB Instance */
                    let ws_proxy = `ws${(serverProtocol == "https") ? "s" : ""}://${serverAddress}`
                    let websocket = new WebSocket(ws_proxy);
                    websocket.addEventListener("open", (e) => {
                        websocket.send(`SPIFY\r\nENDPOINT\r\n${endpointUrl}`);
                    });

                    window.rfb = new NoVncClient(displayCanvas.current, websocket);
                    window.rfb.viewOnly = viewOnly;
                    window.rfb.showDotCursor = dotCursor;
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

    React.useEffect(() => {
        if (window.rfb) {
            window.rfb.showDotCursor = dotCursor;
        }
    }, [dotCursor])

    React.useEffect(() => {
        if (window.rfb) {
            window.rfb.viewOnly = viewOnly;
        }
    }, [viewOnly]);

    const SpifyMonitoringDrawer = (internal_props) => {
        const accordionChanged = (e) => {
            if (!isLoading && !isErrored) {
                if (drawerAccordionOpen == e) {
                    setDrawerAccordionOpen(0);
                } else {
                    setDrawerAccordionOpen(e);
                }
            }
        }

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <Button onClick={handleClose} startIcon={<PhonelinkOffIcon />} disabled={(isLoading || isErrored)} variant="outlined" color="error" sx={{ margin: '10px' }}>Disconnect</Button>
                <Divider />
                <Box sx={{ flexGrow: 1, maxHeight: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
                    <Accordion expanded={(drawerAccordionOpen == 1)} onChange={() => { accordionChanged(1) }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Session Information
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {
                                    sessionOptions.map((option) => (
                                        <ListItemButton onClick={(option.onClick) ? option.onClick : () => {}}>
                                            <ListItemIcon>{option.icon}</ListItemIcon>
                                            <ListItemText primary={option.primary} secondary={option.secondary} />
                                        </ListItemButton>
                                    ))
                                }
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={(drawerAccordionOpen == 2)} onChange={() => { accordionChanged(2) }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Power and Session Options
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                {
                                    powerSettings.map((option) => (
                                        <ListItemButton onClick={(option.onClick) ? option.onClick : () => {}}>
                                            <ListItemIcon>{option.icon}</ListItemIcon>
                                            <ListItemText primary={option.primary} secondary={option.secondary} />
                                        </ListItemButton>
                                    ))
                                }
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={(drawerAccordionOpen == 3)} onChange={() => { accordionChanged(3) }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            Connection Settings
                        </AccordionSummary>
                        <AccordionDetails>
                            <List>
                                <ListItem>
                                    <FormControlLabel label="View Only" control={<Switch onChange={(e) => { setViewOnly(e.target.checked) }} checked={viewOnly} />} />
                                </ListItem>
                                <ListItem>
                                    <FormControlLabel disabled={viewOnly} label="Show Dot Cursor" control={<Switch onChange={(e) => { setDotCursor(e.target.checked) }} checked={dotCursor} />} />
                                </ListItem>
                                {
                                    remoteSettings.map((option) => (
                                        <ListItemButton onClick={(option.onClick) ? option.onClick : () => {}}>
                                            <ListItemIcon>{option.icon}</ListItemIcon>
                                            <ListItemText primary={option.primary} secondary={option.secondary} />
                                        </ListItemButton>
                                    ))
                                }
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Box>
        )
    }

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
                        height: { xs: 'calc(100% - 64px)', md: '100%' },
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

                    { /* Enables Pinch to Zoom in ViewOnly Mode */ }
                    <Box
                        sx={{
                            top: { xs: '64px', md: '0px' },
                            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                            height: { xs: 'calc(100% - 64px)', md: '100%' },
                            position: 'absolute',
                            display: (viewOnly == true) ? 'flex' : 'none'
                        }}
                    />

                    { /* Define RFB Target */ }
                    <Box ref={displayCanvas} sx={{
                        flexGrow: 1, 
                        mr: { md: `${drawerWidth}px` }, 
                        height: { xs: 'calc(100% - 64px)', md: '100%' },
                        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                        display: (isLoading || isErrored) ? 'none' : 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}/>
                </Dialog>
            </>
        );    
    }
};

export default SpifyMonitoringDisplay;
