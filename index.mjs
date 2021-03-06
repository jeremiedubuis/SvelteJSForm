function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

// source: https://html.spec.whatwg.org/multipage/indices.html
const boolean_attributes = new Set([
    'allowfullscreen',
    'allowpaymentrequest',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'controls',
    'default',
    'defer',
    'disabled',
    'formnovalidate',
    'hidden',
    'ismap',
    'loop',
    'multiple',
    'muted',
    'nomodule',
    'novalidate',
    'open',
    'playsinline',
    'readonly',
    'required',
    'reversed',
    'selected'
]);

const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
// https://infra.spec.whatwg.org/#noncharacter
function spread(args, classes_to_add) {
    const attributes = Object.assign({}, ...args);
    if (classes_to_add) {
        if (attributes.class == null) {
            attributes.class = classes_to_add;
        }
        else {
            attributes.class += ' ' + classes_to_add;
        }
    }
    let str = '';
    Object.keys(attributes).forEach(name => {
        if (invalid_attribute_name_character.test(name))
            return;
        const value = attributes[name];
        if (value === true)
            str += " " + name;
        else if (boolean_attributes.has(name.toLowerCase())) {
            if (value)
                str += " " + name;
        }
        else if (value != null) {
            str += ` ${name}="${String(value).replace(/"/g, '&#34;').replace(/'/g, '&#39;')}"`;
        }
    });
    return str;
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}

let libClassName = 'svelte-form';
let defaultEmptyMessage = 'This field is mandatory';
let defaultGroupMessage = 'At least {x} fields must be filled in';

let extraTypes = {};

const setConfiguration = obj => {
    if (obj.libClassName) libClassName = obj.libClassName;
    if (obj.defaultEmptyMessage) defaultEmptyMessage = obj.defaultEmptyMessage;
    if (obj.defaultGroupMessage) defaultGroupMessage = obj.defaultGroupMessage;
};

const registerComponent = (type, component) => {
    extraTypes[type.toLowerCase()] = component;
};

const TYPES = {
    CHECKBOX: 'checkbox',
    DATE: 'date',
    EMAIL: 'email',
    NUMBER: 'number',
    PASSWORD: 'password',
    RADIO: 'radio',
    SELECT: 'select',
    TEXT: 'text',
    TEXTAREA: 'textarea'
};

const ERRORS = {
    EMPTY: 'empty',
    FORMAT: 'format',
    GROUP: 'group'
};

/* src/Form.svelte generated by Svelte v3.20.1 */

const Form = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { id } = $$props;
	let { className = undefined } = $$props;
	let { onSubmit = undefined } = $$props;
	let { onSubmitError = undefined } = $$props;
	const validations = [];

	const form = {
		register({ getNameValue, validate }) {
			validations.push(validate);
			return validations[validations.length - 1];
		},
		groups: {},
		registerGroup(group, getNameValue, setError) {
			if (!this.groups[group]) this.groups[group] = [];
			this.groups[group].push({ getNameValue, setError });
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

			this.groups[validation.group].forEach(({ getNameValue }) => {
				let [name, val] = getNameValue();
				if (validation.identicalGroup && val && !identical) identical = val;

				totalWithValue += typeof val === "undefined" || val === false || val === "" || validation.identicalGroup && val !== identical
				? 0
				: 1;
			});

			return totalWithValue < (validation.groupMin || 1);
		},
		setGroupError(validation) {
			const error = this.getGroupError(validation)
			? {
					code: ERRORS.GROUP,
					message: (validation.errorGroup || defaultGroupMessage).replace("{x}", validation.groupMin || 1)
				}
			: null;

			this.groups[validation.group].forEach(({ setError }) => {
				setError(error);
			});
		}
	};

	setContext("form", form);
	if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
	if ($$props.className === void 0 && $$bindings.className && className !== void 0) $$bindings.className(className);
	if ($$props.onSubmit === void 0 && $$bindings.onSubmit && onSubmit !== void 0) $$bindings.onSubmit(onSubmit);
	if ($$props.onSubmitError === void 0 && $$bindings.onSubmitError && onSubmitError !== void 0) $$bindings.onSubmitError(onSubmitError);
	return `<form${add_attribute("id", id, 0)} class="${escape(libClassName) + " " + escape(className || "")}">${$$slots.default ? $$slots.default({}) : ``}</form>`;
});

const regexMatches = (val, regex) =>
    (regex instanceof RegExp
        ? regex
        : new RegExp(regex)).test(val);

const getError = (value, validation = {}) => {

    if (!value && validation.mandatory)
        return {
            code: ERRORS.EMPTY,
            message: validation.errorEmpty || defaultEmptyMessage
        };

    if (validation.negativeRegex) {
        for (let key in validation.negativeRegex) {
            if (!regexMatches(value, validation.negativeRegex[key])) {
                return {
                    code: ERRORS.FORMAT,
                    message: key
                };
            }
        }
    }

    if (validation.positiveRegex) {
        for (let key in validation.positiveRegex) {
            if (regexMatches(value, validation.positiveRegex[key])) {
                return {
                    code: ERRORS.FORMAT,
                    message: key
                };
            }
        }
    }

    if (validation.customErrorHandlers) {
        for (let key in validation.customErrorHandlers) {
            if (validation.customErrorHandlers[key](value)) {
                return {
                    code: ERRORS.FORMAT,
                    message: key
                };
            }
        }
    }

    return null;

};

/* src/FormField.svelte generated by Svelte v3.20.1 */

const FormField = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { value = "" } = $$props;
	let isFocused = false;
	let hasBlurred = false;
	let error = null;
	const form = getContext("form");
	const setError = _error => error = _error;

	const validateField = form.register({
		getNameValue: () => [name, value],
		validate: silent => {
			let _error = getError(value, validation);
			if (!silent) setError(_error);
			return _error;
		}
	});

	const validate = () => {
		validateField();
		if (validation.group) form.setGroupError(validation);
	};

	const _onInput = e => {
		value = isRadioOrCheckbox
		? e.target.checked ? e.target.value || true : false
		: e.target.value;

		if (hasBlurred) validate();
		if (typeof onInput === "function") onInput(e);
	};

	const _onChange = e => {
		if (isRadioOrCheckbox) {
			isChecked = !isChecked;
		}

		if (typeof onChange === "function") onChange(e);
	};

	const _onFocus = e => {
		isFocused = true;
		if (hasBlurred) validate();
		if (typeof onFocus === "function") onInput(e);
	};

	const _onBlur = e => {
		isFocused = false;
		hasBlurred = true;
		validate();
		if (typeof onBlur === "function") onInput(e);
	};

	if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		let { checked, className = "", id, label = undefined, name, type = "text", options = undefined, onBlur = undefined, onChange = undefined, onFocus = undefined, onInput = undefined, validation = {}, value: providedValue, ...nativeProps } = $$props;
		let typeLower = type.toLowerCase();
		let isRadioOrCheckbox = typeLower === TYPES.CHECKBOX || type === TYPES.RADIO;
		let isChecked = checked || false;

		 {
			if (typeLower === TYPES.SELECT && !value && typeof Array.isArray(options) && options.length) value = (options.find(({ selected }) => selected) || options[0]).value;
		}

		 {
			form.registerGroup(validation.group, () => value, setError);
		}

		let getHTMLProps = () => {
			const p = { ...nativeProps };
			if (typeof value !== "undefined") p.value = value;
			if (isRadioOrCheckbox) p.checked = isChecked;
			return p;
		};

		let getClassName = () => {
			const c = [`${libClassName}-field`, `is-${typeLower}`];
			if (className) c.push(className);
			if (error) c.push("has-error");
			if (isFocused) c.push("is-focused");
			if (typeof value !== "undefined" && value !== "") c.push("has-value");
			return c.join(" ");
		};

		$$rendered = `<div${add_attribute("class", getClassName(), 0)}>${label && !isRadioOrCheckbox
		? `<label${add_attribute("for", id, 0)}>${escape(label)}</label>`
		: ``}

    ${typeLower === TYPES.TEXTAREA
		? `<textarea${spread([{ id: escape(id) }, getHTMLProps()])}></textarea>`
		: `${typeLower === TYPES.SELECT
			? `<select${spread([{ id: escape(id) }, getHTMLProps()])}>${each(options, o => `<option${add_attribute("value", o.value, 0)} ${o.selected ? "selected" : ""}>${escape(o.label)}</option>`)}</select>`
			: `${extraTypes[typeLower]
				? `${validate_component(extraTypes[typeLower] || missing_component, "svelte:component").$$render(
						$$result,
						Object.assign(nativeProps, { options }, { id }, { onFocus: _onFocus }, { onBlur: _onBlur }, { onInput: _onInput }, { onChange: _onChange }, { validate }, { setValue: v => value = v }, { value }),
						{
							value: $$value => {
								value = $$value;
								$$settled = false;
							}
						},
						{}
					)}`
				: `<input${spread([{ id: escape(id) }, { type: escape(typeLower) }, getHTMLProps()])}>`}`}`}

    ${label && isRadioOrCheckbox
		? `<label${add_attribute("for", id, 0)}>${escape(label)}</label>`
		: ``}
    ${error
		? `<span class="${escape(libClassName) + "-field-error"}">${escape(error.message)}</span>`
		: ``}</div>`;
	} while (!$$settled);

	return $$rendered;
});

export { Form, FormField, registerComponent, setConfiguration };
