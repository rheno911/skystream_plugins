const mainUrl = "https://la.movie";
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": mainUrl + "/"
};

function getManifest() {
    return {
        name: "La.Movie (rheno911)",
        id: "com.rheno911.lamovie",
        version: 1,
        baseUrl: mainUrl,
        type: "Movie",
        language: "es"
    };
}

function getHome(callback) {
    http_get(mainUrl, headers, (status, html) => {
        const list = [];
        // SkyStream expects: title, url, posterUrl (NOT name/link/image)
        const rex = /<a href="([^"]+)".*?src="([^"]+.jpg)".*?title="([^"]+)"/g;
        for (const m of html.matchAll(rex)) {
            list.push({
                title: m[3],
                url: mainUrl + m[1],
                posterUrl: m[2]
            });
        }
        callback(JSON.stringify([{ title: "Destacados", Data: list }]));
    });
}

function search(query, callback) {
    const url = `${mainUrl}/?s=${encodeURIComponent(query)}`;
    http_get(url, headers, (status, html) => {
        const list = [];
        const rex = /<a href="([^"]+)".*?src="([^"]+.jpg)".*?title="([^"]+)"/g;
        for (const m of html.matchAll(rex)) {
            list.push({
                title: m[3],
                url: mainUrl + m[1],
                posterUrl: m[2]
            });
        }
        callback(JSON.stringify([{ title: "Búsqueda", Data: list }]));
    });
}

function load(url, callback) {
    http_get(url, headers, (status, html) => {
        const title = (html.match(/<title>([^<]+)</title>/i) || [])[1] || "Movie";
        const desc = (html.match(/<meta name="description" content="([^"]+)"/i) || [])[1] || "";
        callback(JSON.stringify({
            url: url,
            data: url,
            title: title,
            description: desc
        }));
    });
}

function loadStreams(url, callback) {
    http_get(url, headers, (status, html) => {
        const streams = [];
        // Look for vimeos.net direct links
        const vimeos = html.match(/https://vimeos.net/d/[a-z0-9_]+/i);
        if (vimeos) {
            streams.push({
                name: "Vimeos 1080p",
                url: vimeos[0],
                headers: headers
            });
        }
        callback(JSON.stringify(streams.length ? streams : [{
            name: "Fallback",
            url: url,
            headers: headers
        }]));
    });
}
