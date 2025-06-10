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
"use client";

import { Button, Input, Steps, Tooltip } from "antd";
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  QuestionCircleFilled,
} from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "~/app/i18n/client";
import {
  type DecryptedFile,
  type SignatureVerification,
} from "~/backend";
import { BackendContext } from "~/backend/backendContext";

const { Step } = Steps;

function SignatureTotal(props: {
  signatures: SignatureVerification[] | undefined;
}) {
  const { signatures } = props;
  if (signatures === undefined || signatures.length === 0) {
    return (
      <p>
        <span>
          <ExclamationCircleFilled className="signature-icon not-signed" />
          Not signed
        </span>
      </p>
    );
  }

  return (
    <p>
      {signatures.map((signature, index) => (
        <div key={index}>
          <span>Signature {index + 1}:</span>
          <SignatureBlock key={index} signature={signature} />
        </div>
      ))}
    </p>
  );
}

function SignatureBlock(props: { signature: SignatureVerification }) {
  const v = props.signature;
  if (v.state === "Valid") {
    const userIds = v.signingKey.getUserIDs();
    return (
      <>
        <span>
          <CheckCircleFilled className="signature-icon signed-valid" />
          valid, signed by '{userIds[0]}'
          {userIds.length > 1 && (
            <span> (and {userIds.length - 1} other name(s))</span>
          )}
        </span>
      </>
    );
  } else if (v.state === "Unknown") {
    const keyId = v.signingKey.toHex();
    return (
      <>
        <span>
          <QuestionCircleFilled className="signature-icon signed-unknown" />
          Cannot verify signature (key ID: {keyId})
        </span>
      </>
    );
  }

  return (
    <>
      <span>todo</span>
    </>
  );
}

export default function DownloadFilePage(props: {
  isValid: boolean;
  folder: string;
  file: string;
}) {
  const { t } = useTranslation();
  const { isValid, folder: downloadId, file: fileName } = props;

  const backend = useContext(BackendContext);

  const [file, setFile] = useState<DecryptedFile>();
  const [password, setPassword] = useState<string>();
  const [step, setStep] = useState(0);
  const [isPasswordWrong, setIsPasswordWrong] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);


  useEffect(() => {
    if (password === undefined) {
      setStep(0);
    }
    if (isPasswordWrong) {
      setStep(0);
      return;
    }
    if (step >= 1) {
      return;
    }
    if (password !== undefined) {
      setStep(1);
    }
  }, [password, isPasswordWrong, step]);

  if (!isValid) {
    return <div className="fail-fast-message">{t("LinkInvalid")}</div>;
  }

  const execute = async (password: string) => {
    setIsExecuting(true);
    try {
      const decryptedMessage = await backend.downloadFile(
        downloadId,
        fileName,
        password,
      );
      setFile(decryptedMessage);

      setStep(2);
    } catch (e) {
      const error = e as Error;
      if (error) {
        if (error.message.includes("Modification detected")) {
          setStep(0);
          setIsPasswordWrong(true);
        }
      }
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  const save = async (e: any) => {
    if (file === undefined) {
      return;
    }

    try {
      const data = file.message.data as ReadableStream;
      const resp = new Response(data);
      const downloadAs = file.message.filename;
      const downloadFile = new File([await resp.blob()], downloadAs);
      const url = URL.createObjectURL(downloadFile);

      const anchor = document.createElement("a");
      anchor.hidden = true;
      anchor.setAttribute("rel", "noopener");
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("href", url);
      anchor.setAttribute("download", downloadAs);
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);

      setStep(3);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <h2>
        {t("DownloadSingle")}: <code>{fileName}</code>
      </h2>
      <Steps direction="vertical" current={step}>
        <Step
          title={t("DownloadEnterPasswordHeader")}
          description={
            <>
              <p>{t("DownloadEnterPasswordDescriptionSingle")}</p>
              <Tooltip
                visible={isPasswordWrong}
                title={t("PasswordWrong")}
                placement="top"
              >
                <Input.Password
                  placeholder={t("DownloadEnterPasswordHeader")}
                  status={isPasswordWrong ? "error" : ""}
                  disabled={step > 1}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setPassword(
                      newPassword.trim().length === 0 ? undefined : newPassword,
                    );
                    setIsPasswordWrong(false);
                  }}
                />
              </Tooltip>
            </>
          }
        />
        <Step
          title={t("DownloadExecuteHeader")}
          description={
            <>
              <p>{t("DownloadExecuteDescriptionSingle")}</p>
              <Button
                type="primary"
                loading={isExecuting}
                disabled={step !== 1}
                onClick={async (e) => {
                 await execute(password!);
                }}
              >
                {t("ExecuteDownloadSingle")}
              </Button>
            </>
          }
        />
        <Step
          title={t("DownloadSaveHeader")}
          description={
            file && (
              <>
                <p>{t("DownloadSaveDescription")}</p>
                <p>Filename: {file.message.filename}</p>
                <SignatureTotal signatures={file.signatures} />
                <Button
                  type="primary"
                  loading={isExecuting}
                  disabled={step !== 2}
                  onClick={save}
                >
                  {t("Save")}
                </Button>
              </>
            )
          }
        />
      </Steps>
    </>
  );
}
