The `ContextConfiguration` is specific implementation of `IConfiguration` (see: [Implementation - IConfiguration](#implementation-iconfiguration)).

| parameter      | description | exmaple |
| -------------- | ----------- | ------- |
| id             |             |         |
| name           |             |         |
| type           |             |         |
| contextId      |             |         |
| sidebars       |             |         |
| explorer       |             |         |
| lanes          |             |         |
| content        |             |         |
| generalActions |             |         |
| actions        |             |         |
| overlays       |             |         |
| others         |             |         |
| dialogs        |             |         |

```typescript
export class ContextConfiguration implements IConfiguration {

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public contextId: string,
        public sidebars: ConfiguredWidget[] = [],
        public explorer: ConfiguredWidget[] = [],
        public lanes: ConfiguredWidget[] = [],
        public content: ConfiguredWidget[] = [],
        public generalActions: string[] = [],
        public actions: string[] = [],
        public overlays: ConfiguredWidget[] = [],
        public others: ConfiguredWidget[] = [],
        public dialogs: ConfiguredDialogWidget[] = []
    ) { }

}
```


### Implementation - ConfiguredWidget
This list are arrays of type `ConfiguredWidget` or for dialogs type of `ConfiguredDialogWidget`.

| parameter       | description                                                                                                     | exmaple                       |
| --------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| instanceId      | The id of the concrete instance for usage of this widget                                                        | `home-dashboard-notes-widget` |
| configurationId | The id of the referenced configuration                                                                          | `home-dashboard-notes-widget` |
| configuration?  | The configuration if not referenced by id                                                                       | Object: `{ ... }`             |
| permissions     | Permissions for the widget. If the user has insufficient rights the widget ist filtered out on context loading. |                               |

```typescript
export class ConfiguredWidget {
    public constructor(
        public instanceId: string,
        public configurationId: string, 
        public configuration?: WidgetConfiguration, 
        public permissions: UIComponentPermission[] = [] 
    ) { }
}
```