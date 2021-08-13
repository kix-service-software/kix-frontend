/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { InformationRowConfiguration, InformationConfiguration } from './ObjectInformationCardConfiguration';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { PlaceholderService } from '../../core/PlaceholderService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../../model/IdService';
import { FilterUtil } from '../../core/FilterUtil';
import { KIXModulesService } from '../../core/KIXModulesService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ObjectInformationCardConfiguration } from './ObjectInformationCardConfiguration';

class Component {

    private state: ComponentState;

    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (this.state.instanceId !== input.instanceId) {
            this.state.instanceId = input.instanceId;
            this.initWidget();
        }
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.contextListenerId = IdService.generateDateBasedId('object-information-widget-');
        context.registerListener(this.contextListenerId, {
            sidebarLeftToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (contactId: string, object: KIXObject, type: KIXObjectType) => {
                this.initWidget();
            },
            additionalInformationChanged: () => { return; }
        });

        this.initWidget();
    }

    public onDestroy() {
        const context = ContextService.getInstance().getActiveContext();
        context.unregisterListener(this.contextListenerId);
    }

    private async initWidget(): Promise<void> {
        this.state.prepared = false;
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        const object = await context.getObject();

        if (this.state.widgetConfiguration?.configuration) {
            const config = this.state.widgetConfiguration.configuration as ObjectInformationCardConfiguration;
            if (Array.isArray(config.avatar)) {
                this.state.avatar = config.avatar;
            } else if (config.avatar) {
                this.state.avatar = [config.avatar];
            }
            await this.prepareInformation(config.rows, object);
        }

        setTimeout(() => {
            this.state.prepared = true;
        }, 100);
    }

    private async prepareInformation(rows: InformationRowConfiguration[], object: KIXObject): Promise<void> {
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

        this.state.information = information;
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
            value.linkSrc,
            value.routingConfiguration,
            value.routingObjectId,
            '',
            ''
        );

        if (infoValue.componentId) {
            this.state.templates[infoValue.componentId] = await KIXModulesService.getComponentTemplate(
                infoValue.componentId
            );
        }

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
}

module.exports = Component;
