/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class CollectionManager {

    private static INSTANCE: CollectionManager;

    public static getInstance(): CollectionManager {
        if (!CollectionManager.INSTANCE) {
            CollectionManager.INSTANCE = new CollectionManager();
        }
        return CollectionManager.INSTANCE;
    }

    private constructor() { }

    private collectionsCounts: Map<string, number> = new Map();
    private collectionsLimits: Map<string, number> = new Map();
    private collectionsController: Map<string, AbortController> = new Map();

    public handleResult(collectionId: string, objectsLength: number, limit: number, totalCount: number): void {
        if (collectionId) {
            CollectionManager.getInstance().collectionsCounts.set(collectionId, Number(totalCount));
            if (limit) {
                const count = objectsLength ? (objectsLength < limit ? objectsLength : limit) : 0;
                CollectionManager.getInstance().collectionsLimits.set(collectionId, count);
            }
        }
    }

    public getCollectionsCount(collectionId: string): number {
        return this.collectionsCounts.get(collectionId);
    }

    public getCollectionsLimit(collectionId: string): number {
        return this.collectionsLimits.get(collectionId);
    }

    public get(id: string): AbortController {
        return this.collectionsController.get(id);
    }

    public set(id: string, controller: AbortController): void {
        this.collectionsController.set(id, controller);
    }

    public delete(id: string): void {
        this.collectionsController.delete(id);
    }

}