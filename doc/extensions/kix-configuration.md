This extension point can be used to provide **new** configurations for the agent portal.

## Registration
```json
{
    "name": "My-Plugin",
    "extensions": {
        "kix:configuration": {
            "my-plugin-configuration": {
                "module": "my-plugin-configuration.extension"
            }
        }
    }
}
```

## Implementation - IConfigurationExtension

| function                  | description                           |
| ------------------------- | ------------------------------------- |
| getDefaultConfiguration() | returns an array of `IConfiguration`. |
| getFormConfigurations()   | returns an array of `IConfiguration`. |

```typescript
export interface IConfigurationExtension {

    getDefaultConfiguration(): Promise<IConfiguration[]>;

    getFormConfigurations(): Promise<IConfiguration[]>;

}
```

### Example:
For detailed information about Context and Form configuration implementation see:
* [Context Configuration](#context_configuration)
* [Form Configuration](#form_configuration)

```typescript
class Extension extends KIXExtension implements IConfigurationExtension {
    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        
        const widgetConfig = new WidgetConfiguration(
            'my-widget', 'My Widget', ConfigurationType.Widget,
            'my-widget-component', 'Translatable#My Widget', ['my-widget-action'], null, null,
            false, false, 'kix-icon-check'
        );
        configurations.push(widgetConfig);
        
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'my-object-edit-form';
        const configurations = [];

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit My Object',
                [],
                'MyObject', true, FormContext.EDIT, null,
                [
                    new FormPageConfiguration(
                        'my-object-edit-form-page', 'Translatable#Edit My Object',
                        [], true, false,
                        [
                            new FormGroupConfiguration(
                                'my-object-edit-form-group-data', 'Translatable#My Object Data',
                                [], null,
                                [
                                    new FormFieldConfiguration(
                                        'my-object-edit-form-field-name',
                                        'Translatable#Name', 'Name', null, true,
                                        'Translatable#Helptext_Admin_MyObject_Edit_Name'
                                    ),
                                ]
                            )
                        ]
                    )
                ]
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], 'MyObject', formId);

        return configurations;
}
```