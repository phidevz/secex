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

import { Upload, message, Steps, Input, Button } from 'antd';
import { InboxOutlined, InfoCircleFilled } from '@ant-design/icons';
import { UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackendContext, UploadTest } from '@secex/backend';

const { Dragger } = Upload;
const { Step } = Steps;

export default function UploadPage() {
    const { t } = useTranslation();
    const params = useParams();
    const uploadId = params.id;

    const backend = useContext(BackendContext);

    const [isValid, setIsValid] = useState(false);
    const [uploadAction, setUploadAction] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [workPassword, setWorkPassword] = useState<string>();
    useEffect(() => {
        if (uploadId === undefined) {
            setIsValid(false);
            return;
        }

        setUploadAction(backend.getUploadUrl(uploadId));
        backend.testUpload(uploadId).then(setIsValid);
    }, [uploadId, backend]);

    if (isValid === false) {
        return (<div>invalid</div>);
    }

    return (<>
        <h2>{t("Upload")}</h2>
        <Steps direction="vertical" current={password === undefined ? 0 : 1}>
            <Step title={t("UploadSetPasswordHeader")} description={<>
                <p className='ant-alert ant-alert-info' style={{ marginBottom: '1em' }}>
                    <InfoCircleFilled className='ant-alert-icon' style={{ alignSelf: 'flex-start', marginTop: '0.3em' }} />
                    <span>{t("UploadPasswordDescription")}</span>
                </p>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Input.Password placeholder={t("UploadPasswordPlaceholder")}
                        onChange={(e) => setWorkPassword(e.target.value)}
                        disabled={password !== undefined} />
                    <Button style={{ marginLeft: '1em' }} type='primary'
                        disabled={password !== undefined || workPassword === undefined || workPassword.length === 0}
                        onClick={(e) => { e.preventDefault(); setPassword(workPassword); }} >{t("Apply")}</Button>
                </div>
            </>} />
            <Step title={t("UploadStepHeader")} description={password && <>
                <Dragger style={{ visibility: password === undefined ? "collapse" : "visible" }}
                    name='files'
                    multiple={true}
                    action={uploadAction}
                    method='POST'
                    beforeUpload={file => backend.encryptUpload(file, password)}
                    onChange={(info: UploadChangeParam<UploadFile<any>>) => {
                        const { status, name } = info.file;
                        if (status === 'done') {
                            message.success(`${name} file uploaded successfully.`);
                        } else if (status === 'error') {
                            message.error(`${name} file upload failed.`);
                        }
                    }}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">{t("UploadText")}</p>
                    <p className="ant-upload-hint">{t("UploadHint")}</p>
                </Dragger></>} />
        </Steps>
    </>);
}