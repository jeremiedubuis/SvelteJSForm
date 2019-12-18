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
        register({ getValue, validate}) {
            values.push(getValue);
            validations.push(validate);
            return validations[validations.length - 1];
        },
        groups: {},
        registerGroup(group, getValue, setError) {
            if (!this.groups[group]) this.groups[group] = [];
            this.groups[group].push({getValue, setError});
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
            this.groups[validation.group].forEach(({getValue}) => {
                let val = getValue();
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
                        (acc, getValue) => ({...acc, ...getValue()}),
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
