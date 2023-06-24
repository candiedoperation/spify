import { Box, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material';
import * as React from 'react';
import { useParams } from 'react-router-dom';

const SpifyDashboardHome = (props) => {
    const [links, setLinks] = React.useState([]);
    const [locations, setLocations] = React.useState(0);

    React.useEffect(() => {
        setLinks((links) => ([
            {
                title: 'Locations', 
                subheader: "You're a Part of...",
                content: <Typography variant='h3'>🏗️</Typography>
            },
            {
                title: 'Computers Monitored', 
                subheader: "All Locations Included",
                content: <Typography variant='h3'>🏗️</Typography>
            },
            {
                title: 'Computers Online', 
                subheader: "Connected to the Network",
                content: <Typography variant='h3'>🏗️</Typography>
            }
        ]));
    }, []);

    return (
        <Box sx={{ padding: '24px 24px 0px 24px' }}>
            <Typography sx={{ display: { xs: 'none', md: 'block' } }} variant="h4">👋 Hello, {props.userData.name}.</Typography>
            <Typography sx={{ display: { xs: 'block', md: 'none' } }} variant="h4">Dashboard</Typography>
            <Divider sx={{ marginTop: '3px', marginBottom: '15px' }} />
            <Grid container spacing={2}>
                {
                    links.map((link) => {
                        return (
                            <Grid item xs={12} md={6} lg={4}>
                                <Card sx={{
                                    ":hover": { transform: "scale(1.01)" },
                                    transition: '0.2s',
                                    width: '100%', 
                                    minHeight: '150px', 
                                }}>
                                    <CardHeader title={link.title} subheader={link.subheader}></CardHeader>
                                    <CardContent>{link.content}</CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                }
            </Grid>
        </Box>
    );
}

export default SpifyDashboardHome;