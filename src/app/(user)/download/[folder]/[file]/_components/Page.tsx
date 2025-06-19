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

import { useContext, useEffect, useState } from "react";
import { useTranslation } from "~/app/i18n/client";
import { type DecryptedFile } from "~/backend";
import { BackendContext } from "~/backend/backendContext";
import { SignatureTotal } from "~/app/(user)/download/[folder]/[file]/_components/SignatureTotal";
import { useMutation,  useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import type { EncryptedFile } from "~/backend/DecryptedFile";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  AlertCircleIcon,
  InfoIcon,
  Eye,
  EyeOff,
  Key,
  Upload,
} from "lucide-react";


export default function Page(props: {
  folder: string;
  file: string;
  serverKeys: string[];
}) {
  const { t } = useTranslation();
  const { folder: downloadId, file: fileName, serverKeys } = props;

  const backend = useContext(BackendContext);

  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [privateKeyFile, setPrivateKeyFile] = useState<File | null>(null);
  const [keyPassword, setKeyPassword] = useState("");
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const { data: encryptedFile } = useSuspenseQuery({
    queryKey: ["downloadFile", downloadId, fileName],
    queryFn: async () => {
      return await backend.downloadFile(downloadId, fileName);
    },
  });

  const decrypt = useMutation<
    DecryptedFile,
    Error,
    {
      encryptedFile: EncryptedFile;
      password: string;
      verificationKeys: string[];
    }
  >({
    mutationKey: ["decryptFile", downloadId, fileName],
    mutationFn: async ({ encryptedFile, password, verificationKeys }) => {
      return await backend.decryptFile(
        encryptedFile,
        password,
        verificationKeys,
      );
    },
    throwOnError: false,
    retry: false,
  });

  const file = decrypt.data;
  const isPasswordWrong = decrypt.data === false;

  const save = async () => {
    if (file === undefined || file === false) {
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
    } catch (e) {
      console.error(e);
    }
  };

  const isSuccess = decrypt.isSuccess && decrypt.data !== false;

  return (
    <>
      <Alert variant="primary" className={cn({
        "hidden h-0": isSuccess,
      })}>
        <InfoIcon />
        <AlertTitle>{t("DownloadExecuteHeader")}</AlertTitle>
        <AlertDescription>{t("DownloadExecuteDescriptionSingle")}</AlertDescription>
      </Alert>
      <Tabs
        defaultValue="password"
        className={cn("w-full", {
          "hidden h-0": isSuccess,
        })}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="keyfile" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Private Key
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("DownloadEnterPasswordHeader")}
              </CardTitle>
              <CardDescription>
                {t("DownloadEnterPasswordDescriptionSingle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    aria-invalid={isPasswordWrong}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("DownloadEnterPasswordHeader")}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <Eye className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isPasswordWrong ? (
                  <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>{t("PasswordWrong")}</AlertTitle>
                  </Alert>
                ) : null}
              </div>
              <Button
                disabled={
                  password === undefined ||
                  password.trim().length === 0 ||
                  isDecrypting
                }
                onClick={async (e) => {
                  try {
                    await decrypt.mutateAsync({
                      encryptedFile,
                      password: password,
                      verificationKeys: serverKeys,
                    });
                  } catch (e) {
                    // ignored
                  }
                }}
              >
                {decrypt.isPending ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn("animate-spin")}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : null}
                {t("ExecuteDownloadSingle")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keyfile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Private Key</CardTitle>
              <CardDescription>
                Select your private key file to decrypt the file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyfile">Private Key File</Label>
                <Input
                  id="keyfile"
                  type="file"
                  accept=".asc,.gpg,.key,.pem"
                  onChange={undefined}
                  className="cursor-pointer"
                />
                {privateKeyFile && (
                  <p className="text-muted-foreground text-sm">
                    Selected: {privateKeyFile.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyPassword">
                  Private Key Password (if required)
                </Label>
                <div className="relative">
                  <Input
                    id="keyPassword"
                    type={showKeyPassword ? "text" : "password"}
                    value={keyPassword}
                    onChange={(e) => setKeyPassword(e.target.value)}
                    placeholder="Enter private key password (optional)"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowKeyPassword(!showKeyPassword)}
                  >
                    {showKeyPassword ? (
                      <EyeOff className="text-muted-foreground h-4 w-4" />
                    ) : (
                      <Eye className="text-muted-foreground h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={undefined}
                disabled={!privateKeyFile || isDecrypting}
                className="w-full"
              >
                {isDecrypting ? "Decrypting..." : "Decrypt & Download"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {file !== undefined && typeof file !== "boolean" ? (
        <>
          <Alert variant="primary">
            <InfoIcon />
            <AlertTitle>{t("DownloadSaveHeader")}</AlertTitle>
            <AlertDescription>{t("DownloadSaveDescription")}</AlertDescription>
          </Alert>
          <p>Filename: {file.message.filename}</p>
          <SignatureTotal signatures={file.signatures} />
          <Button disabled={!decrypt.isSuccess || isPasswordWrong} onClick={save}>
            {t("Save")}
          </Button>
        </>
      ) : null}
    </>
  );
}
