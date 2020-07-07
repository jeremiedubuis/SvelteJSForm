SvelteJSForm is a component library for svelte that allows for complex form validation.

## Installation

```$ npm install sveltejs-form```

## Components

The library contains a Form component with a required `id` prop, and a FormField component with required `type` prop. The separation of both components allows for complex DOM structure with diverse elements within the form tag as is sometimes necessary.

## Basic usage

```
<script>
    import {Form, FormField} from 'sveltejs-form'
</script>

<Form id="my-form">
    <FormField type="email" name="email" id="email" validation={{ 
        mandatory: true,
        errorEmpty: 'E-mail is required',
        negativeRegex: {
            "Bad e-mail format": /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        }
    }} />
    <FormField type="password" name="password" id="password" validation={{ 
        mandatory: true,
        errorEmpty: 'Password is required'
    }} />
    <input type="submit" />
</Form>

```

## Validation

### mandatory (boolean)
marks the field as mandatory, if value isn't set by user it will display the 'errorEmpty' string or the defaultEmptyMessage set in configuration

### errorEmpty (string)
The string will be displayed if the field is empty and the mandatory boolean was set, if not defined the defaultEmptyMessage from configuration will be displayed

### positiveRegex (object)
The positiveRegex prop allows you to define props that will trigger errors when the value of the field matches the regex.

```
<FormField
    validation={ {
        positiveRegex: {
        'No commas are allowed': /,/
        }
    } } />
```
### negativeRegex (object)
The negativeRegex prop allows you to define props that will trigger errors when the value of the field doesn't match the regex.
```
<FormField
    validation={ {
        negativeRegex: {
        'The field must contain a comma': /,/
        }
    } } />
```

### group (string)
The group prop marks a field as part of a group, at least one (or groupMin) fields in a group should be filled in for the form to be validated, if the requirement isn't met the field will display the errorGroup prop or the defaultGroupMessage set in configuration

```
<FormField
    validation={ {
        group: 'field-group',
        groupMin: 1,
        errorGroup: 'At least one of these fields is required'
    } } />
```

### identicalGroup (bool)
The identicalGroup prop marks a field as part of a group where all values must be equal. If the requirement isn't met the field will display the errorGroup prop or the defaultGroupMessage set in configuration

```
<FormField
    validation={ {
        group: 'field-group',
        identicalGroup: true,
        errorGroup: 'These fields must be identical'
    } } />
```

## Configuration

Global configuration can be changed by calling the setConfiguration method:
```
import { setConfiguration } from 'sveltejs-form';
setConfiguration({
    libClassName: 'svelte-form';
    defaultEmptyMessage: 'This field is mandatory';
    defaultGroupMessage: 'At least {x} fields must be filled in';
});
```

## Custom form component registration

You can register libraries or custom components as form components with the 
registerComponent function. The target component will receive the onInput, 
onFocus, onBlur, onChange methods that will need to be bound to appropriate events.

```
import { registerComponent } from 'sveltejs-form';
import { AutoComplete } from 'svelte-auto-completion';
// the AutoComplete component takes onInput, onFocus, onBlur props
registerComponent('autocomplete', AutoComplete);

<FormField type="autocomplete" label="Autocomplete custom field" options={['albert', 'bertrand']} minLength={1} validation={{ mandatory: true}} />

```