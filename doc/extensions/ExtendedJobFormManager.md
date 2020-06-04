***Layer: Webapplication (Browser)***

With this extension its possible to handle specific KIX placeholder for dynamic fields.

### Implementation
The `ExtendedJobFormManager` implements the interface `IJobFormManager` and has an default implementation for each method of the interface. The methods itself do not execute anything and always return **null**. You can overwrite a needed method and return a value which is required for you extension.
```typescript
export class MyExtendedJobFormManager extends ExtendedJobFormManager {
    // ...
}
```

### Registration
***Register the service in the [UIModule](#init-components)***
```typescript
const manager = JobFormService.getInstance().getJobFormManager(JobTypes.SYNCHRONISATION);
if (manager) {
    (manager as AbstractJobFormManager).addExtendedJobFormManager(new MyExtendedJobFormManager());
}
```

### Example
This example provides a specific `FormFieldConfiguration` for an action parameter.
```typescript
export class MyExtendedJobFormManager extends ExtendedJobFormManager {

    public getActionOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ) {
        if (jobType === 'MyJobType') {
            if (option.Name === 'Description') {
                let defaultValue: FormFieldValue;
                if (action && action.Parameters) {
                    defaultValue = new FormFieldValue(action.Parameters[option.Name]);
                }
                return new FormFieldConfiguration(
                    `job-action-${actionType}-${option.Name}`, option.Label,
                    `ACTION###${actionFieldInstanceId}###${option.Name}`,
                    'text-area-input', Boolean(option.Required), option.Description, undefined,
                    defaultValue
                );
            }
        }

        return null;
    }

}
```