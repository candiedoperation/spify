import React from "react";
import { serverURL } from "../middleware/SpifyServerParamConn";
import axios from "axios";
import TurnLeftIcon from '@mui/icons-material/TurnLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Alert, AlertTitle, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, OutlinedInput, TextField, Typography, alpha } from "@mui/material";
import { Virtuoso } from "react-virtuoso";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import { LoadingButton } from "@mui/lab";
import DeleteIcon from "@mui/icons-material/Delete";

const NewComputerDialog = (props) => {
    const [ipAddressText, setIpAddressText] = React.useState("");
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [isErrored, setIsErrored] = React.useState(false);

    const addComputer = () => {
        setIsConnecting(true);
        axios
            .post(`${serverURL}/api/locations/add_daemon`,
                { host: ipAddressText, loc_id: props.data._id },
                { withCredentials: true }
            )
            .then((res) => {
                /* Update Locations */
                props.refresh();
                props.onClose();
                setIsErrored(false);
                setIsConnecting(false);
            })
            .catch((res) => {
                setIsErrored(true);
                setIsConnecting(false);
            })
    }

    return (
        <Dialog open={props.open}>
            <DialogTitle>Add New Computer</DialogTitle>
            <DialogContent>
                <Alert severity="warning">
                    <AlertTitle>A Daemon needs to be deployed</AlertTitle>
                    <strong>Spify's Daemon needs to be installed in the computer for the Web Client
                    to receive information about Users, Displays and Live Feeds.</strong> You can 
                    download a copy of the installer at <a href="https://spify.atheesh.org/download">
                    https://spify.atheesh.org/download</a>.
                </Alert>
                <TextField 
                    fullWidth
                    value={ipAddressText}
                    onChange={(e) => { setIpAddressText(e.target.value) }}
                    disabled={isConnecting}
                    label="Computer's IP Address"
                    sx={{ marginTop: '20px' }}
                    error={isErrored}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <LoadingButton disabled={(ipAddressText.length < 1 || isConnecting)} onClick={addComputer}>Add Computer</LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

const ComputerStatusListElement = (props) => {
    let computer = props.computer;
    const [online, setOnline] = React.useState(false);
    const [computerName, setComputerName] = React.useState("");

    React.useEffect(() => {
        axios
        .post(`${serverURL}/api/daemondriver/online`,
            { endpoint: computer },
            { withCredentials: true }
        )
        .then((res) => {
            let computerInfo = res.data;
            if (computerInfo.online == true) {
                setOnline(true);
                setComputerName(computerInfo.hostname);
            }
        })
    }, []);  

    const Badge = (props) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    marginRight: '5px',
                    bgcolor: `${(props.status == true) ? "success" : "error"}.main`
                }}/>
                {props.text}
            </Box>
        )
    }

    return (
        <ListItem>
            <ListItemText 
                primary={<Badge status={online} text={computerName.length > 0 ? computerName : "Offline"} />}
                secondary={`${computer}${online == true ? " (Online)" : ""}`}
            />
            <ListItemIcon sx={{ minWidth: '0px' }}>
                <IconButton sx={{ 
                    color: 'error.main',
                    ":hover": { 
                        backgroundColor: (theme) => alpha(theme.palette.error.dark, 0.2) 
                    } 
                }}><DeleteIcon /></IconButton>
            </ListItemIcon>
        </ListItem>
    )
}

const LocationInfoDialog = (props) => {
    const [accordionOpen, setAccordionOpen] = React.useState(0);
    const [updateNameText, setUpdateNameText] = React.useState("");
    const [newComputerOpen, setNewComputerOpen] = React.useState(false);
    const [newComputerData, setNewComputerData] = React.useState({});

    const accordionChanged = (id) => {
        if (accordionOpen == id) setAccordionOpen(0)
        else setAccordionOpen(id)
    }

    const refresh = () => {
        props.refresh();
        props.onClose();
    }

    if (Object.keys(props.location).length > 0) {
        let computers = props.location.spify_daemons;
        return (
            <>
                <NewComputerDialog refresh={refresh} data={newComputerData} open={newComputerOpen} onClose={() => { setNewComputerOpen(false); }} />
                <Dialog fullWidth maxWidth="sm" open={props.open} onClose={props.onClose}>
                    <DialogTitle>{props.location.name}</DialogTitle>
                    <DialogContent>
                        <Accordion expanded={(accordionOpen == 1)} onChange={() => { accordionChanged(1) }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ width: '33%', flexShrink: 0 }}>
                                Name
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{props.location.name}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <OutlinedInput
                                    fullWidth 
                                    value={updateNameText}
                                    onChange={(e) => { setUpdateNameText(e.target.value) }}
                                    placeholder="Update Name"
                                    endAdornment={
                                        <IconButton disabled={(updateNameText.length < 1 || updateNameText == props.location.name)}>
                                            <CheckIcon />
                                        </IconButton>
                                    }
                                />
                            </AccordionDetails>
                        </Accordion>
                        <Accordion expanded={(accordionOpen == 2)} onChange={() => { accordionChanged(2) }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ width: '33%', flexShrink: 0 }}>
                                Computers
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{`${computers.length} Computer${(computers.length != 1 ? "s" : "")}`}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List sx={{ height: '100%' }}>
                                    <ListItemButton onClick={() => {
                                        setNewComputerData(props.location);
                                        setNewComputerOpen(true);
                                    }}>
                                        <ListItemIcon><AddIcon /></ListItemIcon>
                                        <ListItemText>Add New Computer</ListItemText>
                                    </ListItemButton>
                                    <Virtuoso
                                        style={{ height: (computers.length > 5) ? "360px" : `${computers.length * 72}px` }}
                                        data={computers}
                                        itemContent={(index, computer) => {
                                            return (
                                                <ComputerStatusListElement 
                                                    computer={computer} 
                                                    index={index}
                                                />
                                            )
                                        }}
                                    />
                                </List>
                            </AccordionDetails>
                        </Accordion>                    
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={props.onClose}>Close</Button>
                    </DialogActions>
                </Dialog>            
            </>
        );
    }
}

const SpifyDashboardLocations = (props) => {
    const [locationInfoOpen, setLocationInfoOpen] = React.useState(false);
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [errored, setErrored] = React.useState(false);
    const [locationInfoData, setLocationInfoData] = React.useState({});
    const [locations, setLocations] = React.useState([]);

    const getLocations = () => {
        setIsConnecting(false);
        axios
            .post(`${serverURL}/api/locations/list`,
                undefined,
                { withCredentials: true }
            )
            .then((res) => {
                /* Update Locations */
                setLocations((locations) => (res.data));
                setErrored(false);
            })
            .catch((res) => {
                setIsConnecting(false);
                setErrored(true);
            })
    }

    const refresh = () => {
        getLocations();   
    }

    React.useEffect(() => {
        refresh();
    }, []);

    const handleLocationPress = (loc_index) => {
        setLocationInfoData(locations[loc_index])
        setLocationInfoOpen(true);
    }

    return (
        <>
            <LocationInfoDialog refresh={refresh} location={locationInfoData} open={locationInfoOpen} onClose={() => { setLocationInfoOpen(false) }} />
            <Box sx={{ width: '100%', height: '100%', padding: '24px 24px 0px 24px' }}>
                <List sx={{ height: '100%' }}>
                    <Box sx={{ display: locations.length > 0 ? "none" : "block" }}>
                        <Typography variant="h3">No Locations Found</Typography>
                        <Typography variant="h5" sx={{ color: 'text.secondary' }}>If you're an Administrator, You'll be able to Create One</Typography>
                    </Box>
                    <Typography sx={{ display: locations.length < 1 ? "none" : "block" }} variant="h4">Locations</Typography>
                    <Virtuoso
                        data={locations}
                        itemContent={(index, loc) => {
                            let daemon_count = loc.spify_daemons.length;
                            return (
                                <ListItemButton onClick={() => { handleLocationPress(index) }} key={loc._id}>
                                    <ListItemIcon>
                                        <TurnLeftIcon sx={{ transform: "rotate(180deg)" }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                        primary={loc.name}
                                        secondary={`${daemon_count} Computer${daemon_count != 1 ? "s" : ""}`}
                                    />
                                </ListItemButton>                            
                            )
                        }}
                    />
                </List>
            </Box>
        </>
    );
}

export default SpifyDashboardLocations;