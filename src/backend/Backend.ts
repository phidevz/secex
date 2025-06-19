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

import type * as openpgp from "openpgp";
import { type DecryptedFile, type RcFile, type TestResult } from "~/backend";
import type { EncryptedFile } from "~/backend/DecryptedFile";

export interface Backend {
  getUploadUrl(uploadId: string): string;

  testUpload(uploadId: string): Promise<boolean>;

  encryptUpload(
    file: RcFile,
    password: string,
    serverKeys: openpgp.Key[],
  ): Promise<File | false>;

  testDownload(downloadId: string): Promise<TestResult>;

  listFiles(downloadId: string): Promise<string[] | undefined>;

  testFile(downloadId: string, fileName: string): Promise<boolean>;

  downloadFile(downloadId: string, fileName: string): Promise<EncryptedFile>;

  decryptFile(
    encryptedFile: EncryptedFile,
    password: string,
    verificationKeys: string[],
  ): Promise<DecryptedFile>;

  downloadHeader(
    downloadId: string,
    fileName: string,
  ): Promise<{ fileName: string; size: number | undefined }>;

  downloadRaw(downloadId: string, fileName: string, op: "HEAD" |"GET"): Promise<Response>;
}
