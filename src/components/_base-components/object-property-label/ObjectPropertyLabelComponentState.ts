import { Ticket } from '@kix/core/dist/model';
import { ILabelProvider } from '@kix/core/dist/browser';

export class ObjectPropertyLabelComponentState<T> {

    public constructor(
        public object: T = null,
        public property: string = null,
        public labelProvider: ILabelProvider<T> = null,
        public showInfo: boolean = false
    ) { }

}
