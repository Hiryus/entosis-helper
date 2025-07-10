const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('actions', {
    close: () => ipcRenderer.invoke('close'),
    devTools: () => ipcRenderer.invoke('dev_tools'),
    minimize: () => ipcRenderer.invoke('minimize'),
    selectChat: () => ipcRenderer.invoke('select_chat'),
});

contextBridge.exposeInMainWorld('events', {
    onError: (callback) => ipcRenderer.on('error', (event, value) => callback(value)),
    onUpdateNode: (callback) => ipcRenderer.on('update_node', (event, value) => callback(value)),
});

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
});
