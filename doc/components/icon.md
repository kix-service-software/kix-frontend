#### Icon

##### Description
This component can be used to display an icon / small image

##### Tag
`<icon icon=state.icon showUnknown=true/>`

##### Attributes

| Attribute   | Required |        Type         | Value(s)                                                                                                                                   | Default |
| ----------- | :------: | :-----------------: | ------------------------------------------------------------------------------------------------------------------------------------------ | :-----: |
| icon        |   yes    | ObjectIcon / string | icon which should be shown, as `string` it should be a valid CSS-class of the kix-font                                                     |
| showUnknown | optional |       boolean       | only used if `icon` is an `ObjectIcon`, if `true` and no data for icon can be determined an default icon (`kix-icon-unknown`) will be used | `false` |
