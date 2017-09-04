/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2017 Anton Kosiakov (https://twitter.com/akosyakov). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { IPCMessageReader, IPCMessageWriter } from 'vscode-languageserver';
import listen from './server';

listen(new IPCMessageReader(process), new IPCMessageWriter(process));
