***Layer: Webapplication (Browser)***

This extension can be used to extend the model. You can provide an additional object constructor which is executed if an new instance of the model is created.

### Implementation
It is required to implement `class` which has an public constructor and extends the base object.
```typescript
export class ExtendedTicket extends Ticket {
    
    public extendedProperty: string;

    public constructor(ticket: Ticket) {
        super(ticket);
        if (ticket) {
            // optional: additional property handling for this object
        }
    }
    
}
```

### Registration
***Register the constructor in the [UIModule](#init-components)***
```typescript
TicketBrowserFactory.getInstance().registerObjectConstructor(ExtendedTicket);
```