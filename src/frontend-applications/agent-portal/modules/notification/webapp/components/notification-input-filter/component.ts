/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { NotificationProperty } from '../../../model/NotificationProperty';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { NotificationService } from '../../core';
import { ArticleProperty } from '../../../../ticket/model/ArticleProperty';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { InputFieldTypes } from '../../../../../modules/base-components/webapp/core/InputFieldTypes';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';

class Component extends FormInputComponent<Array<[string, string[] | number[]]>, ComponentState> {

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
        this.listenerId = 'notification-input-filter-manager-listener';
        this.state.manager.reset(false);
        this.state.manager.init();
        await super.onMount();

        this.formSubscriber = {
            eventSubscriberId: 'NotificationInputFilter',
            eventPublished: async (data: FormValuesChangedEventData, eventId: string) => {
                const eventValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === NotificationProperty.DATA_EVENTS
                );
                const context = ContextService.getInstance().getActiveContext();
                if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                    const selectedEvents = context.getAdditionalInformation(NotificationProperty.DATA_EVENTS);
                    const hasArticleEvent = selectedEvents
                        ? await NotificationService.getInstance().hasArticleEvent(selectedEvents)
                        : false;

                    if (hasArticleEvent) {
                        await this.addRequiredArticleProperties();
                    } else {
                        await this.removeArticleProperties();
                    }

                    const dynamicFormComponent = (this as any).getComponent('notification-dynamic-form');
                    if (dynamicFormComponent) {
                        dynamicFormComponent.updateValues();
                    }
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);

        this.state.manager.registerListener(this.listenerId, () => {
            if (this.formTimeout) {
                clearTimeout(this.formTimeout);
            }
            this.formTimeout = setTimeout(async () => {
                const filterValues: Array<[string, string[] | number[]]> = [];
                if (await this.state.manager.hasDefinedValues()) {
                    const values = await this.state.manager.getEditableValues();
                    values.forEach((v) => {
                        if (v.value !== null) {
                            filterValues.push([v.property, v.value]);
                        }
                    });
                }
                super.provideValue(filterValues);
            }, 200);
        });

        this.state.prepared = true;
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue(this.state.field.instanceId);
        if (value && Array.isArray(value.value)) {
            for (const v of value.value) {
                let objectType;
                const inputType = await this.state.manager.getInputType(v[0]);
                if (inputType && inputType === InputFieldTypes.OBJECT_REFERENCE) {
                    objectType = await this.state.manager.getObjectReferenceObjectType(v[0]);
                }

                const isRequired = this.isRequiredProperty(v[0]);
                objectType = isRequired ? KIXObjectType.ARTICLE : objectType;
                this.state.manager.setValue(
                    new ObjectPropertyValue(
                        v[0], null, v[1], isRequired, true, objectType, null, null, v[0]
                    ),
                    true
                );
            }
        }
    }

    private async addRequiredArticleProperties(): Promise<void> {
        const values = this.state.manager.getValues();
        const channelValue = values.find((v) => v.property === ArticleProperty.CHANNEL_ID);

        if (channelValue) {
            channelValue.required = true;
        } else {
            this.state.manager.setValue(
                new ObjectPropertyValue(ArticleProperty.CHANNEL_ID, null, null, true, true, KIXObjectType.ARTICLE)
            );
        }

        const senderTypeValue = values.find((v) => v.property === ArticleProperty.SENDER_TYPE_ID);
        if (senderTypeValue) {
            senderTypeValue.required = true;
        } else {
            this.state.manager.setValue(
                new ObjectPropertyValue(ArticleProperty.SENDER_TYPE_ID, null, null, true, true, KIXObjectType.ARTICLE)
            );
        }
    }

    private async removeArticleProperties(): Promise<void> {
        const values = this.state.manager.getValues();
        if (values) {
            const articleValues = values.filter((v) => {
                return v.property === ArticleProperty.SENDER_TYPE_ID
                    || v.property === ArticleProperty.CHANNEL_ID
                    || v.property === ArticleProperty.TO
                    || v.property === ArticleProperty.CC
                    || v.property === ArticleProperty.FROM
                    || v.property === ArticleProperty.SUBJECT
                    || v.property === ArticleProperty.BODY;
            });
            for (const av of articleValues) {
                await this.state.manager.removeValue(av);
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

    private isRequiredProperty(property: string): boolean {
        return property === ArticleProperty.CHANNEL_ID || property === ArticleProperty.SENDER_TYPE_ID;
    }

}

module.exports = Component;
