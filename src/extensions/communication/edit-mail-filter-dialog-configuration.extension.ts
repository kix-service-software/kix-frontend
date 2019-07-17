import { IConfigurationExtension } from '../../core/extensions';
import { EditMailFilterDialogContext } from '../../core/browser/mail-filter';
import {
    ConfiguredWidget, FormField, FormFieldValue, MailFilterProperty, Form,
    KIXObjectType, FormContext, ContextConfiguration, FormFieldOption, FormFieldOptions, InputFieldTypes,
    KIXObjectProperty,
    WidgetConfiguration
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditMailFilterDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const filterHelpSidebar = new ConfiguredWidget('mail-filter-help-sidebar-widget', new WidgetConfiguration(
            'help-widget', null, [], {
                helpText: 'Translatable#Helptext_Admin_MailFilter_Sidebar'
            },
            false, false, 'kix-icon-query'
        ));

        const sidebars = [
            'mail-filter-help-sidebar-widget'
        ];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [
            filterHelpSidebar
        ];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-mail-filter-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const infoGroup = new FormGroup('Translatable#Email Filter Information', [
                new FormField(
                    'Translatable#Name', MailFilterProperty.NAME, null, true,
                    'Translatable#Helptext_Admin_MailFilterEdit_Name'
                ),
                new FormField(
                    'Translatable#Stop after match', MailFilterProperty.STOP_AFTER_MATCH, 'checkbox-input', true,
                    'Translatable#Helptext_Admin_MailFilterEdit_StopAfterMatch', undefined,
                    new FormFieldValue(false)
                ),
                new FormField(
                    'Translatable#Comment', KIXObjectProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Helptext_Admin_MailFilterEdit_Comment', null, null, null,
                    null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                    'Translatable#Helptext_Admin_MailFilterEdit_Validity',
                    null, new FormFieldValue(1)
                )
            ]);

            const matchGroup = new FormGroup('Translatable#Filter Conditions', [
                new FormField(
                    'Translatable#Filter Conditions', MailFilterProperty.MATCH, 'mail-filter-match-form-input', true,
                    'Translatable#Helptext_Admin_MailFilterEdit_FilterConditions', undefined, undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined, false
                )
            ]);

            const setGroup = new FormGroup('Translatable#Set Email Headers', [
                new FormField(
                    'Translatable#Set Email Headers', MailFilterProperty.SET, 'mail-filter-set-form-input', true,
                    'Translatable#Helptext_Admin_MailFilterEdit_SetEmailHeaders', undefined, undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined, false
                )
            ]);

            const form = new Form(
                formId, 'Translatable#Edit Email Filter', [
                    infoGroup, matchGroup, setGroup
                ], KIXObjectType.MAIL_FILTER, true, FormContext.EDIT
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.MAIL_FILTER, formId);
    }
}

module.exports = (data, host, options) => {
    return new Extension();
};
