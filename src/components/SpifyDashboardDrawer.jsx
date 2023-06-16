import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';
import PlaceIcon from '@mui/icons-material/Place';
import { useNavigate } from 'react-router-dom';

const SpifyDashboardDrawer = (props) => {
    const navigate = useNavigate();
    const [drawerLinks, setDrawerLinks] = React.useState([]);

    React.useEffect(() => {
        setDrawerLinks((drawerLinks) => [...drawerLinks, {
            linkName: 'Home',
            path: './home',
            icon: <HomeIcon />
        }, {
            linkName: 'Monitoring',
            path: './monitoring',
            icon: <VisibilityIcon />
        }, {
            linkName: 'Locations',
            path: './locations',
            icon: <PlaceIcon />
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