/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 Anton Kosiakov (https://twitter.com/akosyakov). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
    Command, TextDocumentIdentifier, Range, Position, TextDocumentEdit, TextEdit, VersionedTextDocumentIdentifier
} from 'vscode-languageserver-types';
import {
    MessageReader, MessageWriter, createConnection, TextDocuments, TextDocument
} from 'vscode-languageserver';
const cssToJS: (css: string, supportReactNative?: boolean) => string = require("transform-css-to-js");

const startOfFile = Position.create(0, 0);

const transformCssToJs = Command.create('Transform CSS to JS', 'transform.css.to.js');
const transformCssToReactJs = Command.create('Transform CSS to React JS', 'transform.css.to.reactJs');
const commands = [
    transformCssToJs,
    transformCssToReactJs
];

export function listen(reader: MessageReader, writer: MessageWriter): void {
    const connection = createConnection(reader, writer);

    function transform(document: TextDocument, supportReactNative: boolean) {
        try {
            const jsDocument = documents.get(document.uri.replace('.css', '.js'));
            if (jsDocument) {
                const css = document.getText();
                const jsObject = cssToJS(css, supportReactNative);
                const js = 'const result = ' + (jsObject || '{}');
                const edit = TextEdit.replace(Range.create(startOfFile, jsDocument.positionAt(jsDocument.getText().length)), js);
                connection.workspace.applyEdit({
                    documentChanges: [
                        TextDocumentEdit.create(VersionedTextDocumentIdentifier.create(jsDocument.uri, jsDocument.version), [edit])
                    ]
                });
            }
        } catch (err) { /* no-op */ };
    }

    const documents = new TextDocuments();

    let supportReactNative: boolean | undefined;
    documents.onDidChangeContent(e => {
        if (supportReactNative !== undefined) {
            transform(e.document, supportReactNative);
        }
    });
    connection.onInitialize(param =>
        ({
            capabilities: {
                textDocumentSync: documents.syncKind,
                codeLensProvider: {
                    resolveProvider: true
                },
                executeCommandProvider: {
                    commands: commands.map(command => command.command)
                }
            }
        })
    );

    connection.onCodeLens(params => {
        const document = documents.get(params.textDocument.uri);
        if (!document || !document.uri.endsWith('.css')) return [];
        const offset = document.lineCount > 1 ? document.getText().indexOf('/n') : document.getText().length;
        const range = Range.create(startOfFile, document.positionAt(offset));
        return commands.map(command => ({
            range,
            command: Command.create(command.title, command.command, params.textDocument)
        }));
    });
    connection.onCodeLensResolve(codeLens => codeLens);
    connection.onExecuteCommand(params => {
        if (params.arguments) {
            const [identifier] = params.arguments;
            if (TextDocumentIdentifier.is(identifier)) {
                const document = documents.get(identifier.uri);
                if (document) {
                    supportReactNative = params.command === transformCssToReactJs.command;
                    transform(document, supportReactNative);
                }
            }
        }
    });
    documents.listen(connection);
    connection.listen();
}
export default listen;