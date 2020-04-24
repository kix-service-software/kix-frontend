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