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

import { Button, Dropdown, Menu } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { Version } from './Version';

enum Languages {
  de = 'de',
  en = 'en'
}

export default function App() {
  const { i18n } = useTranslation();

  const de = (
    <div className="language">
      <img height={16} width={27} alt="Flag of Germany" src='https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg' />
      <span>Deutsch</span>
    </div>
  );
  const en = (
    <div className='language'>
      <img height={16} width={27} alt="Flag of the United Kingdom" src='https://upload.wikimedia.org/wikipedia/commons/a/ae/Flag_of_the_United_Kingdom.svg' />
      <span>English</span>
    </div>
  );
  const languageElements = {
    de: de,
    en: en
  };
  const menu = (
    <Menu className='language-select'
      items={[
        {
          label: <Button type="link" onClick={e => { e.preventDefault(); setLanguage(Languages.de) }}>{de}</Button>,
          key: 'de',
        },
        {
          label: <Button type="link" onClick={e => { e.preventDefault(); setLanguage(Languages.en) }}>{en}</Button>,
          key: 'en',
        }
      ]}
    />
  );

  const [language, setLanguage] = useState(Languages.de);

  useEffect(() => { i18n.changeLanguage(language) }, [language, i18n]);

  return (<>
    <header>
      <div className='content'>
        <h1>Secure Exchange Portal</h1>
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <Button className="language" type="link" onClick={e => e.preventDefault()}>
            {languageElements[language]}
          </Button>
        </Dropdown>
      </div>
    </header>
    <div className='App'>
      <main>
        <Outlet />
      </main>
    </div>
    <footer>
      <div className='content'>
        SecEx&nbsp;<Version />
      </div>
    </footer>
  </>);
}
