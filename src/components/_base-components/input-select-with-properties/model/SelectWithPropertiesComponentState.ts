import { SelectWithPropertiesListElement, SelectWithPropertiesProperty } from '@kix/core/dist/model';

export class SelectWithPropertiesComponentState {
    public constructor(
        public list: SelectWithPropertiesListElement[],
        public properties: SelectWithPropertiesProperty[]
    ) { }
}
