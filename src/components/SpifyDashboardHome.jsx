import { Box, Card, Divider, Grid, Typography } from '@mui/material';
import * as React from 'react';
import { useParams } from 'react-router-dom';

const SpifyDashboardHome = (props) => {
    const [links, setLinks] = React.useState([]);

    React.useEffect(() => {
        setLinks((links) => ([
            {}, {}, {}
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
                                }}></Card>
                            </Grid>
                        );
                    })
                }
            </Grid>
        </Box>
    );
}

export default SpifyDashboardHome;