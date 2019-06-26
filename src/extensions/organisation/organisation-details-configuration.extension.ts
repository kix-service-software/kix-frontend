import { IConfigurationExtension } from '../../core/extensions';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, ContactProperty,
    DataType, KIXObjectType, OrganisationProperty, KIXObjectProperty, ObjectinformationWidgetSettings,
    CRUD, TabWidgetSettings, KIXObjectLoadingOptions
} from '../../core/model';
import { TableConfiguration, TableHeaderHeight, TableRowHeight, DefaultColumnConfiguration } from '../../core/browser';
import { OrganisationDetailsContext } from '../../core/browser/organisation';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class ModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return OrganisationDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const generalActions = ['organisation-create-action'];

        const tabLane = new ConfiguredWidget('organisation-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['organisation-information-lane']))
        );

        const organisationInfoLane = new ConfiguredWidget('organisation-information-lane',
            new WidgetConfiguration(
                'object-information-widget', 'Translatable#Organisation Information', [
                    'organisation-edit-action', 'organisation-print-action'
                ], new ObjectinformationWidgetSettings(KIXObjectType.ORGANISATION, [
                    OrganisationProperty.NAME,
                    OrganisationProperty.NUMBER,
                    OrganisationProperty.URL,
                    OrganisationProperty.STREET,
                    OrganisationProperty.ZIP,
                    OrganisationProperty.CITY,
                    OrganisationProperty.COUNTRY,
                    OrganisationProperty.COMMENT,
                    KIXObjectProperty.VALID_ID,
                    KIXObjectProperty.CREATE_BY,
                    KIXObjectProperty.CREATE_TIME,
                    KIXObjectProperty.CHANGE_BY,
                    KIXObjectProperty.CHANGE_TIME
                ]),
                false, true, null, false
            ),
            [new UIComponentPermission('organisations', [CRUD.READ])]
        );

        const assignedContactsLane = new ConfiguredWidget('organisation-assigned-contacts-widget',
            new WidgetConfiguration(
                'organisation-assigned-contacts-widget', 'Translatable#Assigned Contacts', [
                    'organisation-edit-action', 'organisation-print-action'
                ],
                new TableConfiguration(
                    KIXObjectType.CONTACT,
                    new KIXObjectLoadingOptions(
                        null, null, null,
                        [ContactProperty.TICKET_STATS], null
                    ),
                    null,
                    [
                        new DefaultColumnConfiguration(
                            ContactProperty.FIRST_NAME, true, false, true, true, 200, true, true
                        ),
                        new DefaultColumnConfiguration(
                            ContactProperty.LAST_NAME, true, false, true, true, 200, true, true
                        ),
                        new DefaultColumnConfiguration(
                            ContactProperty.EMAIL, true, false, true, true, 250, true, true
                        ),
                        new DefaultColumnConfiguration(
                            ContactProperty.LOGIN, true, false, true, true, 200, true, true
                        ),
                        new DefaultColumnConfiguration(
                            ContactProperty.OPEN_TICKETS_COUNT, true, false, true, true, 150,
                            true, false, false, DataType.NUMBER
                        ),
                        new DefaultColumnConfiguration(
                            ContactProperty.ESCALATED_TICKETS_COUNT, true, false, true, true, 150,
                            true, false, false, DataType.NUMBER
                        ),
                        new DefaultColumnConfiguration(
                            ContactProperty.REMINDER_TICKETS_COUNT, true, false, true, true, 150,
                            true, false, false, DataType.NUMBER
                        ),
                        new DefaultColumnConfiguration(
                            ContactProperty.CREATE_NEW_TICKET, true, false, false, true, 150,
                            false, false, false, DataType.STRING, false, 'create-new-ticket-cell'
                        )
                    ], null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                false, true, null, false
            ),
            [new UIComponentPermission('contacts', [CRUD.READ])]
        );

        const assignedTicketsLane = new ConfiguredWidget('organisation-assigned-tickets-widget',
            new WidgetConfiguration(
                'organisation-assigned-tickets-widget', 'Translatable#Overview Tickets', [
                    'organisation-create-ticket-action', 'organisation-print-action'
                ], {},
                false, true, null, false
            ),
            [new UIComponentPermission('tickets', [CRUD.READ])]
        );

        const lanes = [
            'organisation-details-tab-widget',
            'organisation-assigned-contacts-widget',
            'organisation-assigned-tickets-widget'
        ];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            tabLane, organisationInfoLane, assignedContactsLane, assignedTicketsLane
        ];

        const organisationActions = [
            'organisation-edit-action', 'organisation-create-contact-action', 'organisation-create-ticket-action',
            'organisation-create-ci-action', 'organisation-print-action'
        ];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            lanes, laneWidgets,
            [], [],
            generalActions, organisationActions
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};