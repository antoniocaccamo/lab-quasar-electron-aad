export default interface WindowIPC {
  ipcWindow: {
    minimize: () => void;
    toggleMaximize: () => void;
    close: () => void;
  };
}
