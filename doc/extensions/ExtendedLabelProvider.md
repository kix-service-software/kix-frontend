***Layer: Webapplication (Browser)***

### Implementation
The `ExtendedLabelProvider` implements the interface `ILabelProvider` and has an default implementation for each method of the interface. The methods itself do not execute anything and always return **null**. You can overwrite a needed method and return a value which is required for you extension.
```typescript
export class ExtendedTicketLabelProvider extends ExtendedLabelProvider {
    // ...
}
```

### Registration
***Register the service in the [UIModule](#init-components)***
```typescript
const ticketLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET);
if (ticketLabelProvider) {
    ticketLabelProvider.addExtendedLabelProvider(new ExtendedTicketLabelProvider());
}
```

### Example
In this example the `getPropertyText()` method is overwritten and has a specific implementation for  specific properties to provide a different display value. If its another property the method returns **null** and the default is used.
```typescript
export class MyObjectService extends ExtendedKIXObjectService {

    public async getPropertyText(property: string, short?: boolean, translatable?: boolean): Promise<string> {
        let displayValue;

        switch (property) {
            case TicketProperty.TICKET_NUMBER:
                displayValue = 'T#-Number'
                break;
            case TicketProperty.QUEUE_ID:
                displayValue = 'Department'
                break;
            default:
        }

        return displayValue;
    }

}
```