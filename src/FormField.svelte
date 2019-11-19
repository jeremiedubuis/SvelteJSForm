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
        onFocus,
        onInput,
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

    const _onInput = e => {
        value = isRadioOrCheckbox ? e.target.checked : e.target.value;
        if (hasBlurred) validate();
        if (typeof onInput === 'function') onInput(e);
    };
    const _onFocus = e => {
        if (hasBlurred) validate();
        if (typeof onFocus === 'function') onInput(e);
    };
    const _onBlur = e => {
        hasBlurred = true;
        validate();
        if (typeof onBlur === 'function') onInput(e);
    };

    const typeLower = type.toLowerCase();

</script>

<div  class="{libClassName}-field is-{typeLower} {className} {error ? 'has-error' : ''}">

    {#if label && !isRadioOrCheckbox}
        <label for={id}>{label}</label>
    {/if}

    {#if typeLower === TYPES.TEXTAREA }
        <textarea id={id} {...nativeProps} on:blur={_onBlur} on:focus={_onFocus} on:input={_onInput} />

    {:else if typeLower === TYPES.SELECT}
        <select id={id} {...nativeProps} on:blur={_onBlur} on:focus={_onFocus} on:change={_onInput} >
            {#each options as o}
                <option value={o.value}>{o.label}</option>
            {/each}
        </select>
    {:else}
        <input id={id} type={typeLower} {...nativeProps} on:blur={_onBlur} on:focus={_onFocus} on:input={_onInput} />
    {/if}

    {#if label && isRadioOrCheckbox}
        <label for={id}>{label}</label>
    {/if}
    {#if error}
        <span  class="{libClassName}-field-error">{error.message}</span>
    {/if}
</div>
