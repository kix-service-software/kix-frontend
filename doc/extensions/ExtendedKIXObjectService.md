***Webapplication***

### Implementation

```typescript
export class MyObjectService extends ExtendedKIXObjectService {
    // ...
}
```

### Registration
```typescript
TicketService.getInstance().addExtendedService(new MyObjectService());
```