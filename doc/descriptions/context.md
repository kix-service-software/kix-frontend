A context is container which load and hold objects which can be used by components. There are two different types of contexts.
* MainContext (general pages in agent portal, e.g. Ticket Dashboard, Ticket Details, CMDB Dashboard)
* DialogContext (dialogs in agent portal, e.g. New Ticket Dialog, Edit Ticket Dialog)

On the otherside the context needs a configuration which pretend which components are available at this context. This configuration contains different lists: 
* explorer
* sidebars
* content
* lanes
* overlays
* others
* dialogs

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

### Exmplae Configuration (Home Dashboard)
```typescript
new ContextConfiguration(
    this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
    this.getModuleId(),
    [
        new ConfiguredWidget('home-dashboard-notes-widget', 'home-dashboard-notes-widget') // Sidebar
    ],
    [], [],
    [ // Content
        new ConfiguredWidget(
            'home-dashboard-ticket-chart-widget-priorities',
            'home-dashboard-ticket-chart-widget-priorities',
            null, [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.SMALL
        ),
        new ConfiguredWidget(
            'home-dashboard-ticket-chart-widget-states', 'home-dashboard-ticket-chart-widget-states', null,
            [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.SMALL
        ),
        new ConfiguredWidget(
            'home-dashboard-ticket-chart-widget-new', 'home-dashboard-ticket-chart-widget-new', null,
            [new UIComponentPermission('tickets', [CRUD.READ])], WidgetSize.SMALL
        ),
        new ConfiguredWidget(
            'home-dashboard-myOpenTickets-widget', 'home-dashboard-myOpenTickets-widget', null,
            [new UIComponentPermission('tickets', [CRUD.READ])]
        ),
        new ConfiguredWidget(
            'home-dashboard-new-tickets-widget', 'home-dashboard-new-tickets-widget', null,
            [new UIComponentPermission('tickets', [CRUD.READ])]
        )
    ]
)
```
