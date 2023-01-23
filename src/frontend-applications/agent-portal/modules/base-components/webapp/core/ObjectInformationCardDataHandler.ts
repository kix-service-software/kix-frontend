/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { InformationConfiguration, InformationRowConfiguration, ObjectInformationCardConfiguration } from '../components/object-information-card-widget/ObjectInformationCardConfiguration';
import { FilterUtil } from './FilterUtil';
import { PlaceholderService } from './PlaceholderService';

export class ObjectInformationCardDataHandler {

    constructor() { }

    public static async prepareInformation(
        config: ObjectInformationCardConfiguration, object: KIXObject
    ): Promise<InformationRowConfiguration[]> {

        if (!Array.isArray(config.avatar) && config.avatar) {
            config.avatar = [config.avatar];
        }

        const information: InformationRowConfiguration[] = [];
        if (config?.rows?.length) {
            for (const row of config.rows) {
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

    private static async createInfoValue(
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

    public static hasComponentValues(information: InformationRowConfiguration[]): boolean {
        return information.some((row) => row.values.some((group) => group.some((v) => v.componentId)));
    }

}

export class InfoValue {
    constructor(
        public hasComponentValues: boolean,
        public infoValue: InformationConfiguration,
    ) { }
}