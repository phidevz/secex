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

import { Button, Input, Steps, Transfer } from "antd";
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { TransferItem } from 'antd/lib/transfer';
import { BackendContext, TestResult } from "@secex/backend";

const { Step } = Steps;

export default function DownloadPage() {
    const { t } = useTranslation();
    const params = useParams();
    const downloadId = params.id;

    const backend = useContext(BackendContext);

    const [password, setPassword] = useState<string>();
    const [isValid, setIsValid] = useState(TestResult.Invalid);
    const [isLocked, setIsLocked] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [serverFiles, setServerFiles] = useState<string[]>();
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

    useEffect(() => {
        if (downloadId === undefined) {
            setIsValid(TestResult.Invalid);
            return;
        }

        backend.testDownload(downloadId).then(setIsValid);
    }, [backend, downloadId]);

    useEffect(() => {
        if (downloadId === undefined || isValid !== TestResult.Valid) {
            return;
        }

        backend.listFiles(downloadId).then(setServerFiles);
    }, [backend, downloadId, isValid]);

    if (isValid === TestResult.DisabledServerSide) {
        return (<div className="fail-fast-message">{t('BrowseFilesDisabled')}</div>);
    }

    if (isValid === TestResult.Invalid) {
        return (<div className="fail-fast-message">{t('LinkInvalid')}</div>);
    }

    return (<>
        <h2>{t("Download")}</h2>
        <Steps direction="vertical" current={selectedFiles.length === 0 ? 0 : (password === undefined ? 1 : 2)}>
            <Step title={t("DownloadSelectFilesHeader")} description={<>
                <Transfer
                    oneWay
                    targetKeys={selectedFiles}
                    onChange={(source, target) => setSelectedFiles(source.concat(target))}
                    titles={[t("DownloadServerFiles"), t("DownloadClientFiles")]}
                    dataSource={serverFiles?.map(serverFile => { return { key: serverFile, title: serverFile } as TransferItem })}
                    render={item => item.title!} />
            </>} />
            <Step title={t("DownloadEnterPasswordHeader")} description={<>
                <p>{t("DownloadEnterPasswordDescription")}</p>
                <Input placeholder={t("DownloadEnterPasswordHeader")}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={selectedFiles.length === 0 || isLocked} />
            </>} />
            <Step title={t("DownloadExecuteHeader")} description={<>
                <p>{t("DownloadExecuteDescription")}</p>
                <Button type='primary'
                    loading={isExecuting}
                    disabled={selectedFiles.length === 0 || password === undefined || isLocked}
                    onClick={(e) => { setIsLocked(true); setIsExecuting(true); }}>
                    {t("ExecuteDownload")}
                </Button>
            </>} />
        </Steps>
    </>)
}