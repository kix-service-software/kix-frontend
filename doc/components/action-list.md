#### Action List

##### Description
This component can be used to display a list of action as a styled list element, e.g. in widget headers.

##### Tag
`<action-list contextInstanceId=input.contextInstanceId list=actions instanceId=state.instanceId displayText=true/>`

##### Attributes

| Attribute   | Required |   Type    | Value(s)                                                                                                                                    | Default |
| :---------- | :------: | :-------: | ------------------------------------------------------------------------------------------------------------------------------------------- | :-----: |
| list        |   yes    | IAction[] | a collection of actions                                                                                                                     |
| instanceId  | optional |  string   | unique identifier of the binding widget, used to register this component as listener for it (if actions are changable, e.g. runnable state) |
| displayText | optional |  boolean  | if labels of actions should be shown                                                                                                        | `true`  |
