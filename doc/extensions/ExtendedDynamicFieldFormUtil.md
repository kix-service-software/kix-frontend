***Layer: Webapplication (Browser)***

### Implementation
The `ExtendedDynamicFieldFormUtil` implements the interface `IDynamicFieldFormUtil` and has an default implementation for each method of the interface. The methods itself do not execute anything and always return **null**. You can overwrite a needed method and return a value which is required for you extension.
```typescript
export class MyDynamicFieldFormUtil extends ExtendedDynamicFieldFormUtil {
    // ...
}
```

### Registration
***Register the service in the [UIModule](#init-components)***
```typescript
DynamicFieldFormUtil.getInstance().addExtendedDynamicFormUtil(new MyDynamicFieldFormUtil());
```