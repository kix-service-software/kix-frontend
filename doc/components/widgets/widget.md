#### Widget

##### Tag
`<widget instanceId="widget-one">`
    `<@content>Some content</@content>`
`</widget>`

##### Attributes

| Attribute      |  Required  |          Type          | Value(s)                                                                                                                    | Default |
| -------------- | :--------: | :--------------------: | --------------------------------------------------------------------------------------------------------------------------- | :-----: |
| instanceId     |    yes     |         string         | the unique identifier of the widget instance (used to load configuration and to determine the widget type from the context) |
| content        |  optional  |   component template   | A template which should be rendered in the widget content.                                                                  |
| icon           |  optional  | string / KIXObjectType | The icon which is shown in the widget title (`kix-icon-ticket` or `new ObjectIcon(null, 'Priority', 3)`)                    |
| title          |  optional  |         string         | The title which is shown in the widget header.                                                                              |
| headerContent  |  optional  |   component template   | A template which should be rendered in the widget header next to the title.                                                 |
| headerFilter   |  optional  |   component template   | A template which should be rendered in the widget header at the place of the filter.                                        |
| minimizable    |  optional  |        boolean         | `true` or `false`                                                                                                           | `true`  |
| closable       |  optional  |        boolean         | `true` or `false` (mainly used in overlays)                                                                                 | `true`  |
| actions        |  optional  |       IAction[]        | A collection of actions which should be used in the widget header.                                                          |
| contentActions |  optional  |       IAction[]        | A collection of actions which should be used in the content part of the widget (e.g. lane actions, ticket details actions)  |
| contextType    |  optional  |      ContextType       | the of the context where the widget is used (`ContextType.MAIN` or `ContextType.DIALOG`)                                    |
| isDialog       | not needed |        boolean         | `true` or `false` (only used from the main dialog to add special style for dialogs)                                         | `false` |

##### Events

| Name             | Trigger                           | Parameter                   |
| :--------------- | :-------------------------------- | --------------------------- |
| closeWidget      | widget is closed                  |                             |
| minimizedChanged | minimze state is changed          | minimized: `true` / `false` |
| headerMousedown  | mouse down event on widget header | event: mousedown event      |

##### Examples