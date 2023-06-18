import * as React from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Pagination, Paper, Select, Skeleton, Typography } from "@mui/material";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SpifyMonitoringDisplay from '../components/SpifyMonitoringDisplay';
import { serverURL } from '../middleware/SpifyServerParamConn';
import axios from 'axios';

const ComputerThumbnail = (props) => {
    const [thumbnailAvailable, setThumbnailAvailable] = React.useState(false);
    const [thumbnailImage, setThumbnailImage] = React.useState("");

    const handleComputerSelect = () => {
        let props_copy = Object.assign({}, props);
        delete props_copy["launchDisplay"];
        props.launchDisplay(props_copy);
    }

    const Badge = (internal_props) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                    marginTop: '4px',
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
                    title={<Badge text={(props.online == false) ? "Offline" : props.username} />} 
                    subheaderTypographyProps={{ noWrap: true,  sx: { maxWidth: '85%' } }}
                    subheader={(props.online == false) ? props.daemonIp : `${props.hostname} ➜ ${props.daemonIp}`} 
                />
                    <CardContent sx={{ minHeight: '200px', padding: '0px', background: '#252525', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        {
                            (thumbnailAvailable == true) ?
                            <img src='' /> :
                            <>
                                <WarningAmberIcon sx={{ color: 'display.warning', fontSize: '2.5rem' }} />
                                <Typography sx={{ color: 'display.warning' }} variant="h6">Display Unavailable</Typography>
                            </>
                        }
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button color="error"><PowerSettingsNewIcon /></Button>
                        <Button><LockIcon /></Button>
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
                        setOnline(true);
                        setComputerName(computerInfo.hostname);
                        setActiveSessions((activeSessions) => internal_res.data);
                    }
                })
            }
        })
    }, []);

    return (
        (online == false) ? <ComputerThumbnail daemonIp={computer} online={online} /> : 
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
            />
        ))
    )
}

const ComputerThumbnailSkeleton = (props) => {
    let skeleton_cards = [1, 2, 3, 4, 5, 6];
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
    const [computerThumbnails, setComputerThumbnails] = React.useState([]);
    const [displayOpen, setDisplayOpen] = React.useState(false);
    const [displayData, setDisplayData] = React.useState({});

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

    const launchDisplay = (computerInfo) => {
        setDisplayData((disp_data) => computerInfo);
        setDisplayOpen(true);
    }

    const destroyDisplay = () => {
        /* Do something if needed in Future */
        setDisplayOpen(false);
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
            computers.map((computer) => (<ComputerThumbnailController launchDisplay={launchDisplay} computer={computer} />))
        ));
    }, [computers])

    return(
        <>
            <SpifyMonitoringDisplay data={displayData} open={displayOpen} onClose={destroyDisplay} />
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