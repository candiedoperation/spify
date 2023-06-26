import * as React from 'react';
import { Alert, AlertTitle, Box, Button, Card, CardActions, CardContent, CardHeader, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Pagination, Paper, Select, Skeleton, TextField, Typography } from "@mui/material";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SpifyMonitoringDisplay from '../components/SpifyMonitoringDisplay';
import { serverURL } from '../middleware/SpifyServerParamConn';
import axios from 'axios';

const ComputerThumbnail = (props) => {
    let thumbnailInterval;
    const [thumbnailAvailable, setThumbnailAvailable] = React.useState(false);
    const [thumbnailImage, setThumbnailImage] = React.useState("");
    const [websockEndpointURL, setWebsockEndpointURL] = React.useState("");

    async function pngEncode(array) {
        return new Promise((res) => {
          const blob = new Blob([array]);
          const reader = new FileReader();
          
          reader.onload = (event) => {
            const dataUrl = event.target.result;
            res(dataUrl);
          };
          
          reader.readAsDataURL(blob);
        });
    }

    React.useEffect(() => {
        if (props.online == true) {
            let wsEndpointUrl = props.rfbWsIp.split(":");
            if (wsEndpointUrl[0] == "0.0.0.0") {
                let daemon_ip = props.daemonIp.split(":")[0]
                wsEndpointUrl = `${daemon_ip}:${wsEndpointUrl[1]}`;
            }

            setWebsockEndpointURL(wsEndpointUrl);
            const getDisplayPreview = () => {
                if (wsEndpointUrl != "") {
                    axios
                        .post(`${serverURL}/api/daemondriver/screenshot`,
                            { endpoint: wsEndpointUrl, secure: props.rfbWsSecure },
                            { withCredentials: true, responseType: 'arraybuffer' }
                        )
                        .then(async (res) => {
                            /* Update Locations */
                            setThumbnailImage(await pngEncode(res.data));
                            setThumbnailAvailable(true);
                        })
                        .catch((res) => {
                            clearInterval(thumbnailInterval);
                            setThumbnailAvailable(false)
                        })  
                }              
            }

            /* Get Screenshot on Page Load */
            getDisplayPreview();
        } else {
            /* Destroy Timer if Exists */
            clearInterval(thumbnailInterval);
            setThumbnailAvailable(false);
            setThumbnailImage("");
        }
    }, [props.online]);

    const handleComputerSelect = () => {
        if (props.online == true) {
            let props_copy = Object.assign({}, props);
            delete props_copy["launchDisplay"];
            props.launchDisplay(props_copy);
        }
    }

    const handleOff = (e) => {
        e.stopPropagation();
        props.powerOff(websockEndpointURL, "Shutdown", props.rfbWsSecure);
    }

    const handleLock = (e) => {
        e.stopPropagation();
        if (websockEndpointURL) {
            axios.post(
                `${serverURL}/api/daemondriver/power/lock`,
                { endpoint: websockEndpointURL },
                { withCredentials: true }
            );
        }
    }

    const handleSettings = (e) => {
        e.stopPropagation();
    }

    const Badge = (internal_props) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                    width: '13px',
                    height: '13px',
                    borderRadius: '50%',
                    marginRight: '5px',
                    bgcolor: `${(props.online == true) ? "success" : "error"}.main`
                }}/>
                <Typography noWrap sx={{ maxWidth: '85%' }} variant='h5'>{internal_props.text}</Typography>
            </Box>
        )
    }

    return (
        <Grid item xs={12} md={6} lg={4}>
            <Card onClick={handleComputerSelect} sx={{
                ":hover": { transform: "scale(1.01)", cursor: "pointer" },
                transition: '0.2s',
                width: "100%", 
            }}>
                <CardHeader 
                    title={<Badge text={(props.online == false) ? ((props.errorCode == 401) ? "Authentication Failure" : "Offline") : (props.username.charAt(0).toUpperCase() + props.username.substr(1))} />} 
                    subheaderTypographyProps={{ noWrap: true,  sx: { maxWidth: '85%' } }}
                    subheader={(props.online == false) ? props.daemonIp : `${props.hostname} ➜ ${props.daemonIp}`} 
                />
                    <CardContent sx={{ minHeight: '200px', padding: '0px', background: '#252525', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {
                            (thumbnailAvailable == true) ?
                            <CardMedia
                                component="img"
                                height="200px"
                                sx={{ objectPosition: "top right" }}
                                image={thumbnailImage}
                                onError={() => { setThumbnailAvailable(false) }}
                            /> :
                            <>
                                <WarningAmberIcon sx={{ color: 'display.warning', fontSize: '2.5rem' }} />
                                <Typography sx={{ color: 'display.warning' }} variant="h6">Display Unavailable</Typography>
                            </>
                        }
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button onClick={handleOff} color="error"><PowerSettingsNewIcon /></Button>
                        <Button onClick={handleLock}><LockIcon /></Button>
                        <Button><SettingsIcon /></Button>
                    </CardActions>
            </Card>
        </Grid>
    )
}

const ComputerThumbnailController = (props) => {
    const [activeSessions, setActiveSessions] = React.useState([]);
    const [computer, setComputer] = React.useState(props.computer);
    const [computerName, setComputerName] = React.useState("");
    const [errorCode, setErrorCode] = React.useState(0);
    const [online, setOnline] = React.useState(false);
    
    React.useEffect(() => {
        setOnline(false);
        setComputerName("");
        setActiveSessions((activeSessions) => []);

        axios
        .post(`${serverURL}/api/daemondriver/online`,
            { endpoint: computer },
            { withCredentials: true }
        )
        .then((res) => {
            let computerInfo = res.data;
            if (computerInfo.online == true) {
                axios
                .post(`${serverURL}/api/daemondriver/session`,
                    { endpoint: computer },
                    { withCredentials: true }
                )
                .then((internal_res) => {
                    if (internal_res.data.length > 0) {
                        let filtered_sessions = internal_res.data.filter(
                            activeSession => 
                            activeSession.username.trim() != "＠"
                        );

                        setOnline(true);
                        setComputerName(computerInfo.hostname);
                        setActiveSessions((activeSessions) => filtered_sessions);
                    }
                })
            } else {
                /* Set Error Detail */
                setErrorCode(computerInfo.errorCode)
                if (computerInfo.errorCode == 401) {
                    props.showAuthenticationError()
                }
            }
        })
    }, []);

    return (
        (online == false) ? <ComputerThumbnail daemonIp={computer} errorCode={errorCode} online={online} /> : 
        activeSessions.map((session) => (
            <ComputerThumbnail
                daemonIp={computer}
                online={true}
                hostname={computerName}
                logontime={session.logontime}
                rfbTcpIp={session.ip}
                rfbWsIp={session.ws}
                rfbWsSecure={session.ws_secure}
                username={session.username}
                launchDisplay={props.launchDisplay}
                powerOff={props.powerOff}
            />
        ))
    )
}

const ComputerThumbnailSkeleton = (props) => {
    let skeleton_cards = [1, 2, 3];
    return (
        skeleton_cards.map(() => (
            <Grid item xs={12} md={6} lg={4}>
                <Card sx={{
                    width: "100%", 
                    ":hover": { transform: "scale(1.01)" },
                    transition: '0.2s',
                }}>
                    <CardHeader title={<>
                        <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '40%' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem', width: '30%' }} />
                    </>} />
                    <CardContent sx={{ padding: '0px' }}>
                        <Skeleton width="100%" height="150px" variant='rectangular' />
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Skeleton width="64px" height="35px" variant='rounded' />
                        <Skeleton width="64px" height="35px" variant='rounded' />
                        <Skeleton width="64px" height="35px" variant='rounded' />
                    </CardActions>
                </Card>
            </Grid>
        ))
    )
}

const SpifyDashboardMonitoring = (props) => {
    const [location, setLocation] = React.useState("");
    const [computers, setComputers] = React.useState([]);
    const [locations, setLocations] = React.useState([]);
    const [errored, setErrored] = React.useState(false);
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [thumbnailsPage, setThumbnailsPage] = React.useState(0);
    const [powerOffSecure, setPowerOffSecure] = React.useState(false);
    const [powerOffConfirmOpen, setPowerOffConfirmOpen] = React.useState(false);
    const [powerOffConfirmType, setPowerOffConfirmType] = React.useState("");
    const [powerOffConfirmEndpoint, setPowerOffConfirmEndpoint] = React.useState("");
    const [computerThumbnails, setComputerThumbnails] = React.useState([]);
    const [displayOpen, setDisplayOpen] = React.useState(false);
    const [displayData, setDisplayData] = React.useState({});
    const [authenticationErrorVisible, setAuthenticationErrorVisible] = React.useState(false);
    const [authFailureInstructionsOpen, setAuthFailureInstructionsOpen] = React.useState(false);

    const AuthFailureInstructions = (props) => {
        const [serverId, setServerId] = React.useState("");

        React.useEffect(() => {
            axios
                .get(`${serverURL}/api/daemondriver/serverid`, { withCredentials: true })
                .then((res) => {
                    setServerId(res.data.serverid);
                })
                .catch((err) => {
                    setServerId("Server Error")
                })
        }, []);

        return (
            <Dialog fullWidth maxWidth="sm" open={props.open} onClose={props.onClose}>
                <DialogTitle>Fixing an Authentication Failure</DialogTitle>
                <DialogContent>
                    To fix an Authentication Failure, You need to update the Spify Daemon
                    Configuration file in the Computer you're trying to access. 
                    <strong>
                        Open config.json, it's present in the directory Spify's Installed
                        and add this Server's Private ID to the Paired Servers Array.
                    </strong>
                    
                    <Alert sx={{ marginTop: '10px' }} severity='error'>
                        <AlertTitle>Server Private ID</AlertTitle>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2">This ID should be kept safely. It can be used by an Impersonator
                            to view all computers that this server is paired with.</Typography>
                            <TextField inputProps={{ style: { textAlign: 'center' } }} sx={{ marginTop: '15px', marginBottom: '5px', color: 'text.primary' }} value={serverId}></TextField>
                        </Box>
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose}>Close</Button>
                </DialogActions>
            </Dialog>         
        )
    }

    const getComputers = () => {
        if (location != "") {
            setIsConnecting(true);
            setComputers((computers) => []);
            axios
                .post(`${serverURL}/api/locations/daemons`,
                    { loc_id: location },
                    { withCredentials: true }
                )
                .then((res) => {
                    setTimeout(() => {
                        setComputers((computers) => res.data)
                        setIsConnecting(false);
                    }, 900);
                    setErrored(false);
                })
                .catch((res) => {
                    setIsConnecting(false);
                    setErrored(true);
                })            
        }
    }

    const getLocations = () => {
        setIsConnecting(true);
        axios
            .post(`${serverURL}/api/locations/list`,
                undefined,
                { withCredentials: true }
            )
            .then((res) => {
                /* Update Locations */
                setLocation(res.data[0]._id);
                setLocations((locations) => (res.data));
                setIsConnecting(false);
                setErrored(false);
            })
            .catch((res) => {
                setIsConnecting(false);
                setErrored(true);
            })
    }    

    const handlePageChange = (e) => {

    }

    const handlePowerOffRequest = (endpoint, type, secure) => {
        setPowerOffConfirmEndpoint(endpoint);
        setPowerOffConfirmOpen(true);
        setPowerOffConfirmType(type);
        setPowerOffSecure(secure);
    }

    const handlePowerOffConfirm = () => {
        if (powerOffConfirmType == "Sign Out") {
            axios.post(
                `${serverURL}/api/daemondriver/power/logoff`,
                { endpoint: powerOffConfirmEndpoint, secure: powerOffSecure },
                { withCredentials: true }
            );
        } else if (powerOffConfirmType == "Shutdown") {
            axios.post(
                `${serverURL}/api/daemondriver/power/shutdown`,
                { endpoint: powerOffConfirmEndpoint, secure: powerOffSecure },
                { withCredentials: true }
            );
        } else if (powerOffConfirmType == "Restart") {
            axios.post(
                `${serverURL}/api/daemondriver/power/reboot`,
                { endpoint: powerOffConfirmEndpoint, secure: powerOffSecure },
                { withCredentials: true }
            );
        }

        /* Close Dialog */
        setPowerOffConfirmEndpoint("");
        setPowerOffConfirmOpen(false);
        setPowerOffConfirmType("");
        setPowerOffSecure(false);
    }

    const launchDisplay = (computerInfo) => {
        setDisplayData((disp_data) => computerInfo);
        setDisplayOpen(true);
    }

    const destroyDisplay = () => {
        /* Do something if needed in Future */
        setDisplayOpen(false);
    }

    const showAuthError = () => {
        setAuthenticationErrorVisible(true);
    }

    const showAuthFailureInstructions = (e) => {
        e.preventDefault();
        setAuthFailureInstructionsOpen(true);
    }

    React.useEffect(() => {
        getLocations();
    }, []);

    React.useEffect(() => {
        /* Process, Location Changed */
        getComputers();
    }, [location]);

    React.useEffect(() => {
        /* Set Computer Thumbnails */
        setComputerThumbnails((ct) => (
            computers.map((computer) => (<ComputerThumbnailController showAuthenticationError={showAuthError} powerOff={handlePowerOffRequest} launchDisplay={launchDisplay} computer={computer} />))
        ));
    }, [computers])

    return(
        <>
            <SpifyMonitoringDisplay powerOff={handlePowerOffRequest} data={displayData} open={displayOpen} onClose={destroyDisplay} />
            <AuthFailureInstructions open={authFailureInstructionsOpen} onClose={() => { setAuthFailureInstructionsOpen(false) }} />
            <Dialog open={powerOffConfirmOpen}>
                <DialogTitle>{`Continue ${powerOffConfirmType}?`}</DialogTitle>
                <DialogContent>
                    This could cause data-loss if users are still using the 
                    computer. Documents and Applications currently opened
                    by people using this computer would be closed.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setPowerOffConfirmOpen(false) }}>Cancel</Button>
                    <Button color='error' onClick={handlePowerOffConfirm}>{powerOffConfirmType}</Button>
                </DialogActions>
            </Dialog>
            <Box sx={{ width: '100%', height: "100%", display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ flexGrow: 1, height: "0%", display: 'flex', flexDirection: 'column', padding: '24px 24px 0px 24px' }}>
                    {
                        locations.length > 0 ?
                        <>
                            <FormControl sx={{ width: { sm: '100%', md: '70%', lg: '35%' } }}>
                            <InputLabel id="location">Location</InputLabel>
                            <Select
                                labelId="location"
                                value={location}
                                label="Location"
                                onChange={(e) => { if (e.target.value != "add") { setLocation(e.target.value) } }}
                            >
                                {
                                    locations.map((location, index) => {
                                        return(
                                            <MenuItem value={location._id}>{location.name}</MenuItem>
                                        );
                                    })
                                }
                            </Select>
                            </FormControl>
                            <Box sx={{ marginTop: '15px' }}>
                                {
                                    isConnecting == false ?
                                        (computers.length < 1) ? 
                                        <>
                                            <Typography variant='h4'>No Computers in this Location</Typography>
                                            <Typography variant='h5' sx={{ color: 'text.secondary' }}>Add one using the Locations Tab</Typography>
                                        </>
                                        : <Typography variant='h4'>Computers</Typography>
                                    : 
                                    <></>
                                }
                            </Box>
                            <Box sx={{ flexGrow: 1, maxHeight: '100%', marginTop: "15px", padding: '10px 10px 20px 10px', overflowY: 'auto' }}>
                                <Alert sx={{ marginBottom: '15px', display: (authenticationErrorVisible) ? 'flex' : 'none' }} severity='warning'>
                                    <AlertTitle>Probable Authentication Failure</AlertTitle>
                                    Authentication Failures occur when the Spify Webserver is not paired
                                    with the Spify Daemon installed on the client computer.<br/> For pairing
                                    this server to the client, <a href='#' onClick={showAuthFailureInstructions}>Follow these Instructions</a>.
                                </Alert>
                                <Grid container spacing={2}>
                                    {
                                        (isConnecting == true) ? 
                                            <ComputerThumbnailSkeleton /> : 
                                            computerThumbnails
                                    }
                                </Grid>
                            </Box>
                        </> :
                        <Box>
                            <Typography variant='h3'>No Computers Found</Typography>
                            <Typography variant='h5' sx={{ color: 'text.secondary' }}>You Aren't a part of any Location. You'll find Computers here once you're added.</Typography>
                        </Box>
                    }
                </Box>  
                <Divider />
                <Box sx={{ margin: '15px 0px 15px 0px', alignSelf: 'center' }}>
                    <Pagination count={Math.ceil((computerThumbnails.length / 6))} onChange={handlePageChange} variant="outlined" color="secondary" />
                </Box>
            </Box>        
        </>
    );
}

export default SpifyDashboardMonitoring;