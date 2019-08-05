#### Editor

##### Description
This component can be used as a form input with rich text support.

##### Tag
`<editor resize=true value=currentValue on-valueChanged('valueChanged') required=true simple=true/>`

##### Attributes

| Attribute        | Required |      Type       | Value(s)                                                                                                                             |  Default   |
| ---------------- | :------: | :-------------: | ------------------------------------------------------------------------------------------------------------------------------------ | :--------: |
| inline           | optional |     boolean     | if editor should be used as inline editor (toolbar is only shown if editor is focused)                                               |  `false`   |
| simple           | optional |     boolean     | if `true` editor has a reduced toolbar                                                                                               |  `false`   |
| readOnly         | optional |     boolean     | if `true` editor is readonly, no changes are possible                                                                                |  `false`   |
| invalid          | optional |     boolean     | mainly used to show that the form field validation responded with an error for the editor value (e.g. no value if field is required) |  `false`   |
| resize           | optional |     boolean     | if `true` editor is resizable                                                                                                        |   `true`   |
| resizeDir        | optional |     string      | direction for resizing (only used if `resize` is `true`), possible are `both`, `vertical` and `horizontal`                           | `vertical` |
| useReadonlyStyle | optional |     boolean     | if `true` editor is looks like readonly, but *is not* readonly, changes are possible                                                 |  `false`   |
| value            | optional |     string      | string (html) which is used to set/replace editor content (is ignored if `addValue` is given)                                        |            |
| addValue         | optional |     string      | string (html) which will be added at the end of current editor content                                                               |  `false`   |
| inlineContent    | optional | InlineContent[] | used to replace specific placeholders in value string (mainly for images)                                                            |            |

##### Events

| Name         | Trigger                 | Parameter                            |
| :----------- | :---------------------- | ------------------------------------ |
| valueChanged | value of editor changed | value: value of editor (html string) |
