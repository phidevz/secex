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

import * as openpgp from "openpgp";

import {
  type Backend,
  type DecryptedFile,
  getFilenameFromContentDispositionHeader,
  type RcFile,
  type SignatureVerification,
  TestResult,
  type UnknownSignature,
  type ValidSignature,
} from "~/backend";
import type { EncryptedFile } from "~/backend/DecryptedFile";
import type { DecryptMessageResult } from "openpgp";

export class BackendImpl implements Backend {
  private _backendUrl: string;

  constructor(backendUrl: string) {
    this._backendUrl = backendUrl;
  }

  getUploadUrl(uploadId: string): string {
    return `${this._backendUrl}upload/${uploadId}`;
  }

  async testUpload(uploadId: string): Promise<boolean> {
    try {
      const response = await fetch(this.getUploadUrl(uploadId), {
        method: "HEAD",
      });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async encryptUpload(
    file: RcFile,
    password: string,
    serverKeys: openpgp.Key[],
  ): Promise<false | File> {
    try {
      const message = await openpgp.createMessage({
        binary: file.stream(),
        filename: file.name,
        date: file.lastModifiedDate,
      });
      const encryptedMessage = (await openpgp.encrypt({
        message: message,
        passwords: password,
        encryptionKeys: serverKeys,
        format: "binary",
      })) as ReadableStream<Uint8Array>;

      const encryptedAsBlob = await new Response(encryptedMessage).blob();

      return new File([encryptedAsBlob], file.name + ".gpg", {
        type: file.type,
        lastModified: file.lastModified,
      });
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async getVerificationKeys(armoredKeys: string[]): Promise<openpgp.Key[]> {
    return await Promise.all(
      armoredKeys.map((armoredKey) =>
        openpgp.readKey({ armoredKey: armoredKey }),
      ),
    );
  }

  async getVerificationKeysRaw(): Promise<string[]> {
    const response = await fetch(`${this._backendUrl}keys`, { method: "GET" });

    return (await response.json()) as string[];
  }

  async testDownload(downloadId: string): Promise<TestResult> {
    try {
      const response = await fetch(`${this._backendUrl}d/${downloadId}`, {
        method: "HEAD",
      });
      if (response.ok) {
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
        method: "OPTIONS",
        headers: {
          Accept: "application/pgp-encrypted",
        },
      });
      return (await response.json()) as string[];
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  async testFile(downloadId: string, fileName: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this._backendUrl}d/${downloadId}/${fileName}.gpg`,
        { method: "HEAD" },
      );
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async downloadFile(
    downloadId: string,
    fileName: string,
  ): Promise<EncryptedFile> {
    const response = await this.downloadRaw(downloadId, fileName, "GET");

    const headerFileName = getFilenameFromContentDispositionHeader(
      response.headers.get("Content-Disposition"),
    );
    const downloadAs =
      headerFileName !== null
        ? headerFileName.endsWith(".gpg")
          ? headerFileName.substring(0, headerFileName.length - 4)
          : headerFileName
        : fileName;
    const encryptedBlob = await response.blob();

    return { encryptedBlob, fileName: downloadAs };
  }

  async downloadRaw(
    downloadId: string,
    fileName: string,
    op: "HEAD" | "GET",
    addExtension?: false
  ): Promise<Response> {
    const extension = addExtension !== false ? ".gpg" : "";
    return await fetch(`${this._backendUrl}d/${downloadId}/${fileName}${extension}`, {
      method: op,
      headers: {
        Accept: "application/pgp-encrypted",
        "Access-Control-Request-Headers": "Content-Disposition",
      },
    });
  }

  async downloadHeader(
    downloadId: string,
    fileName: string,
  ): Promise<{ fileName: string; size: number | undefined }> {
    const headers = (await this.downloadRaw(downloadId, fileName, "HEAD")).headers;

    const headerFileName = getFilenameFromContentDispositionHeader(
      headers.get("Content-Disposition"),
    );
    const downloadAs =
      headerFileName !== null
        ? headerFileName.endsWith(".gpg")
          ? headerFileName.substring(0, headerFileName.length - 4)
          : headerFileName
        : fileName;
    const contentLength = headers.get("Content-Length");

    return {
      fileName: downloadAs,
      size: contentLength !== null ? Number(contentLength) : undefined,
    };
  }

  async decryptFile(
    encryptedFile: EncryptedFile,
    password: string,
    verificationKeys: string[],
  ): Promise<DecryptedFile> {
    const { encryptedBlob, fileName } = encryptedFile;
    const serverKeys = await this.getVerificationKeys(verificationKeys);
    const encryptedMessage = await openpgp.readMessage({
      binaryMessage: encryptedBlob.stream(),
    });
    let decryptedMessage: DecryptMessageResult;
    try {
      decryptedMessage = await openpgp.decrypt({
        message: encryptedMessage,
        passwords: password,
        format: "binary",
        expectSigned: false,
        verificationKeys: serverKeys,
      });
    }
    catch (err){
      if(err instanceof Error && err.message.includes("Modification detected")){
        console.warn("Password wrong")
        return false;
      }

      throw err;
    }
    decryptedMessage.filename = fileName;

    const signatures = await Promise.all(
      decryptedMessage.signatures.map(async (signature) => {
        try {
          await signature.verified;
          return {
            state: "Valid",
            signingKey: serverKeys.find((key) =>
              key.getKeyID().equals(signature.keyID),
            )!,
          } as ValidSignature;
        } catch (e) {
          const error = e as Error;
          if (
            error.message.includes("Could not find signing key with key ID")
          ) {
            return {
              state: "Unknown",
              signingKey: signature.keyID,
            } as UnknownSignature;
          }

          return { ...error, state: "Error" } as SignatureVerification;
        }
      }),
    );

    return {
      message: decryptedMessage,
      signatures: signatures,
    } as DecryptedFile;
  }
}
