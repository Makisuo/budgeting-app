/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health Check */
        get: operations["Root.health"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/gocardless/link": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["gocardless.createLink"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/gocardless/callback/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["gocardless.callback"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/gocardless/sync/{accountId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["gocardless.sync"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/sync/institutions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["admin.syncInstitutions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/process/transactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["admin.processTransactions"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscriptions/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health Check */
        get: operations["Subscriptions.create"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/transactions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Update Transaction */
        post: operations["Transactions.update"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/better-auth/*": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["BetterAuth.betterAuthGet"];
        put?: never;
        post: operations["BetterAuth.betterAuthPost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description The request did not match the expected schema */
        HttpApiDecodeError: {
            issues: components["schemas"]["Issue"][];
            message: string;
            /** @enum {string} */
            _tag: "HttpApiDecodeError";
        };
        /** @description Represents an error encountered while parsing a value to match the schema */
        Issue: {
            /**
             * @description The tag identifying the type of parse issue
             * @enum {string}
             */
            _tag: "Pointer" | "Unexpected" | "Missing" | "Composite" | "Refinement" | "Transformation" | "Type" | "Forbidden";
            /** @description The path to the property where the issue occurred */
            path: components["schemas"]["PropertyKey"][];
            /** @description A descriptive message explaining the issue */
            message: string;
        };
        PropertyKey: string | number | {
            /** @enum {string} */
            _tag: "symbol";
            key: string;
        };
        CreateLinkResponse: {
            link: string;
        };
        InternalError: {
            message: string;
            /** @enum {string} */
            _tag: "InternalError";
        };
        NotFound: {
            message: string;
            /** @enum {string} */
            _tag: "NotFound";
        };
        Unauthorized: {
            message: string;
            /** @enum {string} */
            _tag: "Unauthorized";
        };
        Institution: {
            id: string;
            name: string;
            bic: string;
            transaction_total_days: components["schemas"]["NumberFromString"];
            countries: string[];
            logo: string;
            max_access_valid_for_days: components["schemas"]["NumberFromString"];
        };
        /** @description a string to be decoded into a number */
        NumberFromString: string;
        /** Transaction.json */
        "Transaction.json": {
            id: string;
            accountId: string;
            amount: number;
            currency: string;
            date: unknown;
            /** @enum {string} */
            status: "posted" | "pending";
            balance: number | null;
            method: string;
            name: string;
            description: string | null;
            currencyRate: number | null;
            currencySource: string | null;
            companyId: string | null;
            categoryId: string;
            debtorIban: string | null;
            creditorIban: string | null;
            tenantId: string;
            createdAt: components["schemas"]["DateTimeUtc"];
            updatedAt: components["schemas"]["DateTimeUtc"];
            deletedAt: components["schemas"]["DateFromString"];
        };
        /** @description a string to be decoded into a DateTime.Utc */
        DateTimeUtc: string;
        /** @description a string to be decoded into a Date */
        DateFromString: string;
        TransactionNotFound: {
            id: string;
            /** @enum {string} */
            _tag: "TransactionNotFound";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    "Root.health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description a string */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
        };
    };
    "gocardless.createLink": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    institutionId: string;
                };
            };
        };
        responses: {
            /** @description CreateLinkResponse */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateLinkResponse"];
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Unauthorized"];
                };
            };
            /** @description NotFound */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotFound"];
                };
            };
            /** @description InternalError */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalError"];
                };
            };
        };
    };
    "gocardless.callback": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
            /** @description NotFound */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotFound"];
                };
            };
            /** @description InternalError */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalError"];
                };
            };
        };
    };
    "gocardless.sync": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                accountId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description a string */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Unauthorized"];
                };
            };
            /** @description NotFound */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotFound"];
                };
            };
            /** @description InternalError */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalError"];
                };
            };
        };
    };
    "admin.syncInstitutions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Institution"][];
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
            /** @description InternalError */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalError"];
                };
            };
        };
    };
    "admin.processTransactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Transaction.json"][];
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
            /** @description InternalError */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalError"];
                };
            };
        };
    };
    "Subscriptions.create": {
        parameters: {
            query: {
                intialTransactionIds: string[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description a string */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": string;
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
            /** @description InternalError */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalError"];
                };
            };
        };
    };
    "Transactions.update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    categoryId: string;
                };
            };
        };
        responses: {
            /** @description Transaction.json */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Transaction.json"];
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
            /** @description InternalError */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InternalError"] | components["schemas"]["TransactionNotFound"];
                };
            };
        };
    };
    "BetterAuth.betterAuthGet": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
        };
    };
    "BetterAuth.betterAuthPost": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
        };
    };
}
