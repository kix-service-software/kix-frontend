/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutocompleteFormFieldOption } from '../../../../model/AutocompleteFormFieldOption';
import { AutocompleteOption } from '../../../../model/AutocompleteOption';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOptions } from '../../../../model/configuration/FormFieldOptions';
import { ObjectFormValueMapper } from '../ObjectFormValueMapper';
import { ObjectFormValue } from './ObjectFormValue';

export class RichTextFormValue extends ObjectFormValue<string> {

    public noImages: boolean = false;
    public autocompleteOption: AutocompleteFormFieldOption;

    public constructor(
        public property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        autoCompleteOptions: AutocompleteOption[] = []
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'richtext-form-input';
        this.autocompleteOption = new AutocompleteFormFieldOption(autoCompleteOptions);
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);
        const noImagesOption = field?.options.find((o) => o.option === 'NO_IMAGES');
        this.noImages = Boolean(noImagesOption?.value);

        const autofillOption = field?.options.find((o) => o.option === FormFieldOptions.AUTO_COMPLETE);
        if (autofillOption) {
            this.autocompleteOption = autofillOption?.value;
        }
    }
}