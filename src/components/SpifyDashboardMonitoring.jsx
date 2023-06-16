import * as React from 'react';
import { Box, Card, CardActions, CardContent, CardHeader, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Skeleton, Typography } from "@mui/material";
import { serverURL } from '../middleware/SpifyServerParamConn';
import axios from 'axios';

const ComputerThumbnail = (props) => {
    return (
        <Grid item xs={12} md={6} lg={4}>
            <Card sx={{
                ":hover": { transform: "scale(1.01)" },
                transition: '0.2s',
                width: "100%", 
                minHeight: '150px', 
            }}></Card>
        </Grid>
    )
}

const ComputerThumbnailSkeleton = (props) => {
    let skeleton_cards = [1, 2, 3, 4, 5, 6];
    return (
        <Grid container spacing={2}>
            {
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
                            <CardActions sx={{ display: 'flex', justifyContent: 'end' }}>
                                <Skeleton sx={{ marginRight: '10px' }} width="25%" height="35px" variant='rounded' />
                                <Skeleton width="25%" height="35px" variant='rounded' />
                            </CardActions>
                        </Card>
                    </Grid>
                ))
            }
        </Grid>
    )
}

const SpifyDashboardMonitoring = (props) => {
    const [location, setLocation] = React.useState("");
    const [computers, setComputers] = React.useState([]);
    const [locations, setLocations] = React.useState([]);
    const [errored, setErrored] = React.useState(false);
    const [isConnecting, setIsConnecting] = React.useState(false);

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
                    }, 1000);
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

    React.useEffect(() => {
        getLocations();
    }, []);

    React.useEffect(() => {
        /* Process, Location Changed */
        getComputers();
    }, [location]);

    return(
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                    <Box sx={{ marginTop: '25px' }}>
                        {
                            isConnecting == false ?
                                (computers.length < 2) ? 
                                <>
                                    <Typography variant='h4'>No Computers in this Location</Typography>
                                    <Typography variant='h5' sx={{ color: 'text.secondary' }}>Add one using the Locations Tab</Typography>
                                </>
                                : <Typography variant='h4'>Computers</Typography>
                            : 
                            <>
                                <ComputerThumbnailSkeleton />
                            </>
                        }
                        <Grid container spacing={2} marginTop="15px">
                            { computers.map((computer) => (<ComputerThumbnail data={computer} />)) }
                        </Grid>
                    </Box>
                </> :
                <Box>
                    <Typography variant='h3'>No Computers Found</Typography>
                    <Typography variant='h5' sx={{ color: 'text.secondary' }}>You Aren't a part of any Location. You'll find Computers here once you're added.</Typography>
                </Box>
            }
        </Box>
    );
}

export default SpifyDashboardMonitoring;