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
import { ReportProperty } from '../../model/ReportProperty';
import { Report } from '../../model/Report';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { ReportingContext } from './context/ReportingContext';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { ReportDefinition } from '../../model/ReportDefinition';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class ReportLabelProvider extends LabelProvider<Report> {

    public kixObjectType: KIXObjectType = KIXObjectType.REPORT;

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case ReportProperty.DEFINITION_ID:
                const context: ReportingContext = ContextService.getInstance().getActiveContext();
                const definitions = await context.getObjectList<ReportDefinition>(KIXObjectType.REPORT_DEFINITION);
                const reportDefinition = Array.isArray(definitions)
                    ? definitions.find((rd) => rd.ObjectId === value)
                    : null;
                displayValue = reportDefinition?.Name;
                break;
            case ReportProperty.RESULTS:
                if (value && Array.isArray(value) && value.length) {
                    const resultFormats = value.map((r) => r.Format);
                    displayValue = resultFormats.join(', ');
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
        return object instanceof Report || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ReportProperty.DEFINITION_ID:
                displayValue = 'Translatable#Report Definition';
                break;
            case ReportProperty.RESULTS:
                displayValue = 'Translatable#Download Result';
                break;
            case ReportProperty.PARAMETER:
                displayValue = 'Translatable#Parameters';
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
        reportDefinition: Report, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = typeof defaultValue !== 'undefined' && defaultValue !== null
            ? defaultValue : reportDefinition[property];

        switch (property) {
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
                ? await TranslationService.translate('Translatable#Reports')
                : 'Reports';
            return reportDefinitionsLabel;
        }

        const reportDefinitionLabel = translatable ?
            await TranslationService.translate('Translatable#Report') : 'Report';
        return reportDefinitionLabel;
    }

    public getObjectIcon(object?: Report): string | ObjectIcon {
        if (object) {
            return new ObjectIcon(null, KIXObjectType.REPORT, object.ID, null, null, 'kix-icon-kpi');
        } else {
            return 'kix-icon-kpi';
        }
    }
}

