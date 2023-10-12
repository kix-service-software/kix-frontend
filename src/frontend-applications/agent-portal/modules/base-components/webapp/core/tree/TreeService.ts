/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeHandler } from './TreeHandler';

export class TreeService {

    private static INSTANCE: TreeService;

    public static getInstance(): TreeService {
        if (!TreeService.INSTANCE) {
            TreeService.INSTANCE = new TreeService();
        }
        return TreeService.INSTANCE;
    }

    private constructor() { }

    private handler: Map<string, TreeHandler> = new Map();

    public registerTreeHandler(id: string, handler: TreeHandler, skipIfhandlerExistsWithTree: boolean = false): void {
        if (skipIfhandlerExistsWithTree) {
            const existing = this.getTreeHandler(id);
            if (existing && existing.getTreeLength() > 0) return;
        }
        this.handler.set(id, handler);
    }

    public removeTreeHandler(id: string): void {
        if (this.handler.has(id)) {
            const treeHandler = this.handler.get(id);
            treeHandler.destroy();
            this.handler.delete(id);
        }
    }

    public getTreeHandler(id: string): TreeHandler {
        return this.handler.get(id);
    }

}
