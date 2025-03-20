/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { MailFilter } from '../../model/MailFilter';
import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { MailFilterProperty } from '../../model/MailFilterProperty';
import { MailFilterMatch } from '../../model/MailFilterMatch';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class MailFilterFormService extends KIXObjectFormService {

    private static INSTANCE: MailFilterFormService = null;

    public static getInstance(): MailFilterFormService {
        if (!MailFilterFormService.INSTANCE) {
            MailFilterFormService.INSTANCE = new MailFilterFormService();
        }

        return MailFilterFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.MAIL_FILTER;
    }

    protected async getValue(property: string, value: any, mailFilter: MailFilter,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        switch (property) {
            case MailFilterProperty.NAME:
                if (formContext === FormContext.NEW && mailFilter) {
                    value = await TranslationService.translate(
                        'Translatable#Copy of {0}', [value]
                    );
                }
                break;
            case MailFilterProperty.MATCH:
                if (Array.isArray(value)) {
                    (value as MailFilterMatch[]).forEach((m) => {
                        m.Not = Boolean(m.Not);
                    });
                }
                break;
            default:
                value = super.getValue(property, value, mailFilter, formField, formContext);
        }
        return value;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        switch (property) {
            case MailFilterProperty.STOP_AFTER_MATCH:
                value = Number(value);
                break;
            case MailFilterProperty.MATCH:
                if (Array.isArray(value)) {
                    (value as MailFilterMatch[]).forEach((m) => {
                        m.Not = Number(m.Not);
                    });
                }
                break;
            default:
        }
        return [[property, value]];
    }
}
