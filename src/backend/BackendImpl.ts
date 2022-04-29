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

import * as openpgp from 'openpgp';

import { Backend, UploadTest, getFilenameFromContentDispositionHeader, RcFile, TestResult, SignatureVerification, ValidSignature, DecryptedFile, UnknownSignature } from "@secex/backend";

export class BackendImpl implements Backend {
    private _backendUrl: string;
    private _serverKeys: Promise<openpgp.Key[]>;

    constructor(backendUrl: string) {
        this._backendUrl = backendUrl;

        this._serverKeys = this.getVerificationKeys();
    }
    getUploadUrl(uploadId: string): string {
        return `${this._backendUrl}upload/${uploadId}`;
    }

    async testUpload(uploadId: string): Promise<boolean> {
        try {
            const response = await fetch(this.getUploadUrl(uploadId), { method: 'HEAD' });
            return response.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async encryptUpload(file: RcFile, password: string): Promise<false | File> {
        try {
            const serverKeys = await this._serverKeys;
            const message = await openpgp.createMessage({ binary: file.stream(), filename: file.name, date: file.lastModifiedDate });
            const encryptedMessage = await openpgp.encrypt({
                message: message,
                passwords: password,
                encryptionKeys: serverKeys,
                format: 'binary'
            }) as ReadableStream<Uint8Array>;

            const encryptedAsBlob = await new Response(encryptedMessage).blob();

            return new File([encryptedAsBlob], file.name + '.gpg', { type: file.type, lastModified: file.lastModified });
        }
        catch (e: any) {
            console.error(e);
            return false;
        }
    }

    async getVerificationKeys(): Promise<openpgp.Key[]> {
        const response = await fetch(`${this._backendUrl}keys`, { method: 'GET' });

        const amoredKeys = await response.json() as string[];
        if (amoredKeys.length === 0) {
            return [];
        }

        return await Promise.all(amoredKeys.map(armoredKey => openpgp.readKey({ armoredKey: armoredKey })));
    }

    async testDownload(downloadId: string): Promise<TestResult> {
        try {
            const response = await fetch(`${this._backendUrl}d/${downloadId}`, { method: 'HEAD' });
            if (response.ok === true) {
                return TestResult.Valid;
            }

            if (response.status === 403) {
                return TestResult.DisabledServerSide;
            }
        } catch (e) {
            console.error(e);
        }
        return TestResult.Invalid;
    }

    async listFiles(downloadId: string): Promise<string[] | undefined> {
        try {
            const response = await fetch(`${this._backendUrl}d/${downloadId}`, {
                method: 'OPTIONS',
                headers: {
                    'Accept': 'application/pgp-encrypted'
                }
            });
            const content = await response.json();
            return content as string[];
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }

    async testFile(downloadId: string, fileName: string): Promise<boolean> {
        try {
            const response = await fetch(`${this._backendUrl}d/${downloadId}/${fileName}.gpg`, { method: 'HEAD' });
            return response.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async downloadFile(downloadId: string, fileName: string, password: string): Promise<DecryptedFile> {
        const response = await fetch(`${this._backendUrl}d/${downloadId}/${fileName}.gpg`, {
            method: 'GET',
            headers: {
                'Accept': 'application/pgp-encrypted',
                'Access-Control-Request-Headers': 'Content-Disposition'
            }
        });
        const decryptedMessage = await this.decryptFile(response, fileName, password);
        return decryptedMessage;
    }

    downloadFiles(downloadId: string, fileNames: string[], password: string): Promise<DecryptedFile[]> {
        return Promise.all(fileNames.map(fileName => this.downloadFile(downloadId, fileName, password)));
    }

    private async decryptFile(response: Response, fileName: string, password: string) {
        const serverKeys = await this._serverKeys;
        const encryptedBlob = await response.blob();
        const encryptedStream = encryptedBlob.stream();
        const encryptedMessage = await openpgp.readMessage({ binaryMessage: encryptedStream });
        const decryptedMessage = await openpgp.decrypt({
            message: encryptedMessage,
            passwords: password,
            format: 'binary',
            expectSigned: false,
            verificationKeys: serverKeys
        });
        const headerFileName = getFilenameFromContentDispositionHeader(response.headers.get("Content-Disposition"));
        const downloadAs = headerFileName !== null
            ? (headerFileName!.endsWith(".gpg") ? headerFileName!.substring(0, headerFileName!.length - 4) : headerFileName!)
            : fileName!;
        decryptedMessage.filename = downloadAs;

        const signatures = await Promise.all(decryptedMessage.signatures.map(async signature => {
            try {
                await signature.verified;
                return { state: 'Valid', signingKey: serverKeys.find(key => key.getKeyID().equals(signature.keyID))! } as ValidSignature;
            } catch (e) {
                const error = (e as Error);
                if (error.message.indexOf("Could not find signing key with key ID") >= 0) {
                    return { state: 'Unknown', signingKey: signature.keyID } as UnknownSignature;
                }

                return { ...error, state: 'Error' } as SignatureVerification;
            }
        }));

        return { message: decryptedMessage, signatures: signatures } as DecryptedFile;
    }
}