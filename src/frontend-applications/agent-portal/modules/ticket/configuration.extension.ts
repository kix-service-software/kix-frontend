/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { TicketContext } from './webapp/core';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { KIXObjectPropertyFilter } from '../../model/KIXObjectPropertyFilter';
import { UIFilterCriterion } from '../../model/UIFilterCriterion';
import { TicketProperty } from './model/TicketProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ConfigurationDefinition } from '../../model/configuration/ConfigurationDefinition';
import { TableConfiguration } from '../../model/configuration/TableConfiguration';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';
import { TableHeaderHeight } from '../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../model/configuration/TableRowHeight';
import { TableWidgetConfiguration } from '../../model/configuration/TableWidgetConfiguration';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredWidget } from '../../model/configuration/ConfiguredWidget';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';
import { WidgetSize } from '../../model/configuration/WidgetSize';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { SearchProperty } from '../search/model/SearchProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';
import { ToggleOptions } from '../table/model/ToggleOptions';
import { KIXExtension } from '../../../../server/model/KIXExtension';

export class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return TicketContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        // Explorer
        const queueExplorerConfig = new WidgetConfiguration(
            'ticket-dashboard-queue-explorer', 'Ticket Queue Explorer', ConfigurationType.Widget,
            'ticket-queue-explorer', 'Translatable#Queues', [], null,
            null, false, true
        );
        configurations.push(queueExplorerConfig);

        const predefinedTicketFilter = [
            new KIXObjectPropertyFilter('Translatable#owned by me', [
                new UIFilterCriterion(TicketProperty.OWNER_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER)
            ]),
            new KIXObjectPropertyFilter('Translatable#Watched Tickets', [
                new UIFilterCriterion(
                    TicketProperty.WATCHERS, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER, true
                )
            ]),
            new KIXObjectPropertyFilter('Translatable#Unlocked Tickets', [
                new UIFilterCriterion(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 1)
            ]),
            new KIXObjectPropertyFilter('Translatable#Locked Tickets', [
                new UIFilterCriterion(TicketProperty.LOCK_ID, SearchOperator.EQUALS, 2)
            ]),
            new KIXObjectPropertyFilter('Translatable#responsibility by me', [
                new UIFilterCriterion(
                    TicketProperty.RESPONSIBLE_ID, SearchOperator.EQUALS, KIXObjectType.CURRENT_USER
                )
            ]),
        ];

        // content

        const tableConfig = new TableConfiguration(
            'ticket-dashboard-table-config', 'Ticket Dashboard Table Configuration', ConfigurationType.Table,
            KIXObjectType.TICKET, null,
            null, null, [], true, true,
            new ToggleOptions('ticket-article-details', 'article', [], true),
            null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
        );
        configurations.push(tableConfig);

        const tableWidgetConfig = new TableWidgetConfiguration(
            'ticket-dashboard-table-widget-settings', 'Ticket Table Widget Settings', ConfigurationType.TableWidget,
            KIXObjectType.TICKET, null,
            new ConfigurationDefinition('ticket-dashboard-table-config', ConfigurationType.Table), null,
            null, false, null, predefinedTicketFilter
        );
        configurations.push(tableWidgetConfig);

        const ticketListConfig = new WidgetConfiguration(
            'ticket-dashboard-ticket-list-widget', 'Ticket List Widget', ConfigurationType.Widget,
            'table-widget', 'Translatable#Overview Tickets',
            [
                'bulk-action', 'ticket-bulk-print-action', 'csv-export-action'
            ],
            new ConfigurationDefinition('ticket-dashboard-table-widget-settings', ConfigurationType.TableWidget),
            null, false, false, 'kix-icon-ticket', true
        );
        configurations.push(ticketListConfig);

        const contextConfig = new ContextConfiguration(
            this.getModuleId(), 'Ticket Dashboard Configuration', ConfigurationType.Context,
            this.getModuleId(),
            [],
            [
                new ConfiguredWidget(
                    'ticket-dashboard-queue-explorer', 'ticket-dashboard-queue-explorer', null,
                    [
                        new UIComponentPermission('tickets', [CRUD.READ]),
                        new UIComponentPermission('system/ticket/queues', [CRUD.READ])
                    ]
                )
            ], [],
            [
                new ConfiguredWidget(
                    'ticket-dashboard-ticket-list-widget', 'ticket-dashboard-ticket-list-widget', null,
                    [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.LARGE
                )
            ]
        );
        contextConfig.tableWidgetInstanceIds = [[KIXObjectType.TICKET, 'ticket-dashboard-ticket-list-widget']];
        configurations.push(contextConfig);

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'ticket-link-form';

        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-fulltext',
                'Translatable#Full Text', SearchProperty.FULLTEXT, null, false,
                'Translatable#Helptext_Tickets_Link_FullText'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-ticket-number',
                'Translatable#Ticket Number', TicketProperty.TICKET_NUMBER, null, false,
                'Translatable#Helptext_Tickets_Link_Number')
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-title',
                'Translatable#Title', TicketProperty.TITLE, null, false, 'Translatable#Helptext_Tickets_Link_Title'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-type',
                'Translatable#Type', TicketProperty.TYPE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_Link_Type',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_TYPE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-queue',
                'Translatable#Assign Team / Queue', TicketProperty.QUEUE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_Link_Queue',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-priority',
                'Translatable#Priority', TicketProperty.PRIORITY_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_Link_Priority',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_PRIORITY),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'ticket-link-form-field-state',
                'Translatable#State', TicketProperty.STATE_ID, 'object-reference-input', false,
                'Translatable#Helptext_Tickets_Link_State',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'ticket-link-form-group-attributes',
                'Translatable#Ticket Attributes',
                [
                    'ticket-link-form-field-fulltext',
                    'ticket-link-form-field-ticket-number',
                    'ticket-link-form-field-title',
                    'ticket-link-form-field-type',
                    'ticket-link-form-field-queue',
                    'ticket-link-form-field-priority',
                    'ticket-link-form-field-state'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'ticket-link-form-page', 'Translatable#Link to ticket',
                ['ticket-link-form-group-attributes']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Link to ticket',
                ['ticket-link-form-page'],
                KIXObjectType.TICKET, false, FormContext.LINK
            )
        );

        ModuleConfigurationService.getInstance().registerForm([FormContext.LINK], KIXObjectType.TICKET, formId);
        return configurations;
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
