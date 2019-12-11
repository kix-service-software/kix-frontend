/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { TableEvent, TableFactoryService, TableEventData } from '../../../../base-components/webapp/core/table';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { LinkUtil } from '../../core';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { Link } from '../../../model/Link';

class Component extends AbstractMarkoComponent<ComponentState> {

    private tableSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('linked-object-group', WidgetType.GROUP);
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('kix-object-linked-objects-widget', {
            objectChanged: (id: string | number, object: KIXObject, type: KIXObjectType) => {
                this.initWidget(object);
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: () => { return; }
        });

        await this.initWidget(await context.getObject<KIXObject>());
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        if (this.state.widgetConfiguration.configuration) {
            const linkedObjectTypes: Array<[string, KIXObjectType]> =
                this.state.widgetConfiguration.configuration.linkedObjectTypes;
            for (const lot of linkedObjectTypes) {
                TableFactoryService.getInstance().destroyTable(`link-objects-${lot[1]}`);
            }
        }
    }

    private async initWidget(kixObject?: KIXObject): Promise<void> {
        this.state.kixObject = kixObject;
        this.setActions();
        this.state.linkedObjectGroups = null;
        await this.prepareLinkedObjectsGroups();
    }

    private async setActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.kixObject) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.kixObject]
            );
        }
    }

    private async prepareLinkedObjectsGroups(): Promise<void> {
        const linkedObjectGroups = [];
        if (this.state.widgetConfiguration.configuration) {
            const linkedObjectTypes: Array<[string, KIXObjectType]> =
                this.state.widgetConfiguration.configuration.linkedObjectTypes;

            let objectsCount = 0;
            for (const lot of linkedObjectTypes) {
                const objectLinks = this.state.kixObject.Links.filter((link) => this.checkLink(link, lot[1]));

                const linkDescriptions = await LinkUtil.getLinkDescriptions(this.state.kixObject, objectLinks);

                const tableConfiguration = new TableConfiguration(null, null, null,
                    null, null, null, null, [], false, false, null, null,
                    TableHeaderHeight.SMALL, TableRowHeight.SMALL
                );

                const objects = linkDescriptions.map((ld) => ld.linkableObject);
                const table = await TableFactoryService.getInstance().createTable(
                    `link-objects-${lot[1]}`, lot[1], tableConfiguration,
                    objects.map((o) => o.ObjectId), null, true, null, true, false, true
                );
                if (table) {
                    table.addColumns([
                        TableFactoryService.getInstance().getDefaultColumnConfiguration(lot[1], 'LinkedAs')
                    ]);

                    objectsCount += objects.length;
                    const groupTitle = await TranslationService.translate(lot[0]);
                    const title = `${groupTitle} (${objects.length})`;

                    linkedObjectGroups.push([title, table, objects.length, linkDescriptions]);
                }
            }

            this.state.linkedObjectGroups = linkedObjectGroups;

            const text = await TranslationService.translate(this.state.widgetConfiguration.title, []);
            this.state.title = `${text} (${objectsCount})`;
            this.initTableSubscriber();
        }
    }

    private initTableSubscriber(): void {
        this.tableSubscriber = {
            eventSubscriberId: 'linked-objects-widget',
            eventPublished: (data: TableEventData, eventId: string) => {
                const group = data && this.state.linkedObjectGroups ? this.state.linkedObjectGroups.find(
                    (g) => g[1].getTableId() === data.tableId
                ) : null;
                if (group) {
                    if (eventId === TableEvent.TABLE_READY) {
                        const values = group[3].map((ld) => {
                            const name = ld.linkTypeDescription.asSource
                                ? ld.linkTypeDescription.linkType.SourceName
                                : ld.linkTypeDescription.linkType.TargetName;

                            const value: [any, [string, any]] = [ld.linkableObject, ['LinkedAs', name]];
                            return value;
                        });
                        if (!!values.length) {
                            group[1].setRowObjectValues(values);
                        }
                    }
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
    }

    public setGroupMinimizedStates(): void {
        setTimeout(() => {
            this.state.linkedObjectGroups.forEach((log, index) => {
                const widgetComponent = (this as any).getComponent('linked-object-group-' + index);
                if (widgetComponent && !log[2]) {
                    widgetComponent.setMinizedState(true);
                }
            });

            setTimeout(() => this.state.setMinimizedState = false, 100);
        }, 100);
    }

    private checkLink(link: Link, objectType: KIXObjectType): boolean {
        const objectId = this.state.kixObject.ObjectId.toString();
        const rootObjectType = this.state.kixObject.KIXObjectType;

        // source or target object have to be of relevant 'objectType'
        // AND this object should not be the root object: other type OR at least id
        // tslint:disable-next-line:max-line-length
        // FIXME: Refactoring: http://git.intra.cape-it.de/Softwareentwicklung/KIXng/frontend/app/merge_requests/1934#note_63255
        return (link.SourceObject === objectType &&
            (link.SourceObject !== rootObjectType || link.SourceKey !== objectId)
        ) || (link.TargetObject === objectType &&
            (link.TargetObject !== rootObjectType || link.TargetKey !== objectId)
            );

    }

}

module.exports = Component;