/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FORMERR } from 'dns';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ExtendedKIXObjectFormService } from '../../../base-components/webapp/core/ExtendedKIXObjectFormService';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { ObjectTagProperty } from '../../model/ObjectTagProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';

export class ObjectTagFormService extends ExtendedKIXObjectFormService {

    public async prePrepareForm(
        form: FormConfiguration, kixObject: KIXObject, formInstance: FormInstance
    ): Promise<void> {

        const fieldId = `${form.id}-field-object-tags`;
        const otFilter = [
            new FilterCriteria(
                ObjectTagProperty.NAME, SearchOperator.LIKE, FilterDataType.STRING,
                FilterType.AND, '<SEARCH_VALUE>'
            )
        ];
        const objectTag = new FormFieldConfiguration(
            fieldId,
            'Translatable#Tags', KIXObjectProperty.OBJECT_TAGS, 'object-reference-input', false,
            'Translatable#Helptext_Admin_Tags.',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.OBJECT_TAG),
                new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true),
                new FormFieldOption(ObjectReferenceOptions.FREETEXT, true),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS, new KIXObjectLoadingOptions(otFilter))
            ]
        );

        for( const page of form.pages ) {
            if ( page.groups ) {
                for ( const group of page.groups ) {
                    if ( group.formFields ) {
                        let index = group.formFields.findIndex((f) =>
                            f.property === KIXObjectProperty.COMMENT
                            || f.property === KIXObjectProperty.VALID_ID
                        );
                        if (index !== -1) {
                            group.formFields?.splice(index, 0, objectTag);
                        }
                        else if (form.objectType === KIXObjectType.OBJECT_ICON) {
                            group.formFields.push(objectTag);
                        }
                        else {
                            const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                                form.objectType, ServiceType.FORM
                            );

                            if (service) {
                                const config = service.getObjectTagPositionProperty();
                                if (config) {
                                    const property = config.get('property');
                                    const offset = config.get('indexOffset') || 0;
                                    index = group.formFields.findIndex((f) =>
                                        f.property === property
                                    );
                                    if (index !== -1) {
                                        group.formFields?.splice(index + offset, 0, objectTag);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
