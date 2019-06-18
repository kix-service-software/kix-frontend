import { IConfigurationExtension } from '../../core/extensions';
import { ContactDetailsContext } from '../../core/browser/contact';
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration, OrganisationProperty,
    DataType, KIXObjectType, ObjectinformationWidgetSettings, ContactProperty,
    KIXObjectProperty, CRUD, TabWidgetSettings
} from '../../core/model';
import {
    TableConfiguration, TableHeaderHeight, TableRowHeight, DefaultColumnConfiguration
} from '../../core/browser';
import { UIComponentPermission } from '../../core/model/UIComponentPermission';

export class ModuleFactoryExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return ContactDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const generalActions = ['contact-create-action'];

        const tabLane = new ConfiguredWidget('contact-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['contact-information-lane']))
        );

        const contactInfoLane =
            new ConfiguredWidget('contact-information-lane', new WidgetConfiguration(
                'object-information-widget', 'Translatable#Contact Information', [
                    'contact-edit-action', 'contact-print-action'
                ], new ObjectinformationWidgetSettings(KIXObjectType.CONTACT, [
                    ContactProperty.TITLE,
                    ContactProperty.LAST_NAME,
                    ContactProperty.FIRST_NAME,
                    ContactProperty.LOGIN,
                    ContactProperty.PRIMARY_ORGANISATION_ID,
                    ContactProperty.PHONE,
                    ContactProperty.MOBILE,
                    ContactProperty.FAX,
                    ContactProperty.EMAIL,
                    ContactProperty.STREET,
                    ContactProperty.ZIP,
                    ContactProperty.CITY,
                    ContactProperty.COUNTRY,
                    ContactProperty.COMMENT,
                    KIXObjectProperty.VALID_ID,
                    KIXObjectProperty.CREATE_BY,
                    KIXObjectProperty.CREATE_TIME,
                    KIXObjectProperty.CHANGE_BY,
                    KIXObjectProperty.CHANGE_TIME
                ]),
                false, true, null, false)
            );

        const assignedOrganisationsLane = new ConfiguredWidget('contact-assigned-organisations-widget',
            new WidgetConfiguration(
                'contact-assigned-organisations-widget', 'Translatable#Assigned Organisations', [
                    'contact-edit-action', 'contact-print-action'
                ], new TableConfiguration(KIXObjectType.ORGANISATION,
                    null, null,
                    [
                        new DefaultColumnConfiguration(
                            OrganisationProperty.NUMBER, true, false, true, true, 230, true, true
                        ),
                        new DefaultColumnConfiguration(
                            OrganisationProperty.NAME, true, false, true, true, 300, true, true
                        ),
                        new DefaultColumnConfiguration(
                            OrganisationProperty.COUNTRY, true, false, true, true, 175, true, true
                        ),
                        new DefaultColumnConfiguration(
                            OrganisationProperty.CITY, true, false, true, true, 175, true, true
                        ),
                        new DefaultColumnConfiguration(
                            OrganisationProperty.STREET, true, false, true, true, 250, true, true
                        ),
                        new DefaultColumnConfiguration(
                            OrganisationProperty.OPEN_TICKETS_COUNT, true, false, true, true, 150,
                            true, false, false, DataType.NUMBER
                        ),
                        new DefaultColumnConfiguration(
                            OrganisationProperty.ESCALATED_TICKETS_COUNT, true, false, true, true, 150,
                            true, false, false, DataType.NUMBER
                        ),
                        new DefaultColumnConfiguration(
                            OrganisationProperty.REMINDER_TICKETS_COUNT, true, false, true, true, 150,
                            true, false, false, DataType.NUMBER
                        ),
                    ], null, null, null, null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ),
                false, true, null, false
            ),
            [new UIComponentPermission('organisations', [CRUD.READ])]
        );

        const assignedTicketsLane = new ConfiguredWidget('contact-assigned-tickets-widget',
            new WidgetConfiguration(
                'contact-assigned-tickets-widget', 'Translatable#Overview Tickets', [
                    'contact-create-ticket-action', 'contact-print-action'
                ], {},
                false, true, null, false
            ),
            [new UIComponentPermission('tickets', [CRUD.READ])]
        );

        const lanes = [
            'contact-information-lane', 'contact-assigned-organisations-widget', 'contact-assigned-tickets-widget'
        ];

        const laneWidgets: Array<ConfiguredWidget<any>> = [
            tabLane, assignedOrganisationsLane, assignedTicketsLane, contactInfoLane
        ];

        const contactActions = [
            'contact-edit-action', 'contact-create-organisation-action', 'contact-create-ticket-action',
            'contact-create-ci-action', 'contact-print-action'
        ];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            lanes, laneWidgets,
            [], [],
            generalActions, contactActions
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new ModuleFactoryExtension();
};
