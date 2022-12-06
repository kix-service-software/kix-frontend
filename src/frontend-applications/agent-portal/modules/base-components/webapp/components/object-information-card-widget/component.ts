/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { Context } from '../../../../../model/Context';

class Component {

    private state: ComponentState;

    private contextListenerId: string;

    private context: Context;

    private valueDataMap: Map<string, boolean>;

    public onCreate(): void {
        this.state = new ComponentState();
        this.valueDataMap = new Map<string, boolean>();
    }

    public onInput(input: any): void {
        if (this.state.instanceId !== input.instanceId) {
            this.state.instanceId = input.instanceId;
        }
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.contextListenerId = IdService.generateDateBasedId('object-information-widget-');
        this.context.registerListener(this.contextListenerId, {
            sidebarLeftToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (contactId: string, object: KIXObject, type: KIXObjectType) => {
                this.initWidget();
            },
            additionalInformationChanged: (): void => { return; }
        });

        this.initWidget();
    }

    public onDestroy(): void {
        this.context.unregisterListener(this.contextListenerId);
    }

    private async initWidget(): Promise<void> {
        this.state.widgetConfiguration = this.context
            ? await this.context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        const object = await this.context.getObject();

        if (this.state.widgetConfiguration?.configuration) {
            const config = this.state.widgetConfiguration.configuration as ObjectInformationCardConfiguration;
            if (Array.isArray(config.avatar)) {
                this.state.avatar = config.avatar;
            } else if (config.avatar) {
                this.state.avatar = [config.avatar];
            }
            await this.prepareInformation(config.rows, object);
        }
    }

    private async prepareInformation(rows: InformationRowConfiguration[], object: KIXObject): Promise<void> {
        this.state.valuesReady = false;
        this.state.hasComponentValues = false;
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
                                    this.setDataMapValue([infoValue.componentData.property, true]);
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
        this.state.valuesReady = true;
    }

    public setDataMapValue(data: Array<any>): void {
        const previousValue = this.valueDataMap.get(data[0]);
        if (previousValue !== data[1]) {
            this.state.valuesReady = false;
            this.valueDataMap.set(data[0], data[1]);
            this.state.valuesReady = true;
        }
    }

    public hasValue(group: InformationConfiguration[]): boolean {
        if (group.some((value) => this.valueDataMap.get(value.componentData.property))) {
            return true;
        }
        return false;
    }

    public hasRowValue(row: InformationRowConfiguration): boolean {
        let hasValue = false;
        row.values.forEach((value) => {
            hasValue = this.hasValue(value);
            if (hasValue) {
                return true;
            }
        });
        return hasValue;
    }

    public getCustomRowStyle(index: number): string {
        const basicColumnWidth = 15;
        const row = this.state.information[index] as InformationRowConfiguration;
        if (!this.hasRowValue(row) || this.isRowWithCreatedBy(index)) return null;
        let style = 'grid-auto-columns:';
        row.values.forEach((value, index) => {
            if (this.hasValue(value)) {
                const largestFactor = this.getLargestWidthFactor(value);
                style += ` ${largestFactor * basicColumnWidth + (largestFactor - 1)}rem`;
                if (index === row.values.length - 1) {
                    style += ';';
                }
            }
        });
        return style;
    }

    private getLargestWidthFactor(group: InformationConfiguration[]): number {
        let largestFactor = 1;
        group.forEach((value) => {
            if (value.detailViewWidthFactor) {
                let widthFactor: number;
                try {
                    widthFactor = Number.parseInt(value.detailViewWidthFactor);
                } catch (e) {
                    widthFactor = 1;
                }
                if (widthFactor > 4) widthFactor = 4;
                if (widthFactor < 1) widthFactor = 1;
                if (widthFactor > largestFactor) {
                    largestFactor = widthFactor;
                }
            }
        });
        return largestFactor;
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

        if (infoValue.componentId) {
            this.state.hasComponentValues = true;
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

    public isRowWithCreatedBy(index: number): boolean {
        const row = this.state.information[index] as InformationRowConfiguration;
        return row.values.some((group) => group && group.some(
            (value) => value && value.textPlaceholder && value.textPlaceholder.some(
                (placeholder) => placeholder && placeholder === '<KIX_TICKET_CreateBy>'
            )
        ));
    }
}

module.exports = Component;
