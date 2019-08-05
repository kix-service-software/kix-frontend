#### Table-Widget

##### Description
This is the base component for a widget with a table in the content.

##### Tag
`<table-widget/>`

##### Attributes

| Attribute      |  Required  |          Type           | Value(s)                                                                                                                    |
| -------------- | :--------: | :---------------------: | --------------------------------------------------------------------------------------------------------------------------- |
| instanceId     |    yes     |         String          | the unique identifier of the widget instance (used to load configuration and to determine the widget type from the context) |
| content        |  optional  |   component template    | A template which should be rendered in the widget content.                                                                  |
| icon           |  optional  | String or KIXObjectType | The icon which is shown in the widget title (`kix-icon-ticket` or `new ObjectIcon('Priority', 3)`)                          |
| title          |  optional  |         String          | The title which is shown in the widget header.                                                                              |
| headerContent  |  optional  |   component template    | A template which should be rendered in the widget header next to the title.                                                 |
| headerFilter   |  optional  |   component template    | A template which should be rendered in the widget header at the place of the filter.                                        |
| minimizable    |  optional  |         boolean         | `true` or `false`                                                                                                           |
| closable       |  optional  |         boolean         | `true` or `false` (mainly used in overlays)                                                                                 |
| actions        |  optional  |        IAction[]        | A collection of actions which should be used in the widget header.                                                          |
| contentActions |  optional  |        IAction[]        | A collection of actions which should be used in the content part of the widget (e.g. lane actions, ticket details actions)  |
| contextType    |  optional  |       ContextType       | the of the context where the widget is used (`ContextType.MAIN` or `ContextType.DIALOG`)                                    |
| explorer       | not needed |         boolean         | `true` or `false` (only used from the explorer bar to influence the minimize behavior of the widget.)                       |
| isDialog       | not needed |         boolean         | `true` or `false` (only used from the main dialog to add special style for dialogs)                                         |
