import React from "react";
import { serverURL } from "../middleware/SpifyServerParamConn";
import axios from "axios";
import TurnLeftIcon from '@mui/icons-material/TurnLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Alert, AlertTitle, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, OutlinedInput, TextField, Typography, alpha, Chip, InputAdornment, Autocomplete } from "@mui/material";
import { Virtuoso } from "react-virtuoso";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import Groups2Icon from '@mui/icons-material/Groups2';
import { LoadingButton } from "@mui/lab";
import DeleteIcon from "@mui/icons-material/Delete";

const NewLocationDialog = (props) => {
    const [isConnecting, setIsConnecting] = React.useState(false);
    const [isErrored, setIsErrored] = React.useState(false);
    const [locName, setLocName] = React.useState("");
    const [ldapGroups, setLdapGroups] = React.useState([]);
    const [controlledGroups, setControlledGroups] = React.useState("");

    const addLocation = () => {
        setIsConnecting(true);
        axios
            .post(`${serverURL}/api/locations/create`,
                { name: locName, ldapGroups },
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

    return(
        <Dialog fullWidth maxWidth="sm" open={props.open} onClose={props.onClose}>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogContent>
                <TextField 
                    fullWidth
                    value={locName}
                    onChange={(e) => { setLocName(e.target.value) }}
                    disabled={isConnecting}
                    label="Location Name"
                    sx={{ marginTop: '10px' }}
                    error={isErrored}
                />
                <Autocomplete 
                    fullWidth
                    disabled={isConnecting}
                    sx={{ marginTop: '15px' }}
                    error={isErrored}
                    multiple
                    freeSolo
                    options={[]}
                    onChange={(e, value) => { setLdapGroups((lg) => value) }}
                    renderTags={(value, getTagProps) => (
                        value.map((ldapGroup, index) => (
                            <Chip label={ldapGroup} { ...getTagProps({ index }) } />
                        ))
                    )}
                    renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          placeholder="Type LDAP Group and Press Enter"
                        />
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <LoadingButton disabled={(locName.length < 1 || isConnecting)} onClick={addLocation}>Add Location</LoadingButton>
            </DialogActions>
        </Dialog>
    );
}

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

    const handleDelete = (daemon_id, loc_id) => {
        axios
        .post(`${serverURL}/api/locations/delete_daemon`,
            { daemon_id, loc_id },
            { withCredentials: true }
        )
        .then(() => {
            props.refresh();
        })
    }

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
                <IconButton 
                    onClick={() => {
                        handleDelete(computer, props.locationId)
                    }}
                    sx={{ 
                        color: 'error.main',
                        ":hover": { 
                            backgroundColor: (theme) => alpha(theme.palette.error.dark, 0.2) 
                        } 
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </ListItemIcon>
        </ListItem>
    )
}

const LocationInfoDialog = (props) => {
    const [accordionOpen, setAccordionOpen] = React.useState(0);
    const [updateNameText, setUpdateNameText] = React.useState("");
    const [newComputerOpen, setNewComputerOpen] = React.useState(false);
    const [newComputerData, setNewComputerData] = React.useState({});
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [deleteData, setDeleteData] = React.useState({});

    const accordionChanged = (id) => {
        if (accordionOpen == id) setAccordionOpen(0)
        else setAccordionOpen(id)
    }

    const refresh = () => {
        props.refresh();
        props.onClose();
    }

    const completeDelete = (loc_id) => {
        axios
            .post(`${serverURL}/api/locations/delete`,
                { loc_id },
                { withCredentials: true }
            )
            .finally(() => {
                setDeleteOpen(false);
                setDeleteData({});
                refresh();
            })
    }

    if (Object.keys(props.location).length > 0) {
        let computers = props.location.spify_daemons;
        let ldapGroups = props.location.ldap_groups;

        return (
            <>
                <NewComputerDialog refresh={refresh} data={newComputerData} open={newComputerOpen} onClose={() => { setNewComputerOpen(false); }} />
                <Dialog fullWidth maxWidth="sm" open={deleteOpen}>
                    <DialogTitle>Delete Location?</DialogTitle>
                    <DialogContent>
                        Deleting <strong>{deleteData.name}</strong> will delete all the
                        computers that are a part of it. This also revokes access to all
                        those who are using this location to view the computers that are 
                        a part of this.
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setDeleteOpen(false); }}>Close</Button>
                        <Button color="error" onClick={() => { completeDelete(deleteData._id) }}>Delete</Button>
                    </DialogActions>
                </Dialog>
                <Dialog fullWidth maxWidth="sm" open={props.open} onClose={props.onClose}>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{ flexGrow: 1 }} variant="h6">{props.location.name}</Typography>
                        <Button 
                            sx={{ borderRadius: '8px', minWidth: '0px' }} 
                            color="error" 
                            onClick={() => {
                                setDeleteData(props.location);
                                setDeleteOpen(true);
                            }}
                        >
                            <DeleteIcon />
                        </Button>
                    </DialogTitle>
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
                                                    locationId={props.location._id}
                                                    index={index}
                                                    refresh={refresh}
                                                />
                                            )
                                        }}
                                    />
                                </List>
                            </AccordionDetails>
                        </Accordion>    
                        <Accordion expanded={(accordionOpen == 3)} onChange={() => { accordionChanged(3) }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ width: '33%', flexShrink: 0 }}>
                                LDAP Groups
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>{`${ldapGroups.length} Group${(ldapGroups.length != 1 ? "s" : "")}`}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List sx={{ height: '100%' }}>
                                    <ListItemButton>
                                        <ListItemIcon><AddIcon /></ListItemIcon>
                                        <ListItemText>Add New Groups</ListItemText>
                                    </ListItemButton>
                                    <Virtuoso
                                        style={{ height: (ldapGroups.length > 5) ? "360px" : `${ldapGroups.length * 72}px` }}
                                        data={ldapGroups}
                                        itemContent={(index, group) => {
                                            return (
                                                <ListItem>
                                                    <ListItemIcon><Groups2Icon /></ListItemIcon>
                                                    <ListItemText primary={group} secondary="Have access to All Computers Here" />
                                                    <IconButton color="error"><DeleteIcon /></IconButton>
                                                </ListItem>
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
    const [newLocationOpen, setNewLocationOpen] = React.useState(false);
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
            <NewLocationDialog refresh={refresh} open={newLocationOpen} onClose={() => { setNewLocationOpen(false); }} />
            <LocationInfoDialog refresh={refresh} location={locationInfoData} open={locationInfoOpen} onClose={() => { setLocationInfoOpen(false) }} />
            <Box sx={{ width: '100%', height: '100%', padding: '24px 24px 0px 24px' }}>
                <Button onClick={() => { setNewLocationOpen(true) }} startIcon={<AddIcon />} variant="contained">Add Location</Button>
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