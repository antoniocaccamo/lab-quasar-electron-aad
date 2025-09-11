import { dialog, ipcMain } from "electron";
import log from 'electron-log/main.js';

import { DialogIPC } from '../Constants';

const proto = 'local://';

export default class DialogHandler {


  public registerDialog(): void {
    // Register the dialog handlers
    ipcMain.handle(DialogIPC.OpenImageFile, async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
        ],
      });
      if (!canceled) {

        const path = proto + filePaths[0];
        log.info('Selected image file path:', path);
        return path;
      }
      return null;
    });

    ipcMain.handle(DialogIPC.OpenVideoFile, async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Videos', extensions: ['mp4', 'avi', 'mkv'] },
        ]
      });
      if (!canceled) {
        const path = proto + filePaths[0];
        log.info('Selected video file path:', path);
        return path;
      }
      return null;
    });

    ipcMain.handle(DialogIPC.OpenFolder, async () => {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
      });
      if (!canceled) {
        return filePaths[0];
      }
      return null;
    });

  }

}

