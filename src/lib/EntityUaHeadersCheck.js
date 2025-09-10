import fetch from "node-fetch";

let validLanguageSubtags = null;

async function EntityLoadLanguageSubtags() {
    if (validLanguageSubtags) return validLanguageSubtags;

    const res = await fetch(
        "https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry"
    );
    const text = await res.text();

    const lines = text.split("\n");
    const subtags = new Set();
    let isLanguageBlock = false;

    for (const line of lines) {
        if (line.startsWith("%%")) {
            isLanguageBlock = false;
        } else if (line.startsWith("Type: language")) {
            isLanguageBlock = true;
        } else if (isLanguageBlock && line.startsWith("Subtag:")) {
            subtags.add(line.split(":")[1].trim().toLowerCase());
        }
    }

    validLanguageSubtags = subtags;
    return validLanguageSubtags;
}

const STRICT_LANG_REGEX = /^[a-z]{2,3}(-[A-Z]{2})?$/;

export async function EntityIsValidLanguageTag(tag) {
    const [langPart] = tag.split(";").map(s => s.trim());

    if (!STRICT_LANG_REGEX.test(langPart)) return false;

    const parts = langPart.split("-");
    const language = parts[0].toLowerCase();
    const region = parts[1] ? parts[1].toUpperCase() : null;

    const subtags = await EntityLoadLanguageSubtags();

    if (!subtags.has(language)) return false;
    if (region && !/^[A-Z]{2}$/.test(region)) return false;

    return true;
}

export async function EntityValidateAcceptLanguage(header) {
    if (!header) return false;

    const tags = header.split(",").map(l => l.trim());
    for (const tag of tags) {
        if (!(await EntityIsValidLanguageTag(tag))) return false;
    }
    return true;
}

const BAD_UA_PATTERNS = /(curl|wget|python|java|node|axios|go-http-client|scrapy|phantom|selenium|headless|bot|spider|crawler)/i;

export async function EntityUaHeadersCheck(headers) {
    const userAgent = headers.get("x-visitor-user-agent") || headers.get("user-agent") || "";
    const accept = headers.get("x-visitor-accept") || headers.get("accept") || "";
    const acceptLang = headers.get("x-visitor-accept-language") || headers.get("accept-language") || "";
    const encoding = headers.get("x-visitor-accept-encoding") || headers.get("accept-encoding") || "";
    const secFetch = headers.get("x-visitor-sec-fetch-site") || headers.get("sec-fetch-site") || "";
    const secChUa = headers.get("x-visitor-sec-ch-ua") || headers.get("sec-ch-ua") || "";

    const suspiciousReasons = [];

    if (!userAgent || userAgent.length < 10 || BAD_UA_PATTERNS.test(userAgent)) {
        suspiciousReasons.push("bad_ua");
    }

    if (!accept.includes("text/html")) {
        suspiciousReasons.push("invalid_accept");
    }

    if (!(await EntityValidateAcceptLanguage(acceptLang))) {
        suspiciousReasons.push("invalid_accept_language");
    }

    if (!secChUa && /Chrome|Safari|Firefox/i.test(userAgent)) {
        suspiciousReasons.push("missing_sec_ch_ua");
    }

    if (!secFetch && /Chrome|Safari|Firefox/i.test(userAgent)) {
        suspiciousReasons.push("missing_sec_fetch");
    }

    if (!encoding.includes("gzip") && !encoding.includes("br")) {
        suspiciousReasons.push("no_encoding");
    }

    return suspiciousReasons.length > 0 ? suspiciousReasons : null;
}
