/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { AgentService } from '../../../user/webapp/core/AgentService';
import { InformationConfiguration, InformationRowConfiguration, ObjectInformationCardConfiguration } from '../components/object-information-card-widget/ObjectInformationCardConfiguration';
import { FilterUtil } from './FilterUtil';
import { ObjectInformationComponentHandler } from './ObjectInformationComponentHandler';
import { PlaceholderService } from './PlaceholderService';

export class ObjectInformationCardService {

    private static INSTANCE: ObjectInformationCardService;

    public static getInstance(): ObjectInformationCardService {
        if (!ObjectInformationCardService.INSTANCE) {
            ObjectInformationCardService.INSTANCE = new ObjectInformationCardService();
        }
        return ObjectInformationCardService.INSTANCE;
    }

    private constructor() { }

    private objectInformationComponentHandler: Map<string, ObjectInformationComponentHandler> = new Map();

    public registerObjectInformationComponentHandler(
        componentId: string, handler: ObjectInformationComponentHandler
    ): void {
        this.objectInformationComponentHandler.set(componentId, handler);
    }

    public async prepareInformation(
        config: ObjectInformationCardConfiguration, object: KIXObject
    ): Promise<InformationRowConfiguration[]> {

        if (!Array.isArray(config.avatar) && config.avatar) {
            config.avatar = [config.avatar];
        }

        const currentUser = await AgentService.getInstance().getCurrentUser();

        const information: InformationRowConfiguration[] = [];
        if (config?.rows?.length) {
            for (const row of config.rows.filter((r) => r.values?.length)) {
                if (!AgentService.userHasRole(row.roleIds, currentUser)) {
                    continue;
                }

                const infoRow = new InformationRowConfiguration([], row.title, row.style, row.separator);
                for (const value of row.values) {
                    if (value?.length) {
                        if (!AgentService.userHasRole(row.roleIds, currentUser)) {
                            continue;
                        }
                    }
                    await this.prepareValue(value, object, infoRow);
                }

                if (infoRow.values?.length) {
                    information.push(infoRow);
                }
            }
        }

        return information;
    }

    private async prepareValue(
        value: InformationConfiguration | InformationConfiguration[],
        object: KIXObject,
        row: InformationRowConfiguration
    ): Promise<void> {
        if (Array.isArray(value)) {
            const group: InformationConfiguration[] = [];
            for (const v of value) {
                const infoValue = await this.createInfoValue(v, object);
                if (infoValue) {
                    group.push(infoValue);
                }
            }

            if (group.length) {
                row.values.push(group);
            }
        } else {
            const infoValue = await this.createInfoValue(value, object);
            if (infoValue) {
                row.values.push([infoValue]);
            }
        }
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

        const infoValue = InformationConfiguration.clone(value);
        let success = await this.prepareTextValue(infoValue, value, object);
        success &&= await this.prepareComponentData(infoValue, value, object);

        if (!success) {
            return null;
        }

        const link = await PlaceholderService.getInstance().replacePlaceholders(value.linkSrc, object);
        infoValue.preparedLinkSrc = link;

        if (value.routingConfiguration) {
            infoValue.routingObjectId = await PlaceholderService.getInstance().replacePlaceholders(
                value.routingObjectId, object
            );
        }

        return infoValue;
    }

    private async prepareTextValue(
        infoValue: InformationConfiguration, value: InformationConfiguration, object: KIXObject
    ): Promise<boolean> {
        if (value.text) {
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

            // if text is given and the prepared text is empty then do not display this info
            if (!infoValue.preparedText) {
                return false;
            }
        }

        return true;
    }

    private async prepareComponentData(
        infoValue: InformationConfiguration, value: InformationConfiguration, object: KIXObject
    ): Promise<boolean> {
        let success = true;

        if (value.componentId) {
            const handler = this.objectInformationComponentHandler.get(value?.componentId);
            if (handler) {
                success = await handler.prepareComponentInformation(infoValue, value, object);
            } else {
                console.warn(`No ObjectInformationComponentHandler registered for component ${value?.componentId}`);
            }
        }

        return success;
    }

}