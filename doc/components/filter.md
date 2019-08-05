#### Filter

##### Description
This component can be used as styled form inputs for filter task with a text input for string filtering and an optinal dropdown for predefined filter descriptions.

##### Tag
`<filter filterCount=state.filterCount on-filter("filter")/>`

##### Attributes

| Attribute                   | Required |           Type            | Value(s)                                                                                          |      Default      |
| --------------------------- | :------: | :-----------------------: | ------------------------------------------------------------------------------------------------- | :---------------: |
| predefinedFilter            | optional | KIXObjectPropertyFilter[] | predefined filter descriptions for the dropdown, if not given, no dropdown will be shonw          |
| disabled                    | optional |          boolean          | if `true` the inputs are not useable, e.g. to prevent changes when a filter operation is running  |      `false`      |
| icon                        | optional |          string           | should be a valid CSS-class of the kix-font                                                       | `kix-icon-filter` |
| showFilterCount             | optional |          boolean          | if `true` the value of `filterCount` (should be given) is shown in brackets after the filter icon |      `true`       |
| filterCount                 | optional |          string           | number of filtered elements                                                                       |
| predefinedFilterPlaceholder | optional |          string           | placeholder string in predefined filter dropdown                                                  |   `All Objects`   |
| placeholder                 | optional |          string           | placeholder string for the string filter input                                                    | `Filter in list`  |

##### Events

| Name   | Trigger                                                 | Parameter                                                     |
| :----- | :------------------------------------------------------ | ------------------------------------------------------------- |
| filter | text filter is entered or predefined filter is selected | textFilter: string, predefinedFilter: KIXObjectPropertyFilter |

##### Methods

| Name  | Purpose                                                                |
| :---- | :--------------------------------------------------------------------- |
| reset | resets filter (text filter and selected predefined filter are cleared) |
