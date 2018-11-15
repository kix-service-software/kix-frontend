# KIX Formulare

Am Beispiel FAQ Artikel erstellen.

## Formulardefinition erstellen

In der Extensionimplementierung des Kontextes muss die Methode `createFormDefinitions()` implementiert werden.

```javascript
public async createFormDefinitions(): Promise<void> {
    const configurationService =
        ServiceContainer.getInstance().getClass<IConfigurationService>("IConfigurationService");

    const formId = 'new-faq-article-form';
    const existingForm = configurationService.getModuleConfiguration(formId, null);
    if (!existingForm) {
        const fields: FormField[] = [];
        fields.push(new FormField("Titel", FAQArticleProperty.TITLE, true, "Titel"));

        const group = new FormGroup('FAQ Daten', fields);

        const form = new Form(formId, 'Neue FAQ', [group], KIXObjectType.FAQ_ARTICLE);
        await configurationService.saveModuleConfiguration(form.id, null, form);
    }
    configurationService.registerForm([FormContext.NEW], KIXObjectType.FAQ_ARTICLE, formId);
}
```

## Formular einbinden

```html
<main-form formId='new-faq-article-form'/>
```

## Eingabefelder registrieren/zuweisen
Im `FAQService`:

```javascript
FormInputRegistry.getInstance().registerFormInputComponent(new FormInputComponentDefinition(
    FAQArticleProperty.FIELD_1, KIXObjectType.FAQ_ARTICLE, 'rich-text-input', 'Symptom'
));

FormInputRegistry.getInstance().registerFormInputComponent(new FormInputComponentDefinition(
    FAQArticleProperty.VALID_ID, KIXObjectType.FAQ_ARTICLE, 'valid-input', 'Gültigkeit'
));
```
