function getManifest() {
    return {
        name: "La.Movie (rheno911)",
        id: "com.rheno911.lamovie",
        version: 1,
        baseUrl: "https://la.movie",
        type: "Movie",
        language: "es"
    };
}

const mainUrl = "https://la.movie";
const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": mainUrl + "/"
};

function getHome(callback) {
    http_get(mainUrl, headers, (status, html) => {
        const list = [];
        const rex = /<a href="([^"]+).*?src="([^"]+.jpg)".*?title="([^"]+)"/g;
        for (const m of html.matchAll(rex)) {
            list.push({
                name: m[3],
                link: mainUrl + m[1],
                image: m[2]
            });
        }
        callback(JSON.stringify([{ title: "La.Movie", Data: list }]));
    });
}

function search(query, callback) {
    const url = `${mainUrl}/?s=${encodeURIComponent(query)}`;
    http_get(url, headers, (status, html) => {
        const list = [];
        const rex = /<a href="([^"]+).*?src="([^"]+.jpg)".*?title="([^"]+)"/g;
        for (const m of html.matchAll(rex)) {
            list.push({
                name: m[3],
                link: mainUrl + m[1],
                image: m[2]
            });
        }
        callback(JSON.stringify([{ title: "Search", Data: list }]));
    });
}

function load(url, callback) {
    http_get(url, headers, (status, html) => {
        const title = (html.match(/<h1[^>]*>([^<]+)</h1>/i) || [])[1] || "Movie";
        callback(JSON.stringify({
            url: url,
            data: url,
            title: title,
            description: ""
        }));
    });
}

function loadStreams(dataUrl, callback) {
    http_get(dataUrl, headers, (status, html) => {
        const streams = [];
        const vimeos = html.match(/https://vimeos.net/d/[a-z0-9_]+/i);
        if (vimeos) {
            streams.push({
                name: "Vimeos",
                url: vimeos[0],
                headers: headers
            });
        }
        callback(JSON.stringify(streams.length ? streams : [{
            name: "Fallback",
            url: dataUrl,
            headers: headers
        }]));
    });
}
