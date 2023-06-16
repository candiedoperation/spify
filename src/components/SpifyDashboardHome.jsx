import { Box, Divider, Typography } from '@mui/material';
import * as React from 'react';
import { useParams } from 'react-router-dom';

const SpifyDashboardHome = (props) => {
    return (
        <Box>
            <Typography sx={{ display: { xs: 'none', md: 'block' } }} variant="h4">👋 Hello, {props.userData.name}.</Typography>
            <Divider sx={{ display: { xs: 'none', md: 'block' }, marginTop: '10px' }} />
        </Box>
    );
}

export default SpifyDashboardHome;