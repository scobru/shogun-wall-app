import Gun from 'gun';

// Type definitions
interface TokenState {
    value: string | undefined;
}

interface Message {
    headers?: Record<string, any>;
    [key: string]: any;
}

interface GunContext {
    once?: boolean;
    on: (event: string, callback: Function) => void;
}

interface GunMiddleware {
    to: {
        next: (msg: Message) => void;
    };
}

// Functional programming style implementation
const gunHeaderModule = (Gun: any) => {
    // Closure for token state
    const tokenState: TokenState = {
        value: undefined
    };

    // Pure function to create a new token state
    const setToken = (newToken: string): string => {
        tokenState.value = newToken;
        setupTokenMiddleware();
        return tokenState.value;
    };

    // Pure function to retrieve token
    const getToken = (): string | undefined => tokenState.value;

    // Function to add token to headers
    const addTokenToHeaders = (msg: Message): Message => ({
        ...msg,
        headers: {
            ...msg.headers,
            token: tokenState.value
        }
    });

    // Setup middleware
    const setupTokenMiddleware = (): void => {
        Gun.on("opt", function(this: any, ctx: GunContext) {
            if (ctx.once) return;
            
            ctx.on("out", function(this: GunMiddleware, msg: Message) {
                const to = this.to;
                // Apply pure function to add headers
                const msgWithHeaders = addTokenToHeaders(msg);
                //console.log('[PUT HEADERS]', msgWithHeaders)
                to.next(msgWithHeaders); // pass to next middleware
            });
        });
    };

    // Initialize middleware
    setupTokenMiddleware();

    // Expose public API
    return {
        setToken,
        getToken
    };
};

// Execute the module with Gun
export const { setToken, getToken } = gunHeaderModule(Gun);

// Export the functions to global window (if in browser environment)
if (typeof window !== 'undefined') {
    (window as any).setToken = setToken;
    (window as any).getToken = getToken;
}
