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

export type { Backend, EncryptOptions } from './Backend';
export type { UnknownSignature, ValidSignature, SignatureVerification } from './SignatureVerification';
export type { DecryptedFile } from './DecryptedFile';
export type { UploadTest } from './UploadTest';

export { TestResult } from './TestResult';
export { BackendImpl } from './BackendImpl';
export { getFilenameFromContentDispositionHeader } from "./contentdisposition";
export { BackendContext } from '../main'

export type { RcFile } from 'antd/lib/upload';