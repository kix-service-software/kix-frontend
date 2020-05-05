***Layer: Webapplication (Browser)***

With this extension its possible to add specif handling for dynamic form. A dynamic form is used in different ui components, e.g. search dialog, filter for notifications, bulk dialog.

***Filter in Job dialog***

![Job](static/dynamic-form-01.png)

***Filter in Notification dialog***

![Notification](static/dynamic-form-02.png)

***Search Criteria in Search dialog***

![Search](static/dynamic-form-03.png)

### Implementation
The `ExtendedDynamicFormManager` implements the interface `IDynamicFormManager` and has an default implementation for each method of the interface. The methods itself do not execute anything and always return **null**. You can overwrite a needed method and return a value which is required for you extension.
```typescript
export class ExtendedTicketDynamicFormManager extends ExtendedDynamicFormManager {
    // ...
}
```

### Registration
***Register the service in the [UIModule](#init-components)***
```typescript
// search
const ticketSearchDefinition = SearchService.getInstance().getSearchDefinition(KIXObjectType.TICKET);
if (ticketSearchDefinition && ticketSearchDefinition.formManager) {
    ticketSearchDefinition.formManager.addExtendedFormManager(new KIXProTicketDynamicFormManager());
}

// notification
NotificationFilterManager.getInstance().addExtendedFormManager(new KIXProTicketDynamicFormManager());

// job
TicketJobFilterManager.getInstance().addExtendedFormManager(new KIXProTicketDynamicFormManager());

// bulk
const bulkManager = BulkService.getInstance().getBulkManager(KIXObjectType.TICKET);
if (bulkManager) {
    bulkManager.addExtendedFormManager(new KIXProTicketDynamicFormManager());
}
```

### Example
In this example the `getOperations()` method is overwritten and adds a specific search operator for the property ticket number otherwise it returns **null** and the default is used.
```typescript
export class ExtendedTicketDynamicFormManager extends ExtendedDynamicFormManager {

    public async getOperations(property: string): Promise<string[]> {
        const operations: string[];
        if(property === TicketProperty.TICKET_NUMBER) {
            operations= [SearchOperator.LIKE];
        }

        return operations;
    }

}
```