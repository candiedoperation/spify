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

import { createTheme } from "@mui/material";
const themeChangeEvent = new Event("appthemechanged");

const toggleTheme = (emitter) => {
    (localStorage.getItem("theme") === null) ?
        localStorage.setItem("theme", "light") :
        localStorage.setItem("theme", (localStorage.getItem("theme") === 'light') ? 'dark' : 'light')

    if(emitter)
        emitter.dispatchEvent(themeChangeEvent);
}

const getCurrentTheme = () => {
    if (localStorage.getItem("theme") === null) localStorage.setItem("theme", "light")
    return localStorage.getItem('theme');
}

const setCurrentTheme = (theme) => {
    localStorage.setItem("theme", theme);
}

const getCurrentThemeComponent = () => {
    let palette = {
        primary: {
            main: "#7E57C2"
        },
        secondary: {
            main: "#FFC627",
        }
    };

    switch (getCurrentTheme()) {
        case "light":
            palette.mode = 'light';
            return createTheme({
                palette
            })

        case "dark":
            palette.mode = 'dark';
            return createTheme({
                palette
            });
    }
}

export { toggleTheme, getCurrentTheme, setCurrentTheme, getCurrentThemeComponent }