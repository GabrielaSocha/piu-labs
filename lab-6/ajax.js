class Ajax {
    constructor(options = {}) {
        this.defaultOptions = {
            baseURL: '',
            timeout: 5000,
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
            headers: {
                ...(options.headers || {}),
                ...(options.headers
                    ? options.headers
                    : { 'Content-Type': 'application/json' }),
            },
        };
    }

    async _request(method, url, data, options = {}) {
        const merged = {
            ...this.defaultOptions,
            ...options,
            headers: {
                ...(this.defaultOptions.headers || {}),
                ...(options.headers || {}),
            },
        };

        const fullUrl = merged.baseURL
            ? new URL(url, merged.baseURL).toString()
            : url;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), merged.timeout);

        const fetchOptions = {
            method,
            headers: merged.headers,
            signal: controller.signal,
        };

        if (data !== undefined) {
            fetchOptions.body = JSON.stringify(data);
        }

        let response;

        try {
            response = await fetch(fullUrl, fetchOptions);
        } catch (err) {
            clearTimeout(timeoutId);

            if (err.name === 'AbortError') {
                throw new Error('Przekroczono limit czasu żądania');
            }

            throw new Error('Błąd sieci');
        }

        clearTimeout(timeoutId);

        let json;
        try {
            json = await response.json();
        } catch {
            json = null;
        }

        if (!response.ok) {
            const msg =
                (json && json.message) || `Błąd HTTP ${response.status}`;
            throw new Error(msg);
        }

        return json;
    }

    async get(url, options) {
        return this._request('GET', url, undefined, options);
    }

    async post(url, data, options) {
        return this._request('POST', url, data, options);
    }

    async put(url, data, options) {
        return this._request('PUT', url, data, options);
    }

    async delete(url, options) {
        return this._request('DELETE', url, undefined, options);
    }
}
