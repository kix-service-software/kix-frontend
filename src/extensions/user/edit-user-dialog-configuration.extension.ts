import { IConfigurationExtension } from '../../core/extensions';
import {
    ConfiguredWidget, FormField, KIXObjectType, Form,
    FormContext, FormFieldValue, FormFieldOption, UserProperty,
    FormFieldOptions, InputFieldTypes, ObjectReferenceOptions, ContextConfiguration, KIXObjectLoadingOptions,
    FilterCriteria, RoleProperty, FilterDataType, FilterType, KIXObjectProperty, PersonalSettingsProperty, QueueProperty
} from '../../core/model';
import { FormGroup } from '../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../core/services';
import { EditUserDialogContext } from '../../core/browser/user';
import { SearchOperator } from '../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditUserDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-user-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const infoFields: FormField[] = [
                new FormField(
                    'Translatable#Title', UserProperty.USER_TITLE, null, false,
                    'Translatable#Insert a title for the user.'
                ),
                new FormField(
                    'Translatable#First Name', UserProperty.USER_FIRSTNAME, null, true,
                    'Translatable#Insert the firstname of the user.'
                ),
                new FormField(
                    'Translatable#Last Name', UserProperty.USER_LASTNAME, null, true,
                    'Translatable#Insert the lastname of the user.'
                ),
                new FormField(
                    'Translatable#Login Name', UserProperty.USER_LOGIN, null, true,
                    'Translatable#Insert a login for the user.'
                ),
                new FormField(
                    'Translatable#Password', UserProperty.USER_PASSWORD, null, false,
                    'Translatable#Set a password for the user.',
                    [
                        new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.PASSWORD)
                    ], null, null, null, null, null, null, null, null, null, null, null, null,
                    'Translatable#not modified'
                ),
                new FormField(
                    'Translatable#Phone', UserProperty.USER_PHONE, null, false,
                    'Translatable#Insert a phone number for the user.'
                ),
                new FormField(
                    'Translatable#Mobile', UserProperty.USER_MOBILE, null, false,
                    'Translatable#Insert a mobile number for the user.'
                ),
                new FormField(
                    'Translatable#Email', UserProperty.USER_EMAIL, null, true,
                    'Translatable#Insert the email address for the user.'
                ),
                new FormField(
                    'Translatable#Comment', UserProperty.USER_COMMENT, 'text-area-input', false,
                    'Translatable#Insert a comment for the user.', null, null, null, null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', KIXObjectProperty.VALID_ID, 'valid-input', true,
                    "Translatable#Set the user as „valid“, „invalid (temporarily)“, or „invalid“.",
                    null, new FormFieldValue(1)
                )
            ];
            const infoGroup = new FormGroup('Translatable#Agent Information', infoFields);

            const roleField = new FormField(
                'Translatable#Roles', UserProperty.ROLEIDS, 'object-reference-input', false,
                'Translatable#Assign the roles for the user.', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.ROLE),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    RoleProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                    FilterType.AND, 1
                                )
                            ]
                        )
                    )
                ]
            );
            const roleGroup = new FormGroup('Translatable#Role Assignment', [roleField]);

            const languageField = new FormField(
                'Translatable#Language', PersonalSettingsProperty.USER_LANGUAGE, 'language-input',
                false, 'Translatable#Helptext_Admin_UserEdit_Preferences_Language', null
            );
            const myQueuesField = new FormField(
                'Translatable#My Queues', PersonalSettingsProperty.MY_QUEUES, 'object-reference-input',
                false, 'Translatable#Helptext_Admin_UserEdit_Preferences_MyQueues', [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.QUEUE),
                    new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                    new FormFieldOption(ObjectReferenceOptions.AS_STRUCTURE, true),
                    new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                        new KIXObjectLoadingOptions(
                            [
                                new FilterCriteria(
                                    QueueProperty.PARENT_ID, SearchOperator.EQUALS,
                                    FilterDataType.STRING, FilterType.AND, null
                                )
                            ], undefined, undefined, [QueueProperty.SUB_QUEUES], [QueueProperty.SUB_QUEUES]
                        )
                    )
                ]
            );
            const settingsGroup = new FormGroup('Translatable#Preferences', [languageField, myQueuesField]);

            const form = new Form(
                formId, 'Translatable#New Agent', [infoGroup, roleGroup, settingsGroup], KIXObjectType.USER,
                true, FormContext.EDIT
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.USER, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
