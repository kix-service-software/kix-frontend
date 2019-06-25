import { ObjectIcon } from '../../../core/model';

export class ComponentState<T> {

    public constructor(
        public propertyDisplayText: string = null,
        public propertyName: string = '',
        public propertyIcon: string | ObjectIcon = null,
        public hasText: boolean = true
    ) { }

}
