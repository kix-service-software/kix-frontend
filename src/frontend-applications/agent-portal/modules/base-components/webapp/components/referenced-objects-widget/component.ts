/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
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

class Component {

    private state: ComponentState;

    private handler: IObjectReferenceHandler;
    private config: ObjectReferenceWidgetConfiguration;
    private object: KIXObject;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        if (this.state.widgetConfiguration.configuration) {
            this.initWidget(context);
        }
    }

    private async initWidget(context: Context): Promise<void> {
        this.config = this.state.widgetConfiguration.configuration;
        if (this.config && this.config.handlerId) {
            this.handler = ServiceRegistry.getObjectReferenceHandler(this.config.handlerId);
            if (this.handler) {
                this.object = await context.getObject();
                if (context.getDescriptor().contextMode === ContextMode.DETAILS) {
                    const objects = this.handler
                        ? await this.handler.determineObjects(this.object, this.config.handlerConfiguration)
                        : [];
                    this.createTable(this.handler.objectType, objects);
                } else if (context.getDescriptor().contextType === ContextType.DIALOG) {
                    this.formValueChanged(null, null, null);
                    const formId = context.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
                    FormService.getInstance().registerFormInstanceListener(formId, {
                        formListenerId: 'reference-object-widget-form-listener',
                        formValueChanged: this.formValueChanged.bind(this),
                        updateForm: () => null
                    });
                }
            }
        }
    }

    private async formValueChanged(
        formField: FormFieldConfiguration, value: FormFieldValue<any>, oldValue: any
    ): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formId = context.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
        const objects = await this.handler.determineObjectsByForm(
            formId, this.object, this.config.handlerConfiguration
        );
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

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }

}

module.exports = Component;
