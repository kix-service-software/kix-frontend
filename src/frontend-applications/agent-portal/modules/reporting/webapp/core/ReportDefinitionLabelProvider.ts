/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ReportDefinitionProperty } from '../../model/ReportDefinitionProperty';
import { ReportDefinition } from '../../model/ReportDefinition';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class ReportDefinitionLabelProvider extends LabelProvider<ReportDefinition> {

    public kixObjectType: KIXObjectType = KIXObjectType.REPORT_DEFINITION;

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case ReportDefinitionProperty.REPORTS:
                if (value && Array.isArray(value)) {
                    displayValue = value.length;
                }
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof ReportDefinition || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS:
                displayValue = 'Translatable#Available Output Formats';
                break;
            case ReportDefinitionProperty.DATASOURCE:
                displayValue = 'Translatable#Data Source';
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

    public async getExportPropertyValue(property: string, value: any): Promise<any> {
        let newValue = value;
        switch (property) {
            default:
                newValue = await super.getExportPropertyValue(property, value);
        }
        return newValue;
    }

    public async getDisplayText(
        reportDefinition: ReportDefinition, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = typeof defaultValue !== 'undefined' && defaultValue !== null
            ? defaultValue : reportDefinition[property];

        switch (property) {
            case ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS:
                displayValue = reportDefinition && reportDefinition.Config['OutputFormats']
                    ? Object.keys(reportDefinition.Config['OutputFormats']).join(',')
                    : defaultValue;
                break;
            case ReportDefinitionProperty.NAME:
                translatable = false;
                break;
            default:
                displayValue = await super.getDisplayText(reportDefinition, property, defaultValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-kpi';
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (plural) {
            const reportDefinitionsLabel = translatable
                ? await TranslationService.translate('Translatable#Report Definitions')
                : 'Report Definitions';
            return reportDefinitionsLabel;
        }

        const reportDefinitionLabel = translatable ?
            await TranslationService.translate('Translatable#Report Definition') : 'Report Definition';
        return reportDefinitionLabel;
    }

    public async getObjectText(
        object: ReportDefinition, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return object.Name;
    }

    public getObjectIcon(object?: ReportDefinition): string | ObjectIcon {
        if (object) {
            return new ObjectIcon(null, KIXObjectType.REPORT_DEFINITION, object.ID, null, null, 'kix-icon-kpi');
        } else {
            return 'kix-icon-kpi';
        }
    }
}

