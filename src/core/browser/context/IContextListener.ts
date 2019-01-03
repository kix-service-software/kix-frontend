import { KIXObject, KIXObjectType } from "../../model";

export interface IContextListener {

    sidebarToggled(): void;

    explorerBarToggled(): void;

    objectChanged(
        objectId: string | number, object: KIXObject | any, type: KIXObjectType, changedProperties?: string[]
    ): void;

    objectListChanged(objectList: KIXObject[]): void;

    filteredObjectListChanged(objectList: KIXObject[]): void;

}
