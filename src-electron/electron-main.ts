import { app, BrowserWindow, Menu, protocol } from 'electron';
import log from 'electron-log/main.js';
import { initialize, enable } from '@electron/remote/main/index.js'
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url'
import DialogHandler from './handlers/DialogHandler';
import applicationMenu from './ApplicationMenu';
import AuthenticationHandler from './handlers/AuthenticationHandler';
import AuthProviderFactory from './auth/AuthProviderFactory';

initialize()

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true,
    },
  },
]);

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

const currentDir = fileURLToPath(new URL('.', import.meta.url));

// let mainWindow: BrowserWindow | undefined;

// async function createWindow() {
//   /**
//    * Initial window options
//    */
//   mainWindow = new BrowserWindow({
//     icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
//     width: 1000,
//     height: 600,
//     useContentSize: true,
//     frame: false,
//     webPreferences: {
//       sandbox: false,
//       contextIsolation: true,
//       // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
//       preload: path.resolve(
//         currentDir,
//         path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
//       ),
//     },
//   });

//   enable(mainWindow.webContents)

//   if (process.env.DEV) {
//     await mainWindow.loadURL(process.env.APP_URL);
//   } else {
//     await mainWindow.loadFile('index.html');
//   }

//   if (process.env.DEBUGGING) {
//     // if on DEV or Production with debug enabled
//     mainWindow.webContents.openDevTools();
//   } else {
//     // we're on production; no access to devtools pls
//     mainWindow.webContents.on('devtools-opened', () => {
//       mainWindow?.webContents.closeDevTools();
//     });
//   }

//   mainWindow.on('closed', () => {
//     mainWindow = undefined;
//   });
// }

// DialogHandler.registerDialog();

// Menu.setApplicationMenu(applicationMenu);

// void app.whenReady()
//   .then(() => {
//     // Registering the protocol to handle local file URLs
//     protocol.handle('local', (request) => {
//       log.info('Handling local protocol request:', request.url);
//       const pathToMedia = request.url.replace(/^local:\/\//, '/');
//       return net.fetch(`file://${pathToMedia}`);
//     });
//   })
//   .then(createWindow)
//   .catch((error) => {
//     console.error('Failed to create window:', error);
//   });

// app.on('window-all-closed', () => {
//   if (platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', () => {
//   if (mainWindow === undefined) {
//     void createWindow();
//   }
// });

export class ElectronMain {

  application: Electron.App;
  mainWindow: Electron.BrowserWindow | null = null;
  authHandler: AuthenticationHandler = new AuthenticationHandler(AuthProviderFactory.createProvider());
  dialogHandler: DialogHandler = new DialogHandler();

  constructor(electronApp: Electron.App) {
    this.application = electronApp;

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    this.authHandler.registerAuthHandlers();
    this.dialogHandler.registerDialog();

    Menu.setApplicationMenu(applicationMenu);

    this.application.on('window-all-closed', () => {
      if (platform !== 'darwin') {
        this.application.quit();
      } else {
        // On macOS, it's common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
      }
    });

    this.application.whenReady()
      .then(async () => {
        await this.onReady();
      })
      .catch((error) => {
        console.error('Failed to create window:', error);
      });;
  }

  show(): void {

  }

  async onReady(): Promise<void> {
    log.info('App is ready');
    await this.createMainWindow();

  }

  async createMainWindow(): Promise<void> {

    this.mainWindow = new BrowserWindow({
      icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
      width: 1000,
      height: 600,
      useContentSize: true,
      frame: false,
      webPreferences: {
        sandbox: false,
        contextIsolation: true,
        // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
        preload: path.resolve(
          currentDir,
          path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
        ),
      },
    });

    enable(this.mainWindow.webContents)

    if (process.env.DEV) {
      await this.mainWindow.loadURL(process.env.APP_URL);
    } else {
      await this.mainWindow.loadFile('index.html');
    }

    if (process.env.DEBUGGING) {
      // if on DEV or Production with debug enabled
      this.mainWindow.webContents.openDevTools();
    } else {
      // we're on production; no access to devtools pls
      this.mainWindow.webContents.on('devtools-opened', () => {
        this.mainWindow?.webContents.closeDevTools();
      });
    }

    this.mainWindow.on('closed', () => {
      // No need to set mainWindow to undefined since it's a local variable
    });


  }


}


const theElectronMain = new ElectronMain(app);

theElectronMain.show();
