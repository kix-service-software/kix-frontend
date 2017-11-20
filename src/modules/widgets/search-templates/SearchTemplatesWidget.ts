import { IWidget } from '@kix/core/dist/model';

export class SearchTemplatesWidget implements IWidget {

    public id: string;

    public instanceId: string = Date.now().toString();

    public show: boolean = true;

    public constructor(id: string) {
        this.id = id;
    }

}
