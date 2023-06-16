import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import WidthWideIcon from '@mui/icons-material/WidthWide';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { useNavigate } from 'react-router-dom';

const SpifyDashboardDrawer = (props) => {
    const navigate = useNavigate();
    const [drawerLinks, setDrawerLinks] = React.useState([]);

    React.useEffect(() => {
        setDrawerLinks((drawerLinks) => [...drawerLinks, {
            linkName: 'Home',
            path: './home',
            icon: <HomeIcon />
        }])
    }, []);

    return (
        <List sx={{ marginTop: '64px', padding: '0px' }}>
            {
                drawerLinks.map((drawerLink) => {
                    return (
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { navigate(drawerLink.path); if (props.onClose) props.onClose(); }} selected={(props.currentPage === drawerLink.linkName)}>
                                <ListItemIcon>
                                    {drawerLink.icon}
                                </ListItemIcon>
                                <ListItemText primary={drawerLink.linkName} />
                            </ListItemButton>
                        </ListItem>
                    )
                })
            }
        </List>        
    );
}

export default SpifyDashboardDrawer;