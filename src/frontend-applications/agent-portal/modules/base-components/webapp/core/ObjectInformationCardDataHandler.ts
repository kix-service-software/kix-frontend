/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetConfiguration } from '../../../../model/configuration/WidgetConfiguration';
import { Context } from '../../../../model/Context';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { InformationConfiguration, InformationRowConfiguration, ObjectInformationCardConfiguration } from '../components/object-information-card-widget/ObjectInformationCardConfiguration';
import { FilterUtil } from './FilterUtil';
import { KIXModulesService } from './KIXModulesService';
import { PlaceholderService } from './PlaceholderService';

export class ObjectInformationCardDataHandler {

    constructor() { }

    public async initWidgetConfiguration(context: Context, instanceId: string): Promise<InitWidgetData> {
        const widgetConfiguration = context
            ? await context.getWidgetConfiguration(instanceId)
            : undefined;

        let avatar: Array<ObjectIcon | string>;
        if (widgetConfiguration?.configuration) {
            const config = widgetConfiguration.configuration as ObjectInformationCardConfiguration;
            if (Array.isArray(config.avatar)) {
                avatar = config.avatar;
            } else if (config.avatar) {
                avatar = [config.avatar];
            }
        }
        return new InitWidgetData(widgetConfiguration, avatar);
    }

    public async prepareInformation(
        rows: InformationRowConfiguration[],
        object: KIXObject)
        : Promise<InformationRowConfiguration[]> {
        const information: InformationRowConfiguration[] = [];
        if (Array.isArray(rows)) {
            for (const row of rows) {
                if (Array.isArray(row.values)) {
                    const infoRow: InformationRowConfiguration = {
                        title: row.title,
                        style: row.style,
                        separator: row.separator,
                        values: []
                    };

                    for (const value of row.values) {
                        if (Array.isArray(value)) {
                            const group: InformationConfiguration[] = [];
                            for (const v of value) {
                                const infoValue = await this.createInfoValue(v, object);
                                if (infoValue) {
                                    group.push(infoValue);
                                }
                            }

                            if (group.length) {
                                infoRow.values.push(group);
                            }
                        } else {
                            const infoValue = await this.createInfoValue(value, object);
                            if (infoValue) {
                                infoRow.values.push([infoValue]);
                            }
                        }
                    }
                    if (infoRow.values.length) {
                        information.push(infoRow);
                    }
                }
            }
        }

        return information;
    }

    private async createInfoValue(
        value: InformationConfiguration, object: KIXObject
    ): Promise<InformationConfiguration> {
        if (Array.isArray(value.conditions)) {
            const match = await FilterUtil.checkCriteriaByPropertyValue(value.conditions, object);
            if (!match) {
                return null;
            }
        }

        const infoValue: InformationConfiguration = new InformationConfiguration(
            value.componentId,
            value.componentData ? value.componentData : {},
            [],
            value.icon,
            null,
            value.text,
            value.textPlaceholder,
            value.textStyle,
            value.detailViewWidthFactor,
            value.linkSrc,
            value.routingConfiguration,
            value.routingObjectId,
            '',
            ''
        );

        const placeholders = [];
        if (Array.isArray(value.textPlaceholder)) {
            for (const placeholder of value.textPlaceholder) {
                const placeholderValue = await PlaceholderService.getInstance().replacePlaceholders(
                    placeholder, object
                );
                placeholders.push(placeholderValue);
            }
        }

        let text = await PlaceholderService.getInstance().replacePlaceholders(value.text, object);
        text = await TranslationService.translate(text, placeholders);
        infoValue.preparedText = text;

        const link = await PlaceholderService.getInstance().replacePlaceholders(value.linkSrc, object);
        infoValue.preparedLinkSrc = link;

        if (value.routingConfiguration) {
            infoValue.routingObjectId = await PlaceholderService.getInstance().replacePlaceholders(
                value.routingObjectId
            );
        }

        return infoValue;
    }

    public hasComponentValues(information: InformationRowConfiguration[]): boolean {
        return information.some((row) => row.values.some((group) => group.some((v) => v.componentId)));
    }

    public async setTemplateIds(information: InformationRowConfiguration[]): Promise<any> {
        const templates = {};
        for (const row of information) {
            for (const group of row.values) {
                for (const infoValue of group) {
                    if (infoValue.componentId) {
                        templates[infoValue.componentId] = await KIXModulesService.getComponentTemplate(
                            infoValue.componentId
                        );
                    }
                }
            }
        }
        return templates;
    }

}

export class InitWidgetData {
    constructor(
        public widgetConfiguration: WidgetConfiguration,
        public avatar: Array<ObjectIcon | string>,
    ) { }
}

export class InfoValue {
    constructor(
        public hasComponentValues: boolean,
        public infoValue: InformationConfiguration,
    ) { }
}