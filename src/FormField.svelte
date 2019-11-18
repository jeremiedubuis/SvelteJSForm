<script>
    import { getContext } from 'svelte';
    import { TYPES } from './consts';
    import { libClassName } from './helpers/configuration';
    import { getError } from './helpers/validation';
    const {
        className = '',
        id,
        label,
        type = 'text',
        options,
        onBlur,
        onChange,
        onFocus,
        validation = {},
        ...nativeProps
    } = $$props;

    let hasBlurred = false;
    let error = null;
    let value;

    const isRadioOrCheckbox = type === TYPES.CHECKBOX || type === TYPES.RADIO;

    const form = getContext('form');

    const setError = _error => error = _error;

    const validateField = form.register((silent) => {
        let _error = getError(value, validation);
        if (!silent) setError(_error);
        return _error;
    });

    form.registerGroup(validation.group, () => value, setError);

    const validate = () => {
        validateField();
        if (validation.group) form.setGroupError(validation);
    };

    const _onChange = e => {
        value = isRadioOrCheckbox ? e.target.checked : e.target.value;
        if (hasBlurred) validate();
    };
    const _onFocus = e => {
        if (hasBlurred) validate();
    };
    const _onBlur = e => {
        hasBlurred = true;
        validate();
    };

    const typeLower = type.toLowerCase();

</script>

<div  class="{libClassName}-field is-{typeLower} {className} {error ? 'has-error' : ''}">

    {#if label && !isRadioOrCheckbox}
        <label for={id}>{label}</label>
    {/if}

    {#if typeLower === TYPES.TEXTAREA }
        <textarea id={id} {...nativeProps} on:blur={_onBlur} on:focus={_onFocus} on:input={_onChange} />

        {:else if typeLower === TYPES.SELECT}
        <select id={id} {...nativeProps} on:blur={_onBlur} on:focus={_onFocus} on:change={_onChange} >
            {#each options as o}
                <option value={o.value}>{o.label}</option>
            {/each}
        </select>
        {:else}
        <input id={id} type={typeLower} {...nativeProps} on:blur={_onBlur} on:focus={_onFocus} on:input={_onChange} />
    {/if}

    {#if label && isRadioOrCheckbox}
        <label for={id}>{label}</label>
    {/if}
    {#if error}
        <span  class="{libClassName}-field-error">{error.message}</span>
    {/if}
</div>
