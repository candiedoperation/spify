import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  alpha,
} from "@mui/material";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  getCurrentTheme,
  getCurrentThemeComponent,
  toggleTheme,
} from "./../middleware/SpifyAppThemeController";
import SpifyDashboardMonitoring from "../components/SpifyDashboardMonitoring";
import SpifyDashboardLocations from "../components/SpifyDashboardLocations";
import SpifyDashboardDrawer from "../components/SpifyDashboardDrawer";
import SpifyDashboardHome from "../components/SpifyDashboardHome";
import { serverURL } from "./../middleware/SpifyServerParamConn";
import SpifyLogo from "./../components/SpifyLogo";
import axios from "axios";
import "@fontsource/roboto/500.css";

const drawerWidth = 240;
function SpifyDashboard(props) {
  const { window } = props;
  const linkProps = useParams();
  const pageLocation = useLocation();
  const [userAvatar, setUserAvatar] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState("Home");
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    switch (linkProps["*"].split("/")[0]) {
      case "home":
        return setCurrentPage("Home");
      case "monitoring":
        return setCurrentPage("Monitoring");
      case "locations":
        return setCurrentPage("Locations");
      default:
        return setCurrentPage("Dashboard");
    }
  }, [pageLocation]);

  React.useEffect(() => {
    document.title = `Spify ➜ ${currentPage}`;
  }, [currentPage]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const AvatarMenu = (internal_props) => {
    const navigate = useNavigate();
    const [backdrop, setBackdrop] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const logoutAction = () => {
      handleClose();
      setBackdrop(true);
      axios
        .post(`${serverURL}/api/auth/logout`, undefined, {
          withCredentials: true,
        })
        .then((res) => {
          setTimeout(() => {
            navigate("/");
            setBackdrop(false);
          }, 1000);
        });
    };

    return (
      <Box>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={backdrop}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <IconButton edge="start" color="inherit" onClick={handleClick}>
          <Avatar
            sx={{
              width: "40px",
              height: "40px",
              bgcolor: "secondary.main",
              color: "black",
            }}
            src={userAvatar}
          >
            {props.userData.name.charAt(0)}
          </Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem
            sx={{ opacity: "1 !important", minWidth: "250px" }}
            disabled
          >
            <Avatar
              sx={{
                width: "35px",
                height: "35px",
                marginRight: "8px",
                bgcolor: "secondary.main",
                color: "black",
              }}
              src={userAvatar}
            >
              {props.userData.name.charAt(0)}
            </Avatar>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography
                variant="p"
                component="div"
                sx={{ lineHeight: "initial" }}
              >
                {props.userData.name}
              </Typography>
              <Typography
                variant="caption"
                component="div"
                sx={{
                  lineHeight: "initial",
                  fontWeight: "bold",
                  color: "text.disabled",
                }}
              >
                {props.userData.email}
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={props.toggleTheme}>
            <ListItemIcon>
              {getCurrentTheme() === "light" ? (
                <DarkModeIcon />
              ) : (
                <LightModeIcon />
              )}
            </ListItemIcon>
            <ListItemText>
              {getCurrentTheme() === "light" ? "Dark Mode" : "Light Mode"}
            </ListItemText>
          </MenuItem>
          <MenuItem
            sx={{
              ":hover": {
                color: "error.dark",
                backgroundColor: (theme) =>
                  alpha(theme.palette.error.dark, 0.2),
              },
            }}
            onClick={logoutAction}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <LogoutIcon sx={{ color: "inherit" }} />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box
            sx={{ display: { xs: "none", sm: "flex" }, marginRight: "15px" }}
          >
            <SpifyLogo width="42px" />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ lineHeight: "initial" }}
            >
              Spify
            </Typography>
            <Typography
              variant="caption"
              component="div"
              sx={{ lineHeight: "initial" }}
            >
              {currentPage}
            </Typography>
          </Box>
          <AvatarMenu />
        </Toolbar>
      </AppBar>

      <Box sx={{ width: "100%", height: "100%", display: "flex" }}>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            anchor="left"
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            <SpifyDashboardDrawer onClose={() => { setMobileOpen(false) }} currentPage={currentPage} />
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
            open
          >
            <SpifyDashboardDrawer currentPage={currentPage} />
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{ width: "100%", maxHeight: "100%", marginTop: '64px', overflow: "hidden", display: 'flex', flexDirection: 'column' }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="./home" />} />
            <Route
              path="/home/*"
              element={<SpifyDashboardHome userData={props.userData} />}
            />
            <Route
              path="/monitoring/*"
              element={<SpifyDashboardMonitoring userData={props.userData} />}
            />
            <Route
              path="/locations/*"
              element={<SpifyDashboardLocations userData={props.userData} />}
            />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default SpifyDashboard;
