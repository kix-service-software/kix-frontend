/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../../model/IdService';
import { ObjectInformationCardConfiguration } from './ObjectInformationCardConfiguration';
import { Context } from '../../../../../model/Context';
import { ObjectInformationCardDataHandler } from '../../core/ObjectInformationCardDataHandler';
import { KIXModulesService } from '../../core/KIXModulesService';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

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

        this.state.widgetConfiguration = this.context
            ? await this.context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.initWidget();
    }

    public onDestroy(): void {
        this.context.unregisterListener(this.contextListenerId);
    }

    private async initWidget(): Promise<void> {
        const object = await this.context.getObject();
        const config = this.state.widgetConfiguration?.configuration as ObjectInformationCardConfiguration;
        await this.prepareInformation(config, object);
        if (Array.isArray(config.avatar) && (config.avatar as Array<string | ObjectIcon>).length > 0) {
            this.state.avatar = config.avatar;
        } else if (config.avatar && typeof config.avatar === 'string') {
            this.state.avatar.push(config.avatar);
        } else if (config.avatar) {
            this.state.avatar.push((config.avatar as ObjectIcon));
        }
    }

    private async prepareInformation(config: ObjectInformationCardConfiguration, object: KIXObject): Promise<void> {
        this.state.valuesReady = false;
        this.state.hasComponentValues = false;
        this.state.information = await ObjectInformationCardDataHandler.prepareInformation(config, object);
        const hasComponentValues = ObjectInformationCardDataHandler.hasComponentValues(this.state.information);
        if (hasComponentValues) {
            this.state.hasComponentValues = true;
        }
        this.setDataMapValues(this.state.information);
        this.state.valuesReady = true;
    }

    private setDataMapValues(information: InformationRowConfiguration[]): void {
        information.forEach((row) => {
            row.values.forEach((group) => {
                group.forEach((infoValue) => {
                    const data: [string, boolean] = (this.state.widgetType === 2) ? [infoValue.text, true] :
                        [infoValue.componentData.property, true];
                    this.setDataMapValue(data);
                });
            });
        });
    }

    public hasRowValue(row: InformationRowConfiguration): boolean {
        let hasValue = false;
        for (const value of row.values) {
            hasValue = this.hasValue(value);
            if (hasValue) {
                break;
            }
        }
        return hasValue;
    }

    // function also needed for object-avatar-label
    public setDataMapValue(value: [string, boolean]): void {
        const previousValue = this.valueDataMap.get(value[0]);
        if (previousValue !== value[1]) {
            this.state.valuesReady = false;
            this.valueDataMap.set(value[0], value[1]);
            this.state.valuesReady = true;
        }
    }

    public hasValue(group: InformationConfiguration[]): boolean {
        if (this.state.widgetType === 2) {
            if (group.some((value) => this.valueDataMap.get(value.text))) {
                return true;
            }
        }
        else {
            if (group.some((value) => this.valueDataMap.get(value.componentData.property))) {
                return true;
            }
        }
        return false;
    }

    public getCustomRowStyle(index: number): string {
        const row = this.state.information[index] as InformationRowConfiguration;
        if (
            !this.hasRowValue(row) || this.isRowWithCreatedBy(index) ||
            this.context.openSidebarWidgets.some((osw) => osw === this.state.instanceId)
        ) {
            return;
        }
        const basicColumnWidth = 15;
        let largestFactor = 1;
        row.values.forEach((value) => {
            if (this.hasValue(value)) {
                const newLargestFactor = this.getLargestWidthFactor(value);
                if (newLargestFactor > largestFactor) {
                    largestFactor = newLargestFactor;
                }
            }
        });
        const size = largestFactor * basicColumnWidth + (largestFactor - 1);
        return `grid-template-columns: repeat(auto-fill,${size}rem)`;
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
                if (widthFactor > 23) widthFactor = 23;
                if (widthFactor < 1) widthFactor = 1;
                if (widthFactor > largestFactor) {
                    largestFactor = widthFactor;
                }
            }
        });
        return largestFactor;
    }

    public isRowWithCreatedBy(index: number): boolean {
        const row = this.state.information[index] as InformationRowConfiguration;
        return row.values.some((group) => group && group.some(
            (value) => value && value.textPlaceholder && value.textPlaceholder.some(
                (placeholder) => placeholder && placeholder === '<KIX_TICKET_CreateBy>'
            )
        ));
    }

    public getTemplate(componentId: string): any {
        return KIXModulesService.getComponentTemplate(componentId);
    }
}

module.exports = Component;
