/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 Anton Kosiakov (https://twitter.com/akosyakov). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as server from 'transform-languageserver/lib/server';
import * as rpc from "vscode-ws-jsonrpc";

export function listen(socket: rpc.IWebSocket) {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    server.listen(reader, writer)
}
export default listen;
