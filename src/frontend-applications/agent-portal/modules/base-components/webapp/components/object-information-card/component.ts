/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ObjectInformationCardService } from '../../core/ObjectInformationCardService';
import { InformationConfiguration, InformationRowConfiguration, ObjectInformationCardConfiguration } from '../object-information-card-widget/ObjectInformationCardConfiguration';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { ContextService } from '../../core/ContextService';
import { Context } from '../../../../../model/Context';
import { KIXModulesService } from '../../core/KIXModulesService';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private config: ObjectInformationCardConfiguration;
    private widgetInstanceId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.config = input.config;
        this.state.object = input.object;
        this.widgetInstanceId = input.widgetInstanceId;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.initWidget();
    }

    private async initWidget(): Promise<void> {
        if (this.config) {
            await this.prepareInformation(this.config, this.state.object);
            if (Array.isArray(this.config.avatar) && (this.config.avatar as Array<string | ObjectIcon>).length > 0) {
                this.state.avatar = this.config.avatar;
            } else if (this.config.avatar && typeof this.config.avatar === 'string') {
                this.state.avatar.push(this.config.avatar);
            } else if (this.config.avatar) {
                this.state.avatar.push((this.config.avatar as ObjectIcon));
            }
        }
    }

    private async prepareInformation(config: ObjectInformationCardConfiguration, object: KIXObject): Promise<void> {
        this.state.valuesReady = false;
        this.state.information = await ObjectInformationCardService.getInstance().prepareInformation(config, object);
        this.state.valuesReady = true;
    }

    public getCustomRowStyle(index: number): string {
        const row = this.state.information[index] as InformationRowConfiguration;
        if (
            this.isRowWithCreatedBy(index) ||
            this.context.openSidebarWidgets.some((osw) => osw === this.widgetInstanceId)
        ) {
            return;
        }
        const basicColumnWidth = 15;
        let largestFactor = 1;
        row.values.forEach((value) => {
            const newLargestFactor = this.getLargestWidthFactor(value);
            if (newLargestFactor > largestFactor) {
                largestFactor = newLargestFactor;
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