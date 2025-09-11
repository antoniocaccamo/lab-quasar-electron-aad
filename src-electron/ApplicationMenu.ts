// import type { MenuItemConstructorOptions  } from "electron";
import type { MenuItem, MenuItemConstructorOptions } from 'electron';
import { Menu } from 'electron';
//import { Menu } from 'electron';

const isMac = process.platform === 'darwin';
// const menu = new Menu();

// menu.append(
//   new MenuItem({
//     label: 'Lab Quasar Electron',
//     submenu: [
//       {
//         label: 'File',
//         submenu: [isMac ? { role: 'quit' } : { role: 'close' }],
//       },
//     ],
//   }),
// );

const template : (MenuItemConstructorOptions | MenuItem)[] = [
  {
    label: "File",
    submenu: [
      
      isMac ? { role: "quit" } : { role: "close" }]
  },
  // { role: 'editMenu' }
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" }
    ]
  },
  // { role: 'viewMenu' }
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { role: "toggleDevTools" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: "Window",
    submenu: [{ role: "minimize" }, { role: "zoom" }]
  },

];


export default Menu.buildFromTemplate(template)
