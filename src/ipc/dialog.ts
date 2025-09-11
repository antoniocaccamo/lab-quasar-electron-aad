export default interface DialogIPC {
  ipcDialog: {
    openImageFile: () => Promise<string>;
    openVideoFile: () => Promise<string>;
    openFolder: () => Promise<string>;
  }
}
