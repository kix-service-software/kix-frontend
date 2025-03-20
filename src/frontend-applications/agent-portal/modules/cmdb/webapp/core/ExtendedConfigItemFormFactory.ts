/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AttributeDefinition } from '../../model/AttributeDefinition';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';

export abstract class ExtendedConfigItemFormFactory {

    public getFormField(
        ad: AttributeDefinition, parentInstanceId?: string, parent?: FormFieldConfiguration
    ): FormFieldConfiguration {
        return null;
    }

}
