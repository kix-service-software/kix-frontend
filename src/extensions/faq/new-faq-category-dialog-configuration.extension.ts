/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    FormFieldOption, ContextConfiguration, FormField, FormFieldValue,
    Form, KIXObjectType, FormContext, FormFieldOptions, KIXObjectProperty,
    ObjectReferenceOptions,
    KIXObjectLoadingOptions,
    FilterCriteria,
    FilterDataType,
    FilterType
} from '../../core/model';
import { FAQCategoryProperty } from '../../core/model/kix/faq';
import { IConfigurationExtension } from '../../core/extensions';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { NewFAQCategoryDialogContext } from '../../core/browser/faq/admin';
import { SearchOperator } from '../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewFAQCategoryDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        return new ContextConfiguration(this.getModuleId());
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-faq-category-form';
        const existingForm = configurationService.getConfiguration(formId);
        if (!existingForm || overwrite) {
            const fields: FormField[] = [];
            fields.push(
                new FormField(
                    'Translatable#Name', FAQCategoryProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_FAQCategoryCreate_Name'
                )
            );
            fields.push(
                new FormField(
                    'Translatable#Icon', 'ICON', 'icon-input', false,
                    'Translatable#Helptext_Admin_FAQCategoryCreate_Icon'
                )
            );
            fields.push(
                new FormField(
                    'Translatable#Parent Category', FAQCategoryProperty.PARENT_ID, 'object-reference-input', false,
                    'Translatable#Helptext_Admin_FAQCategoryCreate_ParentCategory', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.FAQ_CATEGORY),
                        new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                        new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                            new KIXObjectLoadingOptions(
                                [
                                    new FilterCriteria(
                                        FAQCategoryProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                        FilterType.AND, null
                                    )
                                ],
                                null, null,
                                [FAQCategoryProperty.SUB_CATEGORIES],
                                [FAQCategoryProperty.SUB_CATEGORIES]
                            )
                        )
                    ]
                )
            );
            fields.push(
                new FormField(
                    'Translatable#Comment', FAQCategoryProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_FAQCategoryCreate_Comment',
                    null, null, null, null, null, null, null, 250
                )
            );
            fields.push(
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID,
                    'object-reference-input', true, 'Translatable#Helptext_Admin_FAQCategoryCreate_Validity', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                    ], new FormFieldValue(1)
                )
            );

            const group = new FormGroup('Translatable#FAQ Category Information', fields);

            const form = new Form(formId, 'Translatable#New FAQ Category', [group], KIXObjectType.FAQ_CATEGORY, true);
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.FAQ_CATEGORY, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
