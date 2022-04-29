# SecEx - Secure File Exchange

_Note: If you look for a reference implementation of the server for this project, head over to [phidevz/secex-server](https://github.com/phidevz/secex-server)._

## Exchange encrypted files with anyone without - all they need is a browser.

One time or another you might want to exchange files with a third party, but they cannot install any software on their computer, e.g. on their work computer. If this data is **very sensitive**, you probably won't trust any of the major cloud providers and just upload the data there. You want to serve the data encrypted and maybe even proof to the third party that actually **you** are sending them this file.

Using the **GNU Privacy Guard (GPG)** technology, you can serve password-encrypted and signed version of your sensitive files to anyone. The files are decrypted and verified only in the recipient's browser, so they are truely **end-to-end encrypted** and cannot be read by anyone else.

## Screenshots
![Downloading a file](doc/screenshot-download-file-en.png?raw=true "Downloading a file")

Downloading a file

![Uploading a file](doc/screenshot-upload-file-en.png?raw=true "Uploading a file")

Uploading a file

## How to run the application

To run the application, you must build it first, then configure it and then serve the files statically.

### How to build the application for production

You need Node.js at least in version 16 and a corresponding package manager, like `npm` or `yarn`.

1. Download the source code from the [Releases page](https://github.com/phidevz/secex/releases) on Github. Usually you go with the latest release.
2. Unzip the source code to any location on your computer where you have write permissions.
3. Open a terminal and navigate to that location.
4. Run `npm run build`. If you plan to deploy the application under a sub-path in your domain, then please use `npm run build -- --base=/my/subpath`, given that you want to serve your frontend on e.g. `https://secure-exchange.example.com/my/subpath`.
5. You will find the output in the folder `dist` in the directory where you unpacked the source code.

For more information on how to build, have a look at the [Vite.js documentation](https://vitejs.dev/guide/build.html).

### Configure the application

You only need to configure one thing: the URL of the server for this application.

Therefore, edit the `index.html` file from the `dist` folder. You will find the following configuration value which is configured for development environments:

```html
<meta name="backend" content="http://localhost:5266" id="backendUrl" />
```

Change the `content` part of that snipped to your backend server, e.g.:

```html
<meta name="backend" content="https://secure-exchange.example.com" id="backendUrl" />
```

### Serving the application

Because all you need to do is serve the files from the `dist` folder statically, you can use a lot of free services for this purpose, or host it yourself.

Some services typically used for static file serving are:

- Azure Blob Storage
- Amazon AWS S3
- Github Pages (free)
- Vercel (free)
- Cloudflare Pages (free)
- Any web hoster

If you are interested in some examples on how to deploy the app with some publicly available services, have a look at the [Vite.js documentation](https://vitejs.dev/guide/static-deploy.html#github-pages).

You can of course also use existing web hosting packages that you have booked. For this you probably want to pay attention to step 4 of building the application and specify a subpath.

**Important: You still need to deploy the backend portion (e.g. the [refence implementation](https://github.com/phidevz/secex-server)) of this application, which this repository and the above steps has nothing to do with.**

## How you can send files securely

1. Encrypt the file(s) you want to send with a password - and optionally also sign them with one of your PGP keys - using a GnuPG client of your choice. This can really be anything from calling a script using the OpenPGP.js library, using the `gpg` commandline tool or one of the official GUIs for GPG (like GPG4WIN and GPG4KDE).
2. Make your SecEx Backend serve the file using an arbitrary URL in the format `/d/:downloadId/:fileName`. Usually, the `:downloadId` parameter is a folder name in which the physical file `:fileName.gpg` resides. For more information, see the backend's reference implementation.
3. Send the URL for downloading to the intended recipient(s) using the same `:downloadId` and `:fileName` as above, e.g.: `https://secex-frontend-url.example.com/download/:downloadId/:fileName`.
4. The recipient has to follow the steps explained on screen (should be very straight forward).

## Backend protocol

You can find an [Open API Specification v3](https://swagger.io/docs/specification/about/) of the frontend-backend protocol [here](doc/protocol.yaml).

You can use [Swagger UI](https://swagger.io/tools/swagger-ui/) or the [Swagger Editor](https://editor.swagger.io) to visualize the specification.

## How it works

This app is built using:
- [Vite.js](https://vitejs.dev) as a toolset for development, bundling and building
- [React](https://reactjs.org) as UI framework
- [Ant Design](https://ant.design) as a design system for React, with a lot of prebuilt components and functionality
- [react-i18next](https://react.i18next.com) for translations
- [OpenPGP.js](https://openpgpjs.org) to handle cryptographic operations on the client side

All cryptographic operations are performed on the client side, so the unencrypted data is never sent over the network. Decrypted files are stored in the browsers memory only for a very limited time after your downloaded them.

## Like this project?

Glad you like it! I would greatly appreciate a star on Github, and feel free to share it with your friends and colleagues.

## How to contribute

Found a bug? Want to contirbute new feature? You want to help, great!

Please open an issue and describe either

- the problem(s) you experience
- the features you want to request (no guarantee that it will be implemented)
- the features you want to implement

For smaller changes to the code, feel free to fork the code, make your change and contribute them back by opening a pull request.

## Found a security issue?

If you think you found a security issue, please send me a DM on [Twitter](https://twitter.com/phidevz) and I will get in touch with you.

## License

This project is licensed under the [GPL-3.0](LICENSE).
