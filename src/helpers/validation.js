import {ERRORS} from '../consts';
import { defaultEmptyMessage, defaultGroupMessage } from './configuration';

export const regexMatches = (val, regex) =>
    (regex instanceof RegExp
        ? regex
        : new RegExp(regex)).test(val);

export const getError = (value, validation = {}) => {

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
