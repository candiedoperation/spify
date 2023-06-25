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

let isProd = (process.env.NODE_ENV == "production");
let wURL = new URL(window.location.href);
let serverProtocol = isProd ? wURL.protocol.split(":")[0] : "https";
let serverIP = isProd ? wURL.hostname : "3001.local.atheesh.org";
let serverPort = isProd ? ((wURL.port != "") ? wURL.port : 
    ((serverProtocol == "http") ? "80" : "443")) : "443";

/* Collate Constants */
let serverAddress = `${serverIP}:${serverPort}`;
let serverURL = `${serverProtocol}://${serverAddress}`;

module.exports = { serverURL, serverIP, serverPort, serverAddress, serverProtocol };
