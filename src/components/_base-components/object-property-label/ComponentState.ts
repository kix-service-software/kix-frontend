import { ILabelProvider } from '@kix/core/dist/browser';
import { ObjectIcon } from '@kix/core/dist/model';

export class ComponentState<T> {

    public constructor(
        public object: T = null,
        public property: string = null,
        public labelProvider: ILabelProvider<T> = null,
        public showInfo: boolean = false,
        public propertyDisplayText: string = '',
        public propertyName: string = '',
        public propertyIcon: string | ObjectIcon = null,
        public hasText: boolean = true
    ) { }

}
