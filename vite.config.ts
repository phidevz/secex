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

import type { PluginOption } from 'vite';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { execSync } from 'child_process';

const spaFallbackAppSpecific = (): PluginOption => ({
  name: 'spaFallbackAppSpecific',
  configureServer: (server) => () => {
    // Add a middleware to serve the SPA when any /download... or /upload... route is requested
    // because the default vite.js dev server treats this as a static servable file
    server.middlewares.use(function spaFallbackForUploadAndDownloadMiddleware(req, _, next) {
      if (req.url && (req.url.startsWith("/download") || req.url.startsWith("/upload"))) {
        req.url = "/index.html";
      }
      next();
    })

    // Also disable the vite.js static serve middleware because we only have content served from the /public directory
    server.middlewares.stack = server.middlewares.stack.filter(middleware => typeof middleware.handle !== 'function'
      || middleware.handle.name != "viteServeStaticMiddleware");

    return server;
  }
});

const gitInfo = (): PluginOption => ({
  name: 'gitInfo',
  config: (config, env) => {
    let getGitHash: () => string | undefined = () => undefined;
    let getGitDescribe: () => string | undefined = () => undefined;
    let getGitIsDirty: () => boolean | undefined = () => undefined;

    try {
      execSync("git --version").length > 0

      getGitHash = () => execSync("gite log -1 --format='%H'").toString().trim();
      getGitDescribe = () => execSync("git describe --all").toString().trim();
      getGitIsDirty = () => execSync("git status --porcelain").length > 0;
    } catch {
      console.error("Git not found");
    }

    if (!config.define) {
      config.define = {};
    }

    const ignoreGitDirty = process.env.GIT_IGNORE_DIRTY && process.env.GIT_IGNORE_DIRTY.trim().toLocaleLowerCase() === "1";
    const gitSha: string | undefined = process.env.GITHUB_SHA || getGitHash();
    const gitDescribe = getGitDescribe().split("/", 2);
    const gitRefType = process.env.GITHUB_REF_TYPE || (gitDescribe[0] === "heads" ? "branch" : gitDescribe[0] === "tags" ? "tag" : undefined);
    const gitRef = process.env.GITHUB_REF_NAME || gitDescribe[1];

    config.define.IS_DEV_SERVER = env.command !== "build" && env.mode === "development";
    config.define.GIT_SHA = JSON.stringify(gitSha);
    config.define.GIT_REF_TYPE = JSON.stringify(gitRefType);
    config.define.GIT_REF = JSON.stringify(gitRef);
    config.define.GIT_IS_DIRTY = JSON.stringify(ignoreGitDirty === false && getGitIsDirty());
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), spaFallbackAppSpecific(), gitInfo()],
  server: { cors: true }
})
