<script>
    import { getContext } from 'svelte';
    import { TYPES } from './consts';
    import { libClassName } from './helpers/configuration';
    import { getError } from './helpers/validation';

    export let className = '';
    export let id;
    export let label = undefined;
    export let type = 'text';
    export let options = undefined;
    export let onBlur = undefined;
    export let onChange = undefined;
    export let onFocus = undefined;
    export let onInput = undefined;
    export let validation = {};
    export let value = "";

    export let disabled = undefined;
    export let readonly = undefined;
    export let placeholder = undefined;
    export let name;

    let isFocused = false;
    let hasBlurred = false;
    let error = null;

    const isRadioOrCheckbox = type === TYPES.CHECKBOX || type === TYPES.RADIO;

    const form = getContext('form');

    const setError = _error => error = _error;

    const validateField = form.register({
        getValue: () => ({ [name]: value}),
        validate: (silent) => {
            let _error = getError(value, validation);
            if (!silent) setError(_error);
            return _error;
        }
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

    const typeLower = type.toLowerCase();
    $: getHTMLProps = () => {
        const p = { name, readonly};
        if (typeof disabled !== 'undefined') p.disabled = disabled;
        if (typeof readonly !== 'undefined') p.readonly = readonly;
        if (typeof value !== 'undefined') p.value = value;
        if (typeof placeholder !== 'undefined') p.placeholder = placeholder;
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
    {:else}
        <input id={id} type={typeLower} {...getHTMLProps()} on:blur={_onBlur} on:focus={_onFocus} on:input={_onInput} on:change={onChange}/>
    {/if}

    {#if label && isRadioOrCheckbox}
        <label for={id}>{label}</label>
    {/if}
    {#if error}
        <span  class="{libClassName}-field-error">{error.message}</span>
    {/if}
</div>
