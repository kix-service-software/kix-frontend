import { IWidget } from '@kix/core';

export class SearchTemplatesWidget implements IWidget {

    public id: string;

    public instanceId: string = Date.now().toString();

    public constructor(id: string) {
        this.id = id;
    }

}
