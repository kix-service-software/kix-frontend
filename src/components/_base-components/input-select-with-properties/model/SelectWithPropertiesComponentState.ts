import { SelectWithPropertiesListElement, SelectWithPropertiesProperty } from '@kix/core/dist/browser/model';

export class SelectWithPropertiesComponentState {
    public constructor(
        public list: SelectWithPropertiesListElement[],
        public properties: SelectWithPropertiesProperty[]
    ) { }
}
