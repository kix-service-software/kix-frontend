/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { IConfiguration, IInformationRow } from './IConfiguration';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { PlaceholderService } from '../../core/PlaceholderService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../../model/IdService';
import { FilterUtil } from '../../core/FilterUtil';

class Component {

    private state: ComponentState;

    private contextListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.contextListenerId = IdService.generateDateBasedId('object-information-widget-');
        context.registerListener(this.contextListenerId, {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
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
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        const object = await context.getObject();

        if (this.state.widgetConfiguration.configuration) {
            const config = this.state.widgetConfiguration.configuration as IConfiguration;
            this.state.avatar = config.avatar;
            await this.prepareInformation(config.rows, object);
        }

        setTimeout(() => {
            this.state.prepared = true;
        }, 100);
    }

    private async prepareInformation(rows: IInformationRow[], object: KIXObject): Promise<void> {
        const information: IInformationRow[] = [];
        if (Array.isArray(rows)) {
            for (const row of rows) {
                if (Array.isArray(row.values)) {
                    for (const info of row.values) {
                        if (Array.isArray(info.conditions)) {
                            const match = await FilterUtil.checkCriteriaByPropertyValue(info.conditions, object);
                            if (!match) {
                                continue;
                            }
                        }

                        const text = await PlaceholderService.getInstance().replacePlaceholders(info.text, object);
                        info.preparedText = text;

                        const link = await PlaceholderService.getInstance().replacePlaceholders(info.linkSrc, object);
                        info.preparedLinkSrc = link;

                        if (info.routingConfiguration) {
                            info.routingObjectId = await PlaceholderService.getInstance().replacePlaceholders(
                                info.routingObjectId
                            );
                        }

                        information.push(row);
                    }
                }
            }
        }

        this.state.information = information;
    }
}

module.exports = Component;
