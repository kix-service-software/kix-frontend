/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { NotificationProperty } from '../../../model/NotificationProperty';
import { NotificationService } from '../../core';
import { ArticleProperty } from '../../../../ticket/model/ArticleProperty';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { InputFieldTypes } from '../../../../../modules/base-components/webapp/core/InputFieldTypes';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { SearchService } from '../../../../search/webapp/core';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { IdService } from '../../../../../model/IdService';

class Component extends FormInputComponent<FilterCriteria[], ComponentState> {

    private listenerId: string;
    private formTimeout: any;
    private formSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        this.listenerId = IdService.generateDateBasedId('notification-input-filter-manager-listener');
        await this.setManager();
        await super.onMount();

        this.formSubscriber = {
            eventSubscriberId: 'NotificationInputFilter',
            eventPublished: async (data: FormValuesChangedEventData, eventId: string): Promise<void> => {
                await this.handleArticleProperties();
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);

        this.state.prepared = true;
    }

    private async handleArticleProperties(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        if (context && context.descriptor.contextType === ContextType.DIALOG) {
            const selectedEvents = context.getAdditionalInformation(NotificationProperty.DATA_EVENTS);
            const hasArticleEvent = selectedEvents
                ? await NotificationService.getInstance().hasArticleEvent(selectedEvents)
                : false;

            if (hasArticleEvent) {
                await this.addRequiredArticleProperties();
            } else {
                await this.unrequireArticleProperties();
            }

            const dynamicFormComponent = (this as any).getComponent('notification-dynamic-form');
            if (dynamicFormComponent) {
                dynamicFormComponent.updateValues();
            }

        }
    }

    private async setManager(): Promise<void> {
        this.state.manager.init();
        this.state.manager.reset(false);

        this.state.manager.registerListener(this.listenerId, () => {
            if (this.formTimeout) {
                clearTimeout(this.formTimeout);
            }
            this.formTimeout = setTimeout(async () => {
                let filterValues: FilterCriteria[] = [];
                if (await this.state.manager.hasDefinedValues()) {
                    const values = await this.state.manager.getEditableValues();
                    const searchDefinition = SearchService.getInstance().getSearchDefinition(KIXObjectType.TICKET);
                    filterValues = values.map((v) => searchDefinition.getFilterCriteria(v));
                }
                super.provideValue(filterValues, true);
            }, 200);
        });
    }

    private async addRequiredArticleProperties(): Promise<void> {
        const values = this.state.manager.getValues();

        const channelValue = values.find((v) => v.property === ArticleProperty.CHANNEL_ID);
        if (channelValue) {
            channelValue.required = true;
        } else {
            this.state.manager.setValue(
                new ObjectPropertyValue(ArticleProperty.CHANNEL_ID, null, null, [], true, true, KIXObjectType.ARTICLE)
            );
        }

        const senderTypeValue = values.find((v) => v.property === ArticleProperty.SENDER_TYPE_ID);
        if (senderTypeValue) {
            senderTypeValue.required = true;
        } else {
            this.state.manager.setValue(
                new ObjectPropertyValue(
                    ArticleProperty.SENDER_TYPE_ID, null, null, [], true, true, KIXObjectType.ARTICLE
                )
            );
        }
    }

    private async unrequireArticleProperties(): Promise<void> {
        const values = this.state.manager.getValues();

        const channelValue = values.find((v) => v.property === ArticleProperty.CHANNEL_ID);
        if (channelValue) {
            if (Array.isArray(channelValue.value) && channelValue.value.length) {
                channelValue.required = false;
            } else {
                this.state.manager.removeValue(channelValue);
            }
        }

        const senderTypeValue = values.find((v) => v.property === ArticleProperty.SENDER_TYPE_ID);
        if (senderTypeValue) {
            if (Array.isArray(senderTypeValue.value) && senderTypeValue.value.length) {
                senderTypeValue.required = false;
            } else {
                this.state.manager.removeValue(senderTypeValue);
            }
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.manager) {
            this.state.manager.unregisterListener(this.listenerId);
            this.state.manager.reset(false);
        }
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<any>(this.state.field?.instanceId);
        if (value && value.value) {

            // value is frontend filter criteria (set in dialog)
            if (Array.isArray(value.value)) {
                for (const criteria of value.value) {
                    await this.setCriteria(criteria);
                }
            } else if (typeof value.value === 'object') {
                // value is a backend filter criteria (with AND and OR - inital value)
                for (const filter in value.value) {
                    if (value.value[filter] && value.value[filter]) {
                        for (const criteria of value.value[filter]) {
                            await this.setCriteria(criteria, true);
                        }
                    }
                }
            }
        }
    }

    private async setCriteria(criteria: any, fromBackend?: boolean): Promise<void> {
        let objectType: KIXObjectType | string;
        const inputType = await this.state.manager.getInputType(fromBackend ? criteria.Field : criteria.property);
        if (inputType) {
            if (inputType === InputFieldTypes.OBJECT_REFERENCE) {
                objectType = await this.state.manager.getObjectReferenceObjectType(
                    fromBackend ? criteria.Field : criteria.property
                );
            }
        }

        const property = fromBackend ? criteria.Field : criteria.property;
        const filterValue = new ObjectPropertyValue(
            property,
            fromBackend ? criteria.Operator : criteria.operator,
            fromBackend ? criteria.Value : criteria.value,
            [], false, true, objectType, null, null,
            IdService.generateDateBasedId(property)
        );

        const isArticleProperty = filterValue.property === ArticleProperty.CHANNEL_ID
            || filterValue.property === ArticleProperty.SENDER_TYPE_ID;
        if (fromBackend && isArticleProperty) {
            filterValue.required = true;
        }
        this.state.manager.setValue(filterValue);
    }
}

module.exports = Component;
