/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 Anton Kosiakov (https://twitter.com/akosyakov). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import {
    BaseLanguageClient, CloseAction, ErrorAction,
    createMonacoServices, createConnection
} from 'monaco-languageclient';
const ReconnectingWebSocket = require('reconnecting-websocket');

// create Monaco editor
const value = `.main-wrapper {
  flex-direction: row;
  display: flex;
  flex: 1;
}
    
#content {
  flex: 1;
}
    
ul {
  padding: 20px 0;
  flex: 1;
}
    
li {
  font-family:'Lato';
  color: whitesmoke;
  line-height: 44px;
}
`;
const left = monaco.editor.create(document.getElementById("left")!, {
    model: monaco.editor.createModel(value, 'css', monaco.Uri.parse('inmemory://model.css'))
});
const right = monaco.editor.create(document.getElementById("right")!, {
    model: monaco.editor.createModel('', 'javascript', monaco.Uri.parse('inmemory://model.js'))
});

window.addEventListener('resize', () => {
    left.layout();
    right.layout();
})

// create the web socket
const url = createUrl('/sampleServer')
const webSocket = createWebSocket(url);
// listen when the web socket is opened
listen({
    webSocket,
    onConnection: connection => {
        // create and start the language client
        const languageClient = createLanguageClient(connection);
        const disposable = languageClient.start();
        connection.onClose(() => disposable.dispose());
    }
});

const services = createMonacoServices(left);
function createLanguageClient(connection: MessageConnection): BaseLanguageClient {
    return new BaseLanguageClient({
        name: "Transform Language Client",
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ['css', 'javascript'],
            // disable the default error handler
            errorHandler: {
                error: () => ErrorAction.Continue,
                closed: () => CloseAction.DoNotRestart
            }
        },
        services,
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: (errorHandler, closeHandler) => {
                return Promise.resolve(createConnection(connection, errorHandler, closeHandler))
            }
        }
    })
}

function createUrl(path: string): string {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${location.host}${path}`;
}

function createWebSocket(url: string): WebSocket {
    const socketOptions = {
        maxReconnectionDelay: 10000,
        minReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1.3,
        connectionTimeout: 10000,
        maxRetries: Infinity,
        debug: false
    };
    return new ReconnectingWebSocket(url, undefined, socketOptions);
}
