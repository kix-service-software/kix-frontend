/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { JobProperty } from '../../../model/JobProperty';
import { JobFormService, JobService } from '../../core';
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

class Component extends FormInputComponent<{}, ComponentState> {

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
        this.listenerId = 'job-input-filter-manager-listener';
        await this.setManager();
        await super.onMount();

        this.formSubscriber = {
            eventSubscriberId: 'JobInputFilter',
            eventPublished: async (data: FormValuesChangedEventData, eventId: string) => {
                const jobTypeValue = data.changedValues.find((cv) => cv[0] && cv[0].property === JobProperty.TYPE);
                if (jobTypeValue) {
                    this.setManager();
                    await this.setCurrentValue();
                }

                const eventValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === JobProperty.EXEC_PLAN_EVENTS
                );
                if (eventValue) {
                    const context = ContextService.getInstance().getActiveContext();
                    if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                        const selectedEvents = context.getAdditionalInformation(JobProperty.EXEC_PLAN_EVENTS);
                        const hasArticleEvent = selectedEvents
                            ? await JobService.getInstance().hasArticleEvent(selectedEvents)
                            : false;

                        if (hasArticleEvent) {
                            await this.addRequiredArticleProperties();
                        } else {
                            await this.removeArticleProperties();
                        }

                        const dynamicFormComponent = (this as any).getComponent('job-filter-dynamic-form');
                        if (dynamicFormComponent) {
                            dynamicFormComponent.updateValues();
                        }

                    }
                }
            }
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);

        this.state.prepared = true;
    }

    private async setManager(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const type = typeValue && typeValue.value ? typeValue.value : null;

        const jobFormManager = JobFormService.getInstance().getJobFormManager(type);

        this.state.manager = jobFormManager ? jobFormManager.filterManager : null;
        if (this.state.manager) {
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
        }
        EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
    }

    public async setCurrentValue(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<any>(this.state.field.instanceId);
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

    private async setCriteria(criteria: any, fromBackend?: boolean) {
        let objectType: KIXObjectType | string;
        const inputType = await this.state.manager.getInputType(fromBackend ? criteria.Field : criteria.property);
        if (inputType) {
            if (inputType === InputFieldTypes.OBJECT_REFERENCE) {
                objectType = await this.state.manager.getObjectReferenceObjectType(
                    fromBackend ? criteria.Field : criteria.property
                );
            }
        }

        const filterValue = new ObjectPropertyValue(
            fromBackend ? criteria.Field : criteria.property,
            fromBackend ? criteria.Operator : criteria.operator,
            fromBackend ? criteria.Value : criteria.value,
            [], false, true, objectType, null, null,
            fromBackend ? criteria.Field : criteria.property
        );
        if (
            fromBackend
            && (
                filterValue.property === ArticleProperty.CHANNEL_ID
                || filterValue.property === ArticleProperty.SENDER_TYPE_ID
            )
        ) {
            filterValue.required = true;
        }
        this.state.manager.setValue(filterValue);
    }
}

module.exports = Component;
