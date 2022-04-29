/*
  ---------------------------------------------------------------------
  secex - Secure File Exchange                                         
  Copyright (c) 2022  phidevz                                          
                                                                       
  This program is free software: you can redistribute it and/or modify 
  it under the terms of the GNU General Public License as published by 
  the Free Software Foundation, either version 3 of the License, or    
  (at your option) any later version.                                  
                                                                       
  This program is distributed in the hope that it will be useful,      
  but WITHOUT ANY WARRANTY; without even the implied warranty of       
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the        
  GNU General Public License for more details.                         
                                                                       
  You should have received a copy of the GNU General Public License    
  along with this program. If not, see <https://www.gnu.org/licenses/>.
  ---------------------------------------------------------------------
*/

import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import i18n from "i18next";
import { initReactI18next } from 'react-i18next';
import { Backend, BackendImpl } from '@secex/backend';
import { UploadPage, DownloadPage, DownloadFilePage, InvalidPath } from '@secex/pages';
import { default as translationResources } from './translations.json';
import App from './App';
import './main.css';

console.log("secex - Secure File Exchange  Copyright (c) 2022  phidevz\n"
  + "This program comes with ABSOLUTELY NO WARRANTY.\n"
  + "This is free software, and you are welcome to redistribute it under certain conditions; see https://github.com/phidevz/secex");

i18n
  .use(initReactI18next)
  .init({ resources: translationResources, lng: "en", fallbackLng: "en", interpolation: { escapeValue: false } });

const backendUrlMeta = document.getElementById("backendUrl") as HTMLMetaElement;
const backendUrl = backendUrlMeta.content.endsWith("/") ? backendUrlMeta.content : backendUrlMeta.content + "/";

export const BackendContext = createContext<Backend>(new BackendImpl(backendUrl));

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<InvalidPath />} />
          <Route path='*' element={<InvalidPath />} />
          <Route path='upload/:id' element={<UploadPage />} />
          <Route path='download/:id' element={<DownloadPage />} />
          <Route path='download/:id/:fileName' element={<DownloadFilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
