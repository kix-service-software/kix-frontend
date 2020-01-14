/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from "../../../../model/configuration/FormFieldConfiguration";
import { TranslationService } from "../../../translation/webapp/core";
import { IFormFieldValidator } from "../../../base-components/webapp/core/IFormFieldValidator";
import { ValidationResult } from "../../../base-components/webapp/core/ValidationResult";
import { FormService } from "../../../base-components/webapp/core/FormService";
import { ValidationSeverity } from "../../../base-components/webapp/core/ValidationSeverity";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { DynamicFormFieldOption } from "./DynamicFormFieldOption";
import { DynamicField } from "../../model/DynamicField";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { DynamicFieldProperty } from "../../model/DynamicFieldProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";

export class DynamicFieldTextValidator implements IFormFieldValidator {

    public validatorId: string = 'DynamicFieldTextValidator';

    public isValidatorFor(formField: FormFieldConfiguration, formId: string): boolean {
        return formField.property === KIXObjectProperty.DYNAMIC_FIELDS;
    }

    public async validate(formField: FormFieldConfiguration, formId: string): Promise<ValidationResult> {
        const formInstance = await FormService.getInstance().getFormInstance(formId);
        const value = formInstance.getFormFieldValue(formField.instanceId);
        const fieldValue = value ? value.value : null;
        if (fieldValue && typeof fieldValue === 'string' && fieldValue !== '') {
            const nameOption = formField.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);

            if (nameOption) {
                const regexList = await this.getRegexList(nameOption.value);

                for (const regexEntry of regexList) {
                    const regex = new RegExp(regexEntry.RegEx);
                    if (!regex.test(fieldValue)) {
                        const fieldLabel = await TranslationService.translate(formField.label);
                        const errorMessage = await TranslationService.translate(regexEntry.RegExError);
                        const errorString = await TranslationService.translate(
                            "Translatable#Field '{0}' has an invalid value ({1}).", [fieldLabel, errorMessage]
                        );
                        return new ValidationResult(ValidationSeverity.ERROR, errorString);
                    }
                }
            }
        }
        return new ValidationResult(ValidationSeverity.OK, '');
    }

    private async getRegexList(name: string): Promise<any[]> {
        const loadingOptions = new KIXObjectLoadingOptions(
            [
                new FilterCriteria(
                    DynamicFieldProperty.NAME, SearchOperator.EQUALS,
                    FilterDataType.STRING, FilterType.AND, name
                )
            ], null, null, [DynamicFieldProperty.CONFIG]
        );
        const fields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null, loadingOptions
        );

        const dynamicField = fields && fields.length ? fields[0] : null;

        if (dynamicField && (dynamicField.FieldType === 'Text' || dynamicField.FieldType === 'TextArea')) {
            if (dynamicField.Config.RegExList && dynamicField.Config.RegExList.length) {
                return dynamicField.Config.RegExList;
            }
        }

        return [];
    }
}
