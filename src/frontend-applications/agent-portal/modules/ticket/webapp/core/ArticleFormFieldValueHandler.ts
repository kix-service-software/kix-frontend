/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldValueHandler } from '../../../base-components/webapp/core/FormFieldValueHandler';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ArticleProperty } from '../../model/ArticleProperty';
import { ServiceRegistry } from '../../../base-components/webapp/core/ServiceRegistry';
import { ArticleFormService } from './ArticleFormService';
import { ServiceType } from '../../../base-components/webapp/core/ServiceType';

export class ArticleFormFieldValueHandler extends FormFieldValueHandler {

    public objectType: string = KIXObjectType.ARTICLE;

    public id: string = 'ArticleFormFieldValueHandler';

    public async handleFormFieldValues(
        formInstance: FormInstance, changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]>
    ): Promise<void> {
        const channelValue = changedFieldValues.find((cv) => cv[0] && cv[0].property === ArticleProperty.CHANNEL_ID);
        if (channelValue && channelValue[1]) {
            const field = channelValue[0];
            const value = channelValue[1];

            const formService = ServiceRegistry.getServiceInstance<ArticleFormService>(
                KIXObjectType.ARTICLE, ServiceType.FORM
            );

            if (value.value) {
                const channelFields = await formService.getFormFieldsForChannel(
                    formInstance, value.value, formInstance.getForm().id, false
                );
                formInstance.addFieldChildren(field, channelFields, true);
            } else {
                formInstance.addFieldChildren(field, [], true);
            }
        }
    }

}
