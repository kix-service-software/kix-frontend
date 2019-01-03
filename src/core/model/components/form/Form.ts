import { AutoCompleteConfiguration } from './AutoCompleteConfiguration';
import { FormGroup } from './FormGroup';
import { KIXObjectType } from '../..';
import { FormContext } from './FormContext';

export class Form {

    public constructor(
        public id: string,
        public name: string,
        public groups: FormGroup[],
        public objectType: KIXObjectType,
        public validation: boolean = true,
        public formContext: FormContext = FormContext.NEW,
        public autoCompleteConfiguration: AutoCompleteConfiguration = new AutoCompleteConfiguration(),
        public singleFormGroupOpen: boolean = false
    ) { }

}
