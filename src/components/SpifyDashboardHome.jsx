import { Box, Card, Divider, Typography } from '@mui/material';
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
        <Box>
            <Typography sx={{ display: { xs: 'none', md: 'block' } }} variant="h4">👋 Hello, {props.userData.name}.</Typography>
            <Divider sx={{ display: { xs: 'none', md: 'block' }, marginTop: '10px' }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {
                    links.map((link) => {
                        return (
                            <Card sx={{
                                ":hover": { transform: "scale(1.1)" },
                                transition: '0.2s',
                                minWidth: { xs: "95%", md: "45%", lg: "30%" }, 
                                minHeight: '150px', 
                                margin: '15px'
                            }}></Card>
                        );
                    })
                }
            </Box>
        </Box>
    );
}

export default SpifyDashboardHome;