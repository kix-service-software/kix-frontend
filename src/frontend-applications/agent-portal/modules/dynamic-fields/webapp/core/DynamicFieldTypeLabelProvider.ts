/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { DynamicFieldType } from '../../model/DynamicFieldType';
import { DynamicFieldTypeProperty } from '../../model/DynamicFieldTypeProperty';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class DynamicFieldTypeLabelProvider extends LabelProvider<DynamicFieldType> {

    public kixObjectType: KIXObjectType = KIXObjectType.DYNAMIC_FIELD_TYPE;

    public isLabelProviderFor(object: DynamicFieldType | KIXObject): boolean {
        return object instanceof DynamicFieldType || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue: string;
        switch (property) {
            case DynamicFieldTypeProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case DynamicFieldTypeProperty.DISPLAY_NAME:
                displayValue = 'Translatable#Label';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        dynamicFieldType: DynamicFieldType, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = dynamicFieldType[property];

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(
        dynamicFieldType: DynamicFieldType, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        return translatable ?
            await TranslationService.translate(dynamicFieldType.DisplayName) : dynamicFieldType.DisplayName;
    }

    public getObjectIcon(dynamicFieldType?: DynamicFieldType): string | ObjectIcon {
        switch (dynamicFieldType.Name) {
            case 'ITSMConfigItemReference':
                return 'fa fa-archive';
            case 'CheckList':
                return 'kix-icon-checklist';
            case 'DateTime':
                return 'far fa-clock';
            case 'Date':
                return 'kix-icon-calendar';
            case 'Text':
                return 'kix-icon-minus';
            case 'TextArea':
                return 'kix-icon-menue';
            case 'Multiselect':
                return 'fa fa-th-list';
            case 'TicketReference':
                return 'kix-icon-ticket';
            case 'Table':
                return 'fas fa-table';
            default:
                return new ObjectIcon(null, KIXObjectType.DYNAMIC_FIELD_TYPE, dynamicFieldType.Name);
        }
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Dynamic Field Types' : 'Translatable#Dynamic Field Type'
            );
        }
        return plural ? 'Dynamic Field Types' : 'Dynamic Field Type';
    }

    public async getObjectTooltip(dynamicFieldType: DynamicFieldType, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(dynamicFieldType.DisplayName);
        }
        return dynamicFieldType.DisplayName;
    }

    public async getIcons(dynamicFieldType: DynamicFieldType, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        return icons;
    }

}
