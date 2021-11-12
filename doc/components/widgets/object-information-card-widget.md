#### Object Information Card Widget

##### Description
This component is used to show object details and individuel property display values.

##### Tag
`<object-information-card-widget/>`

##### Attributes

| Attribute  | Required |  Type  | Value(s)                                                                                                                    |
| ---------- | :------: | :----: | --------------------------------------------------------------------------------------------------------------------------- |
| instanceId |   yes    | String | the unique identifier of the widget instance (used to load configuration and to determine the widget type from the context) |

##### Configuration

The Configuration is based on the class `ObjectInformationCardConfiguration`:

| Property | Required | Type                                         | Description                               |
| -------- | :------: | -------------------------------------------- | ----------------------------------------- |
| avatar   |    no    | ObjectIcon, string, `ObjectIcon[]`, string[] | one ore more avatar images for the widget |
| rows     |    no    | `InformationRowConfiguration[]`              | Array of rows with objectinformation      |

**InformationRowConfiguration**

| Property  | Required | Type                         | Description                        |
| --------- | :------: | ---------------------------- | ---------------------------------- |
| values    |    no    | `InformationConfiguration[]` | Array of value groups              |
| title     |    no    | string                       | An optional title for the row      |
| style     |    no    | string                       | individual CSS styling for the row |
| separator |    no    | boolean                      | An optional separator for the row  |

**InformationConfiguration**

| Property             | Required | Type                   | Description                                                     |
| -------------------- | :------: | ---------------------- | --------------------------------------------------------------- |
| componentId          |    no    | string                 | Id of an individual component to display a object value         |
| componentData        |    no    | any                    | Data for the component definied with componentId                |
| conditions           |    no    | `UIFilterCriterion[]`  | Conditions when the value should be shown                       |
| icon                 |    no    | `ObjectIcon` or string | An icon for the value                                           |
| iconStyle            |    no    | string                 | individual CSS styling for the icon                             |
| text                 |    no    | string                 | the text which should be shown in the UI (supports placeholder) |
| textPlaceholder      |    no    | string[]               | extracted placeholder from the text (supports placeholder)      |
| textStyle            |    no    | string                 | individual CSS styling for the text                             |
| linkSrc              |    no    | string                 | the target for a external hyperlink (supports placeholder)      |
| routingConfiguration |    no    | `RoutingConfiguration` | A target for an KIX internal link                               |
| routingObjectId      |    no    | string                 | the objectId for the internal link (supports placeholder)       |

##### How to use `InformationConfiguration` with text

***Simple Text***

```json
{
    "text": "This my display value."
}
```

***Simple Text with style***
```json
{
    "text": "This my display value.",
    "textStyle": "font-size:1.5rem;color:red;font-weight:bold"
}
```

***Simple Text with style and external link with placeholder***
```json
{
    "text": "This my display value for the link.",
    "textStyle": "font-size:1.5rem;color:red;font-weight:bold",
    "linkSrc": "http://www.my-webiste.com?ticket=<KIX_TICKET_ID>"
}
```

***Simple Text with internal link to the contact details***
```json
{
    "text": "This my display value for the link.",
    "textStyle": "font-size:1.5rem;color:red;font-weight:bold",
    "routingConfiguration": {
        "contextId": "contact-details",
        "objectType": "Contact",
        "contextMode": "DETAILS",
        "objectIdProperty": null,
        "history": null,
        "externalLink": false,
        "replaceObjectId": null,
        "resetContext": null,
        "params": [],
        "contextType": "MAIN"
    },
    "routingObjectId": "<KIX_TICKET_CONTACT_ID>"
}
```

***Simple Text with internal link to the ticket search based on contact***
```json
{
    "text": "This my display value for the link.",
    "textStyle": "font-size:1.5rem;color:red;font-weight:bold",
    "routingConfiguration": {
        "contextId": "search-ticket-context",
        "objectType": null,
        "contextMode": "SEARCH",
        "objectIdProperty": null,
        "history": null,
        "externalLink": false,
        "replaceObjectId": null,
        "resetContext": null,
        "params": [
            [
                "search",
                {
                    "objectType": "Ticket",
                    "criteria": [
                        {
                            "property": "ContactID",
                            "operator": "EQ",
                            "type": "STRING",
                            "filterType": "AND",
                            "value": "<KIX_TICKET_ContactID>"
                        },
                        {
                            "property": "StateID",
                            "operator": "EQ",
                            "type": "NUMERIC",
                            "filterType": "AND",
                            "value": 2
                        }
                    ]
                }
            ]
        ],
        "contextType": "MAIN"
    }
}
```

***Text with Placeholder***
```json
{
    "text": "This my display value with a Placeholder value: <KIX_TICKET_STATE>.",
}
```

***Text with Placeholder and `textPlaceholder`***

This is used if the is needed for i18n. You can extract the placeholders from the string, so that the value of the placholder will not be translated.
```json
{
    "text": "This my display value with a Placeholder values: {0}, {1}.",
    "textPlaceholder": ["<KIX_TICKET_STATE>", "<KIX_TICKET_TYPE>]
}
```

***Text with simple icon***
```json
{
    "text": "This is my display value.",
    "icon": "kix-icon-ticket"
}
```

***Text with `ObjectIcon` based on object values***
```json
{
    "text": "This is my display value for the Contact: <KIX_TICKET_CONTACT>.",
    "icon": {
      "ObjectId": "<KIX_CONTACT_ID>",
      "Object": "Contact",
      "fallbackIcon": "kix-icon-man-bubble"
    }
}
```

***Text with Conditions***
```json
{
    "text": "This text is only shown if the conditions match.",
    "conditions": [
        {
            "property": "OwnerID",
            "operator": "NE",
            "value": 1,
            "useObjectService": false,
            "useDisplayValue": false
        }
    ]
}
```

##### How to use `InformationConfiguration` with individuel components

***Component - `object-avatar-label`***
This component provides a avatar, the display name of the given property and the object value of the property from the current object.
```json
{
    "componentId": "object-avatar-label",
    "componentData": {
        "property": "QueueID"
    }
}
```

***Component - `dynamic-field-value`***
This component provides individual components for dynamic field values, based on their dynamic field type. E.g. Labels for Asset and Ticket references or Checklist values or Table ...
```json
{
    "componentId": "dynamic-field-value",
    "componentData": {
        "name": "MyDynamicField"
    }
}
```