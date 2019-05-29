#### Translation String

##### Description
This component can be used to translate given patterns in marko templates.

##### Tag
`<translation-string pattern="pattern" placeholders=[]/>`

##### Attributes

| Attribute    | Required |   Type   |                           Value(s) |
| ------------ | :------: | :------: | ---------------------------------: |
| pattern      |   yes    |  String  |   the base pattern for translation |
| placeholders | optional | String[] | variables for pattern placeholders |

##### Examples

`<translation-string pattern="This is a text to translate"/>`

`<translation-string pattern="This is a {0} to {1}" placeholders=['text', 'translate']/>`