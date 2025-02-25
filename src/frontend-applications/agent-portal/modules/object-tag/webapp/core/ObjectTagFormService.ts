/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ExtendedKIXObjectFormService } from '../../../base-components/webapp/core/ExtendedKIXObjectFormService';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';

export class ObjectTagFormService extends ExtendedKIXObjectFormService {

    public async prePrepareForm(
        form: FormConfiguration, kixObject: KIXObject, formInstance: FormInstance
    ): Promise<void> {

        const fieldId = `${form.id}-field-object-tags`;
        const objectTag = new FormFieldConfiguration(
            fieldId,
            'Translatable#Tags', KIXObjectProperty.OBJECT_TAGS, 'object-reference-input', false,
            'Translatable#Helptext_Admin_Tags.',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.OBJECT_TAG),
                new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true),
                new FormFieldOption(ObjectReferenceOptions.FREETEXT, true),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true)
            ]
        );

        for( const page of form.pages ) {
            if ( page.groups ) {
                for ( const group of page.groups ) {
                    if ( group.formFields ) {
                        const index = group.formFields.findIndex( (f) =>
                            f.property === KIXObjectProperty.COMMENT
                            || f.property === KIXObjectProperty.VALID_ID
                        );
                        if (index !== -1) {
                            group.formFields?.splice(index, 0, objectTag);
                        }
                    }
                }
            }
        }
    }
}
