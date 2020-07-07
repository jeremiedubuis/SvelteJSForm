export let libClassName = 'svelte-form';
export let defaultEmptyMessage = 'This field is mandatory';
export let defaultGroupMessage = 'At least {x} fields must be filled in';

export let extraTypes = {};

export const setConfiguration = obj => {
    if (obj.libClassName) libClassName = obj.libClassName;
    if (obj.defaultEmptyMessage) defaultEmptyMessage = obj.defaultEmptyMessage;
    if (obj.defaultGroupMessage) defaultGroupMessage = obj.defaultGroupMessage;
};

export const registerComponent = (type, component) => {
    extraTypes[type.toLowerCase()] = component;
}