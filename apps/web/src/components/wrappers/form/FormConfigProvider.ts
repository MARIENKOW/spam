"use client";

import { MessageKeyType } from "@myorg/shared/i18n";
import { createContext, useContext } from "react";

export type FormConfigType = {
    fields: {
        variant: "filled" | "outlined" | "standard";
    };
    submit: {
        variant: "text" | "contained" | "outlined";
        text: MessageKeyType;
    };
};

export type FormConfigPartial = Partial<FormConfigType>;

export const DEFAULT_FORM_CONFIG: FormConfigType = {
    fields: {
        variant: "filled",
    },
    submit: {
        variant: "contained",
        text: "form.submit",
    },
};

const FormConfigContext = createContext<FormConfigType>(DEFAULT_FORM_CONFIG);

export const useFormConfig = () => useContext(FormConfigContext);
export const FormConfigProvider = FormConfigContext.Provider;
