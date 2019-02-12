import { AutoCompleteConfiguration } from './AutoCompleteConfiguration';
import { KIXObjectType } from '../..';
import { FormContext } from './FormContext';
import { Form } from './Form';

export class SearchForm extends Form {

    public constructor(
        id: string,
        name: string,
        objectType: KIXObjectType,
        formContext: FormContext = FormContext.NEW,
        autoCompleteConfiguration: AutoCompleteConfiguration = new AutoCompleteConfiguration(),
        public defaultSearchProperties: string[] = []
    ) {
        super(id, name, [], objectType, false, formContext, autoCompleteConfiguration);
    }

}
