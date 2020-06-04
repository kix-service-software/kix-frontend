***Layer: Webapplication (Browser)***

### Implementation
The `ExtendedConfigItemFormFactory` provides the method `getFormField()` to handle specific config item class attributes for the form.
```typescript
export class MyExtendedConfigItemFormFactory extends ExtendedConfigItemFormFactory {
    // ...
}
```

### Registration
***Register the service in the [UIModule](#init-components)***
```typescript
ConfigItemFormFactory.getInstance().addExtendedConfigItemFormFactory(new MyExtendedConfigItemFormFactory());
```

### Example
In this example a Config Item Class contains a attribute with a new type `MyConfigItemAttribute`. For this type a specific input is needed.
```typescript
export class MyExtendedConfigItemFormFactory extends ExtendedConfigItemFormFactory {

    public getFormField(
        ad: AttributeDefinition, parentInstanceId?: string, parent?: FormFieldConfiguration
    ): FormFieldConfiguration {
        let formField: FormFieldConfiguration;

        if (ad.Input.Type === 'MyConfigItemAttribute') {
            formField = new FormFieldConfiguration(ad.Key, ad.Name, ad.Key, 'object-reference-input', ad.Input.Required, null,
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, 'MyObject'),
                    new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                    new FormFieldOption(FormFieldOptions.INPUT_FIELD_TYPE, InputFieldTypes.OBJECT_REFERENCE)
                ],
                null, null, null, parentInstanceId, ad.CountDefault, ad.CountMax, ad.CountMin,
                ad.Input.MaxLength, ad.Input.RegEx, ad.Input.RegExErrorMessage
            );
        }

        return formField;
    }

}
```