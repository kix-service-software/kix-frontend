/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { MailFilter } from '../../model/MailFilter';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { MailFilterProperty } from '../../model/MailFilterProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { MailFilterMatch } from '../../model/MailFilterMatch';
import { SortUtil } from '../../../../model/SortUtil';
import { DataType } from '../../../../model/DataType';
import { MailFilterSet } from '../../model/MailFilterSet';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class MailFilterLabelProvider extends LabelProvider<MailFilter> {

    public kixObjectType: KIXObjectType = KIXObjectType.MAIL_FILTER;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof MailFilter || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case MailFilterProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case MailFilterProperty.STOP_AFTER_MATCH:
                displayValue = 'Translatable#Stop after match';
                break;
            case MailFilterProperty.MATCH:
                displayValue = 'Translatable#Filter Conditions';
                break;
            case MailFilterProperty.SET:
                displayValue = 'Translatable#Email Header';
                break;
            case MailFilterProperty.ID:
                displayValue = 'Translatable#Id';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        mailFilter: MailFilter, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = mailFilter[property];

        switch (property) {
            case MailFilterProperty.ID:
                displayValue = mailFilter.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case MailFilterProperty.STOP_AFTER_MATCH:
                displayValue = value ? 'Translatable#Yes' : 'Translatable#No';
                break;
            case MailFilterProperty.MATCH:
                if (Array.isArray(value)) {
                    const matchList: MailFilterMatch[] = SortUtil.sortObjects(value, 'Key', DataType.STRING);
                    displayValue = matchList.map(
                        (v) => `${v.Key} ${v.Not ? '!~' : '=~'} ${v.Value}`
                    ).join(', ');
                }
                break;
            case MailFilterProperty.SET:
                if (Array.isArray(value)) {
                    const setList: MailFilterSet[] = SortUtil.sortObjects(value, 'Key', DataType.STRING);
                    displayValue = setList.map(
                        (v) => `${v.Key} := ${v.Value}`
                    ).join(', ');
                }
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(object: MailFilter, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: MailFilter): string[] {
        return [];
    }

    public async getObjectText(
        object: MailFilter, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${object.Name}`;
    }

    public getObjectAdditionalText(object: MailFilter, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: MailFilter): string | ObjectIcon {
        return new ObjectIcon(null, 'MailFilter', object.ID);
    }

    public async getObjectTooltip(object: MailFilter, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(object.Name);
        }
        return object.Name;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Email Filters' : 'Translatable#Email Filter'
            );
        }
        return plural ? 'Email Filters' : 'Email Filter';
    }

    public async getIcons(object: MailFilter, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        switch (property) {
            case MailFilterProperty.STOP_AFTER_MATCH:
                if (object.StopAfterMatch) {
                    icons.push('kix-icon-check');
                }
                break;
            default:
        }
        return icons;
    }

}

