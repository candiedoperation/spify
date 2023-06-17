/*
    Spify - Cross Platform Classroom Monitoring
    Copyright (C) 2023  Atheesh Thirumalairajan

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import * as React from 'react';
import axios from "axios";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { serverURL } from "./middleware/SpifyServerParamConn";
import { Box, CssBaseline, LinearProgress, ThemeProvider, Typography } from '@mui/material';
import { getCurrentTheme, getCurrentThemeComponent, toggleTheme } from './middleware/SpifyAppThemeController';
import SpifyDashboard from './integrals/SpifyDashboard';
import SpifyLogin from './integrals/SpifyLogin';

const CheckAuth = (props) => {
  const [authenticated, setAuthenticated] = React.useState(false);
  const linkLocation = useLocation();

  React.useEffect(() => {
    axios
      .post(`${serverURL}/api/auth/verify`,
        undefined,
        { withCredentials: true }
      )
      .then((res) => {
        setTimeout(() => {
          props.setUserData(() => (res.data))
          props.setAuthenticated(2)
          setAuthenticated(2)
        }, 700);
      })
      .catch((res) => {
        setTimeout(() => {
          props.setAuthenticated(1);
          setAuthenticated(1);
        }, 1200);
      })
  }, [])

  const LoadingPageElement = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6">🧐 Confirming it's you!</Typography>
        <LinearProgress sx={{ width: '80%' }} />
      </Box>
    )
  }

  switch (authenticated) {
    case 0: return (<LoadingPageElement />)
    case 1: return (<Navigate to={`/login?for=${linkLocation.pathname}`} />)
    case 2: return (props.children)
  }
}

const App = () => {
  const [authenticated, setAuthenticated] = React.useState(0);
  const [userData, setUserData] = React.useState({});
  const [themeMode, setThemeMode] = React.useState(getCurrentTheme());
  const [appTheme, setAppTheme] = React.useState(getCurrentThemeComponent())

  React.useEffect(() => {
    setAppTheme(getCurrentThemeComponent())
  }, [themeMode])

  const toggleThemeWrapper = () => {
    toggleTheme(window);
    setThemeMode(getCurrentTheme())
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} exact></Route>
        <Route path="/login" element={<SpifyLogin toggleTheme={toggleThemeWrapper} />} exact></Route>
        <Route path="/dashboard/*" element={<CheckAuth setAuthenticated={setAuthenticated} setUserData={setUserData}><SpifyDashboard toggleTheme={toggleThemeWrapper} userData={userData} /></CheckAuth>}></Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;