/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ComponentInput } from './ComponentInput';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import {
    AdditionalContextInformation
} from '../../../../../modules/base-components/webapp/core/AdditionalContextInformation';
import { ContextMode } from '../../../../../model/ContextMode';
import { Context } from '../../../../../model/Context';
import { ObjectReferenceWidgetConfiguration } from '../../core/ObjectReferenceWidgetConfiguration';
import { ServiceRegistry } from '../../core/ServiceRegistry';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableFactoryService } from '../../core/table';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextType } from '../../../../../model/ContextType';
import { FormService } from '../../core/FormService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { IObjectReferenceHandler } from '../../core/IObjectReferenceHandler';
import { EventService } from '../../core/EventService';
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { IdService } from '../../../../../model/IdService';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { FormEvent } from '../../core/FormEvent';
import { FormValuesChangedEventData } from '../../core/FormValuesChangedEventData';

class Component {

    private state: ComponentState;

    private handler: IObjectReferenceHandler;
    private config: ObjectReferenceWidgetConfiguration;
    private loadTimeout: any;
    private listenerId: string;
    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        if (this.state.widgetConfiguration.configuration) {
            this.initWidget(context);
        }

        this.listenerId = IdService.generateDateBasedId('referenced-objects-widget');
        context.registerListener(this.listenerId, {
            additionalInformationChanged: () => null,
            explorerBarToggled: () => null,
            filteredObjectListChanged: () => null,
            objectListChanged: () => null,
            scrollInformationChanged: () => null,
            sidebarToggled: () => null,
            objectChanged: () => this.createObjectTable(context)
        });
    }

    public onDestroy(): void {
        const context = ContextService.getInstance().getActiveContext();
        context.unregisterListener(this.listenerId);
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    private async initWidget(context: Context): Promise<void> {
        this.config = this.state.widgetConfiguration.configuration;
        if (this.config && this.config.handlerId) {
            this.handler = ServiceRegistry.getObjectReferenceHandler(this.config.handlerId);
            if (this.handler) {
                this.createObjectTable(context);

                if (context.getDescriptor().contextMode === ContextMode.DETAILS) {
                    EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, {
                        eventSubscriberId: 'referenced-object-widget-' + this.handler.name,
                        eventPublished: () => {
                            this.createObjectTable(context);
                        }
                    });
                } else if (context.getDescriptor().contextType === ContextType.DIALOG) {
                    const formId = context.getAdditionalInformation(AdditionalContextInformation.FORM_ID);

                    this.formSubscriber = {
                        eventSubscriberId: IdService.generateDateBasedId('ReferencedObjectWidget'),
                        eventPublished: (data: FormValuesChangedEventData, eventId: string) => {
                            for (const cv of data.changedValues) {
                                if (this.handler.isPossibleFormField(cv[0], this.config.handlerConfiguration)) {
                                    if (this.loadTimeout) {
                                        window.clearTimeout(this.loadTimeout);
                                        this.loadTimeout = null;
                                    }

                                    this.loadTimeout = setTimeout(async () => {
                                        const object = await context.getObject();
                                        const objects = await this.handler.determineObjectsByForm(
                                            formId, object, this.config.handlerConfiguration
                                        );
                                        this.createTable(this.handler.objectType, objects);
                                        this.loadTimeout = null;
                                    }, 300);
                                }
                            }
                        }
                    };
                    EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
                }
            }
        }
    }

    private async createObjectTable(context: Context): Promise<void> {
        const object = await context.getObject();
        const objects = this.handler
            ? await this.handler.determineObjects(object, this.config.handlerConfiguration)
            : [];
        this.createTable(this.handler.objectType, objects);
    }

    private createTable(objectType: KIXObjectType, objects: KIXObject[]): void {
        this.state.table = null;

        setTimeout(async () => {
            const tableConfiguration = new TableConfiguration(
                null, null, null, objectType, null,
                null, this.config.tableColumns, [], false, null, null, null, 1.625, 1.625
            );

            const table = await TableFactoryService.getInstance().createTable(
                `object-reference-list-${objectType}`, objectType, tableConfiguration,
                null, undefined, true, false, false, true, true, objects
            );

            this.state.table = table;
        }, 10);

    }

}

module.exports = Component;
