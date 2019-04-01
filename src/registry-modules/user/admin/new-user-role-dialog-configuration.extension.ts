import { IConfigurationExtension } from '../../../core/extensions';
import {
    ConfiguredWidget, FormField, KIXObjectType, Form,
    FormContext, FormFieldValue, RoleProperty, FormFieldOption, ObjectReferenceOptions, KIXObjectLoadingOptions,
    FilterCriteria, UserProperty, FilterDataType, FilterType
} from '../../../core/model';
import { FormGroup } from '../../../core/model/components/form/FormGroup';
import { ConfigurationService } from '../../../core/services';
import { NewUserRoleDialogContext, NewUserRoleDialogContextConfiguration } from '../../../core/browser/user';
import { SearchOperator } from '../../../core/browser';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewUserRoleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<NewUserRoleDialogContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new NewUserRoleDialogContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'new-user-role-form';
        const existing = configurationService.getModuleConfiguration(formId, null);
        if (!existing || overwrite) {
            const infoGroup = new FormGroup('Translatable#Role Information', [
                new FormField(
                    'Translatable#Name', RoleProperty.NAME, null, true,
                    'Translatable#Insert a role name.'
                ),
                new FormField(
                    'Translatable#Comment', RoleProperty.COMMENT, 'text-area-input', false,
                    'Translatable#Insert a comment for the role.', null, null, null, null, null, null, null, 250
                ),
                new FormField(
                    'Translatable#Validity', RoleProperty.VALID_ID, 'valid-input', true,
                    "Translatable#Set the role as „valid“, „invalid (temporarily)“, or „invalid“.",
                    null, new FormFieldValue(1)
                )
            ]);

            const permissionGroup = new FormGroup('Translatable#Permissions', [
                new FormField(
                    null, RoleProperty.PERMISSIONS, 'permissions-form-input', false, null
                )
            ]);

            const agentGroup = new FormGroup('Translatable#Agent Assignment', [
                new FormField(
                    'Translatable#Agents', RoleProperty.USER_IDS, 'object-reference-input', false,
                    'Translatable#Select which agents should be assigned to this role.', [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                        new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                        new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                        new FormFieldOption(ObjectReferenceOptions.LOADINGOPTIONS,
                            new KIXObjectLoadingOptions(
                                null, [
                                    new FilterCriteria(
                                        UserProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                                        FilterType.AND, 1
                                    )
                                ]
                            )
                        )
                    ]
                )
            ]);

            const form = new Form(
                formId, 'Translatable#New Role', [
                    infoGroup,
                    permissionGroup,
                    agentGroup
                ], KIXObjectType.ROLE
            );
            await configurationService.saveModuleConfiguration(form.id, null, form);
        }
        configurationService.registerForm([FormContext.NEW], KIXObjectType.ROLE, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
