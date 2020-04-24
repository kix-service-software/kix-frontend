The configuration is the base for main composition of components in the agent portal. Configurations are stored in the Sysconfig. There are different types of configurations possible:
```typescript
export enum ConfigurationType {
    Context = 'Context',
    Widget = 'Widget',
    TabWidget = 'TabWidget',
    TableWidget = 'TableWidget',
    HelpWidget = 'HelpWidget',
    Table = 'Table',
    TableColumn = 'TableColumn',
    Form = 'Form',
    FormPage = 'FormPage',
    FormGroup = 'FormGroup',
    FormField = 'FormField',
    Chart = 'Chart',
    ChartWidget = 'ChartWidget',
    ObjectInformation = 'ObjectInformation',
    ObjectReferenceWidget = 'ObjectReferenceWidget',
    Slider = 'Slider',
    LinkedObjects = 'LinkedObjects',
    MainMenu = 'MainMenu',
    Kanban = 'Kanban'
}
```
Each configuration type has specific options to configure. To add new configurations you have to register and implement a extension for the extension point `kix:configuration` (see: [Extensions Configuration](#kix_configuration)).

### Implementation
A configuration class has to implement the interface `IConfiguration`.

| parameter                   | description                                                                                       | exmaple                       |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------- |
| id                          | The id of the configuration (name of the Sysconfig option)                                        | `home-dashboard-notes-widget` |
| name                        | A name for the configuraton                                                                       | `Notes Widget`                |
| type                        | The type of the configuration (`ConfigurationType` or `string`)                                   | `Chart`                       |
| subConfigurationDefinition? | If the configuration has a subdefinition, this defines the reference (`ConfigurationDefinition`). |                               |
| configuration?              | The configuration itself.                                                                         | object `{ ... }`              |

```typescript
export interface IConfiguration {
    id: string;
    name: string;
    type: ConfigurationType | string;
    subConfigurationDefinition?: ConfigurationDefinition;
    configuration?: IConfiguration;
}

export class ConfigurationDefinition {
    public constructor(
        public configurationId: string,
        public configurationType: ConfigurationType
    ) { }
}
```

### Functionality

At the startup of the frontend server all extensions for the extension point `kix:configuration` are loaded and all provided configurations are collected. This list of configurations is sent to the backend via the `ClientRegistration`. The backend uses this list to create new or update existing sysconfig options.

After `ClientRegistration` process the frontend server loads all the configurations that belong to itself and buld up the configuration cache. This cache is required for context and form configurations. That means the server used all configurations of type `Context` and `Form` and resolves all configuration references and merged it to one Context or Form configuration.