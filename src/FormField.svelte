<script>
    import { getContext } from 'svelte';
    import { TYPES } from './consts';
    import { libClassName, extraTypes } from './helpers/configuration';
    import { getError } from './helpers/validation';

    $: ({
        checked,
        className = '',
        id,
        label = undefined,
        name,
        type = 'text',
        options = undefined,
        onBlur = undefined,
        onChange = undefined,
        onFocus = undefined,
        onInput = undefined,
        validation = {},
        value: providedValue,
        ...nativeProps
    } = $$props);

    export let value = '';

    let isFocused = false;
    let hasBlurred = false;
    let error = null;

    $: typeLower = type.toLowerCase();
    $: isRadioOrCheckbox = typeLower === TYPES.CHECKBOX || type === TYPES.RADIO;
    $: isChecked = checked || false;

    const form = getContext('form');

    const setError = _error => error = _error;

    const validateField = form.register({
        getNameValue: () => [name, value],
        validate: (silent) => {
            let _error = getError(value, validation);
            if (!silent) setError(_error);
            return _error;
        }
    });

    $: form.registerGroup(validation.group, () => value, setError);

    const validate = () => {
        validateField();
        if (validation.group) form.setGroupError(validation);
    };

    const _onInput = e => {
        value = isRadioOrCheckbox ? e.target.checked ? e.target.value || true : false : e.target.value;
        if (hasBlurred) validate();
        if (typeof onInput === 'function') onInput(e);
    };

    const _onChange = e => {
        if (isRadioOrCheckbox) {
            isChecked = !isChecked;
        }
        if (typeof onChange === 'function') onChange(e);
    };

    const _onFocus = e => {
        isFocused = true;
        if (hasBlurred) validate();
        if (typeof onFocus === 'function') onInput(e);
    };
    const _onBlur = e => {
        isFocused = false;
        hasBlurred = true;
        validate();
        if (typeof onBlur === 'function') onInput(e);
    };

    $: getHTMLProps = () => {
        const p = { ...nativeProps };
        if (typeof value !== 'undefined') p.value = value;
        if (isRadioOrCheckbox) p.checked = isChecked;
        return p;
    };

    $:if (typeLower === TYPES.SELECT && !value && typeof Array.isArray(options) && options.length)
        value = (options.find(({ selected }) => selected) || options[0] ).value;

    $: getClassName = () => {
        const c = [`${libClassName}-field`, `is-${typeLower}`];
        if (className) c.push(className);
        if (error) c.push('has-error');
        if (isFocused) c.push('is-focused');
        if (typeof value !== 'undefined' && value !== '') c.push('has-value');
        return c.join(' ');
    }

</script>

<div class="{getClassName()}">

    {#if label && !isRadioOrCheckbox}
        <label for={id}>{label}</label>
    {/if}

    {#if typeLower === TYPES.TEXTAREA }
        <textarea id={id} {...getHTMLProps()} on:blur={_onBlur} on:focus={_onFocus} on:input={_onInput} on:change={onChange}/>

    {:else if typeLower === TYPES.SELECT}
        <select id={id} {...getHTMLProps()} on:blur={_onBlur} on:focus={_onFocus} on:change={_onInput} on:change={onChange} >
            {#each options as o}
                <option value={o.value} selected={o.selected}>{o.label}</option>
            {/each}
        </select>
    {:else if extraTypes[typeLower]}
        <svelte:component
                this={extraTypes[typeLower]}
                {...nativeProps}
                options={options}
                id={id}
                onFocus={_onFocus}
                onBlur={_onBlur}
                onInput={_onInput}
                onChange={_onChange}
                validate={validate}
                setValue={(v) => value = v}
                bind:value={value} />
    {:else}
        <input id={id} type={typeLower} {...getHTMLProps()} on:blur={_onBlur} on:focus={_onFocus} on:input={_onInput} on:change={_onChange}/>
    {/if}

    {#if label && isRadioOrCheckbox}
        <label for={id}>{label}</label>
    {/if}
    {#if error}
        <span  class="{libClassName}-field-error">{error.message}</span>
    {/if}
</div>
