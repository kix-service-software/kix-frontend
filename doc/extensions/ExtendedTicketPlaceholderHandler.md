***Layer: Webapplication (Browser)***

With this extension its possible to handle specific KIX placeholders for additional ticket attributes. The extended handlers are sorted by their `handlerId` if two or more would return true in `isHandlerFor`.
Please note the the default ticket replacement functionality (or another extended placeholder handler) is no fallback if the used extended placeholder handler returns nothing.

### Implementation
The new `ExtendedTicketPlaceholderHandler` should extend `AbstractPlaceholderHandler` which has an default implementation for each method of the `IPlaceholderHandler` interface. You can overwrite a needed method and return a value which is required for you extension (e.g. `isHandlerFor` and `replace`).
```typescript
export class ExtendedTicketPlaceholderHandlerForNewTicketAttributes extends AbstracPlaceholderHandler {
    // ...
}
```

### Registration
***Register the service in the [UIModule](#init-components)***
```typescript
const placeholderHandler = PlaceholderService.getInstance().getHandlerByObjectType<DynamicFieldValuePlaceholderHandler>(
    KIXObjectType.TICKET
);
if (placeholderHandler) {
    placeholderHandler.addExtendedPlaceholderHandler(new ExtendedTicketPlaceholderHandlerForNewTicketAttributes());
}
```

### Example

```typescript
export class ExtendedTicketPlaceholderHandlerForNewTicketAttributes extends AbstracPlaceholderHandler {

    public handlerId: string = '500-ExtendedTicketPlaceholderHandlerForNewTicketAttributes';

    private newAttributes: string[] = ['NewAttribute1', 'NewAttribute2'];

    public isHandlerFor(placeholder: string): boolean {
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);

        return objectString && objectString === 'TICKET' && attribute && this.newAttributes.some((a) => a === attribute);
    }

    public async replace(placeholder: string, ticket?: Ticket, language?: string): Promise<string> {
        let result = '';
        if (ticket && this.isHandlerFor(placeholder)) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);

            if (attribute && ticket[attribute]) {
                result = this.prepareNewTicketAttirbute(ticket, attribute);
            }
        }

        return result;
    }

    private prepareNewTicketAttirbute(ticket: Ticket, attribute: string): string {
        // ...
    }

}
```