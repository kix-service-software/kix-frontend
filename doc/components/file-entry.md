#### File Entry

##### Description
This component can be used to show a styled DOM element (with name and size and icon) for an attachment.

##### Tag
`<file-entry attachment=attachment on-fileClicked("fileClicked", index)/>`

##### Attributes

| Attribute  |  Required   |        Type         | Value(s)                                                                                     |
| ---------- | :---------: | :-----------------: | -------------------------------------------------------------------------------------------- |
| attachment | alternative |     Attachment      | used to get fileName, fileSize and icon                                                      |
| fileName   | alternative |       string        | ignored if `attachment` is given                                                             |
| fileSize   | alternative |       string        | ignored if `attachment` is given                                                             |
| icon       | alternative | ObjectIcon / string | ignored if `attachment` is given, as `string` it should be a valid CSS-class of the kix-font |

##### Events

| Name        | Trigger                             | Parameter |
| :---------- | :---------------------------------- | --------- |
| fileClicked | represending DOM element is clicked |           |