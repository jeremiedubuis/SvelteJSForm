<script>
    import {setContext} from 'svelte';
    import {libClassName, defaultGroupMessage} from './helpers/configuration';
    import {ERRORS} from './consts';

    export let id;
    export let className = undefined;
    export let onSubmit = undefined;
    export let onSubmitError = undefined;

    const validations = [];
    const values = [];

    const form = {
        register({ getNameValue, validate}) {
            values.push(getNameValue);
            validations.push(validate);
            return validations[validations.length - 1];
        },
        groups: {},
        registerGroup(group, getNameValue, setError) {
            if (!this.groups[group]) this.groups[group] = [];
            this.groups[group].push({getNameValue, setError});
        },
        validate() {
            const errors = [];
            validations.forEach(v => {
                let error = v();
                if (error) errors.push(error);
            });

            return errors;
        },
        getGroupError(validation) {
            let totalWithValue = 0;
            let identical;
            this.groups[validation.group].forEach(({getNameValue}) => {
                let [name, val] = getNameValue();
                if (validation.identicalGroup && val && !identical) identical = val;
                totalWithValue += typeof val === 'undefined' || val === false || val === '' || (validation.identicalGroup && val !== identical) ? 0 : 1;
            });

            return totalWithValue < (validation.groupMin || 1);
        },
        setGroupError(validation) {
            const error = this.getGroupError(validation)
                    ? {
                        code: ERRORS.GROUP,
                        message: (validation.errorGroup || defaultGroupMessage).replace('{x}', validation.groupMin || 1)
                    }
                    : null;
            this.groups[validation.group].forEach(({setError}) => {
                setError(error)
            });
        }
    };

    const submit = e => {
        const errors = form.validate(e);
        if (errors.length) {
            e.preventDefault();
            if (typeof onSubmitError === 'function') onSubmitError(e, errors);
        } else {
            if (typeof onSubmit === 'function')
                onSubmit(
                    e,
                    values.reduce(
                        (acc, getValue) => {
                            let [name, value] = getValue();
                            if (name.indexOf('[]') > -1) {
                                name = name.replace('[]', '');
                                if (!acc[name]) acc[name] = [];
                                acc[name].push(value);
                                return acc;
                            }
                            acc[name] = value;
                            return acc;
                        },
                        {}
                    )
                );
        }
    };

    setContext('form', form);
</script>

<form id={id} class="{libClassName} {className || ''}" on:submit={submit}>
    <slot></slot>
</form>
