import Gun from 'gun'

// Functional programming style implementation
//ts-docs
/**
 * @param {Gun} Gun
 * @returns {Object}
 */
const gunHeaderModule = (Gun) => {
    // Closure for token state
    const tokenState = {
        value: undefined
    };

    // Pure function to create a new token state
    /**
     * @param {string} newToken
     * @returns {string}
     */
    const setToken = (newToken) => {
        tokenState.value = newToken;
        setupTokenMiddleware()
        return tokenState.value;
    };

    // Pure function to retrieve token
    /**
     * @returns {string}
     */
    const getToken = () => tokenState.value;

    // Function to add token to headers
    /**
     * @param {Object} msg
     * @returns {Object}
     */
    const addTokenToHeaders = (msg) => ({
        ...msg,
        headers: {
            ...msg.headers,
            token: tokenState.value
        }
    });

    // Setup middleware
    /**
     * @returns {void}
     */
    const setupTokenMiddleware = () => {
        Gun.on("opt", function(ctx) {
            if (ctx.once) return;
            
            ctx.on("out", function(msg) {
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

// Export the functions
window.setToken = setToken;
window.getToken = getToken;
