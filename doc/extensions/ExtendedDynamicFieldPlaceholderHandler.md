***Layer: Webapplication (Browser)***

With this extension its possible to handle specific KIX placeholder for dynamic fields.

### Implementation
The `ExtendedDynamicFieldPlaceholderHandler` implements the interface `IPlaceholderHandler` and has an default implementation for each method of the interface. The methods itself do not execute anything and always return **null**. You can overwrite a needed method and return a value which is required for you extension.
```typescript
export class MyExtendedDynamicFieldPlaceholderHandler extends ExtendedDynamicFieldPlaceholderHandler {
    // ...
}
```

### Registration
***Register the service in the [UIModule](#init-components)***
```typescript
const placeholderHandler = PlaceholderService.getInstance().getHandlerByObjectType<DynamicFieldValuePlaceholderHandler>(
    KIXObjectType.DYNAMIC_FIELD
);
if (placeholderHandler) {
    placeholderHandler.addExtendedPlaceholderHandler(new MyExtendedPlaceholderHandler());
}
```

### Example

```typescript
export class MyDynamicFieldPlaceholderHandler extends ExtendedDynamicFieldPlaceholderHandler {

    public async handleKey(object: KIXObject, dfValue: DynamicFieldValue): Promise<string> {
        const dynamicField = await KIXObjectService.loadDynamicField(dfValue.Name);
        let result: string;

        if (dynamicField && dynamicField.FieldType === 'MyDynamicFieldType') {
            const separator = dynamicField.Config && dynamicField.Config.ItemSeparator ?
                dynamicField.Config.ItemSeparator : ', ';
            result = Array.isArray(dfValue.Value) ? dfValue.Value.join(separator) : [dfValue.Value].join(separator);
        }

        return result;
    }

}
```