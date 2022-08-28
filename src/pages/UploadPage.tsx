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

import { Upload, message, Steps, Input, Button, Checkbox } from 'antd';
import { InboxOutlined, InfoCircleFilled, SecurityScanOutlined } from '@ant-design/icons';
import { UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackendContext, UploadTest } from '@secex/backend';
import { UserIds } from '@secex/components';

const { Dragger } = Upload;
const { Step } = Steps;

export default function UploadPage() {
    const { t } = useTranslation();
    const params = useParams();
    const uploadId = params.id;

    const backend = useContext(BackendContext);

    const [step, setStep] = useState(0);
    const [isValid, setIsValid] = useState<UploadTest>({ isValid: false });
    const [uploadAction, setUploadAction] = useState<string>();
    const [publicKeyChecked, setPublicKeyChecked] = useState<boolean>(false);
    const [passwordChecked, setPasswordChecked] = useState<boolean>(false);
    const [password, setPassword] = useState<string>();
    const [workPassword, setWorkPassword] = useState<string>();

    useEffect(() => {
        if (uploadId === undefined) {
            setIsValid({ isValid: false });
            return;
        }

        setUploadAction(backend.getUploadUrl(uploadId));
        backend.testUpload(uploadId).then(setIsValid);
    }, [uploadId, backend]);

    useEffect(() => {
        setPublicKeyChecked(isValid.isValid === true && isValid.serverKeys.length > 0);
    }, [isValid]);

    useEffect(() => {
        if (publicKeyChecked === false && passwordChecked === false) {
            setStep(0);
            return;
        }
        if (publicKeyChecked === true) {
            setStep(1);
            return;
        }
        if (passwordChecked === true && password !== undefined) {
            setStep(1);
            return;
        }

        setStep(0);
    }, [publicKeyChecked, passwordChecked, password]);

    if (isValid.isValid === false) {
        return (<div>invalid</div>);
    }

    return (<>
        <h2>{t("Upload")}</h2>
        <Steps direction="vertical" current={step}>
            <Step className='upload-encryption-options' title={t("UploadEncryptionHeader")} description={<>
                <Checkbox disabled={isValid.serverKeys.length === 0} defaultChecked={isValid.serverKeys.length > 0} onChange={e => setPublicKeyChecked(e.target.checked)}>
                    <div>{t('UploadEncryptWithPublicKey')}</div>
                    {isValid.serverKeys.length > 0 ? (<>
                        <div className='ant-alert ant-alert-info' style={{ marginBottom: '1em' }}>
                            <InfoCircleFilled className='ant-alert-icon' style={{ alignSelf: 'flex-start', marginTop: '0.3em' }} />
                            <span>{t("UploadPublicKeyDescription")}</span>
                        </div>
                    </>) : (
                        <div className='ant-alert ant-alert-warning' style={{ marginBottom: '1em' }}>
                            <InfoCircleFilled className='ant-alert-icon' style={{ alignSelf: 'flex-start', marginTop: '0.3em' }} />
                            <span>{t("UploadPublicKeyNotAvialable")}</span>
                        </div>
                    )}
                </Checkbox>
                {isValid.serverKeys.length > 0 && publicKeyChecked && (
                    <div className='not-label'>
                        <div>{t('UploadPublicKeyIdentities')}</div>
                        <ul>
                            {isValid.serverKeys.map((serverKey, index) => <li key={index} className="server-key">
                                <div><UserIds userIds={serverKey.getUserIDs()} /></div>
                                <div><SecurityScanOutlined /><span> Fingerprint: <code>{serverKey.getFingerprint().toUpperCase().match(/.{1,4}/g)!.join(" ")}</code></span></div>
                            </li>)}
                        </ul>
                    </div>
                )}
                <Checkbox disabled={isValid.serverKeys.length === 0} defaultChecked={isValid.serverKeys.length === 0} onChange={e => setPasswordChecked(e.target.checked)}>
                    <div>{t('UploadEncryptWithPassword')}</div>
                    <div className='ant-alert ant-alert-info' style={{ marginBottom: '1em' }}>
                        <InfoCircleFilled className='ant-alert-icon' style={{ alignSelf: 'flex-start', marginTop: '0.3em' }} />
                        <span>{t("UploadPasswordDescription")}</span>
                    </div>
                    {passwordChecked && <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Input.Password placeholder={t("UploadPasswordPlaceholder")}
                            onChange={(e) => setWorkPassword(e.target.value)}
                            disabled={password !== undefined} />
                        <Button style={{ marginLeft: '1em' }} type='primary'
                            disabled={password !== undefined || workPassword === undefined || workPassword.length === 0}
                            onClick={(e) => { e.preventDefault(); setPassword(workPassword); }} >{t("Apply")}</Button>
                    </div>}
                </Checkbox>
            </>} />
            <Step title={t("UploadStepHeader")} description={<>
                <Dragger style={{ visibility: step === 1 ? "visible" : "collapse" }}
                    name='files'
                    multiple={true}
                    action={uploadAction}
                    method='POST'
                    beforeUpload={file => backend.encryptUpload(file, { encryptWithPublicKey: publicKeyChecked, password: password! })}
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