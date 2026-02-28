/**
 * SkyStream Multi‑Provider Plugin by rheno911
 * Providers:
 * - La.Movie (vimeos.net)
 *
 * Repository: https://github.com/rheno911/skystream-plugins
 */

// ========== Shared Helpers ==========
function http_get_json(url, headers, callback) {
    http_get(url, headers, (status, body) => {
        try {
            callback(status, JSON.parse(body));
        } catch (e) {
            callback(status, body);
        }
    });
}

function http_get_lazy(url, fallback, headers, callback) {
    http_get(url, headers, (status, body) => {
        if (status === 200 && body) callback(status, body);
        else http_get(fallback, headers, callback);
    });
}

const globalUA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117 Safari/537.36";

// ========== PROVIDER REGISTRY ==========
const providers = {};

// ===================================================================
// Provider 1: La.Movie (Movie / Series / Anime) – vimeos.net
// ===================================================================
providers["com.skystream.lamovie.rheno911"] = (() => {
    const mainUrl = "https://la.movie";
    const headers = {
        "User-Agent": globalUA,
        Referer: mainUrl + "/"
    };

    function getManifest() {
        return {
            name: "La.Movie (rheno911)",
            id: "com.skystream.lamovie.rheno911",
            version: 1,
            baseUrl: mainUrl,
            type: "Movie",
            language: "es"
        };
    }

    function getHome(callback) {
        const url = mainUrl;
        http_get(url, headers, (status, html) => {
            const sections = [];
            const cat = html.matchAll(
                /<section[^>]*class="[^"]*category[^"]*"[^>]*[^]*?href="([^"]+)".*?title="([^"]+)"/g
            );
            for (const m of cat) {
                const name = m[2] || "Otros";
                const link = mainUrl + m[1];

                const items = [];
                const rex =
                    /<a href="([^"]+)".*?src="([^"]+.jpg|png|webp)".*?title="([^"]+)"/g;
                for (const m2 of html.matchAll(rex)) {
                    items.push({
                        name: m2[3],
                        link: mainUrl + m2[1],
                        image: m2[2],
                        description: ""
                    });
                }
                sections.push({ title: name, Data: items });
            }

            if (sections.length === 0) {
                const list = [];
                const rex =
                    /<a href="([^"]+)".*?src="([^"]+.jpg|png|webp)".*?title="([^"]+)"/g;
                for (const m of html.matchAll(rex)) {
                    list.push({
                        name: m[3],
                        link: mainUrl + m[1],
                        image: m[2],
                        description: ""
                    });
                }
                sections.push({ title: "Destacados", Data: list });
            }

            callback(JSON.stringify(sections));
        });
    }

    function search(query, callback) {
        const searchUrl = `${mainUrl}/?s=${encodeURIComponent(query)}`;
        http_get(searchUrl, headers, (status, html) => {
            const list = [];
            const rex =
                /<a href="([^"]+)".*?src="([^"]+.jpg|png|webp)".*?title="([^"]+)"/g;
            for (const m of html.matchAll(rex)) {
                list.push({
                    name: m[3],
                    link: mainUrl + m[1],
                    image: m[2],
                    description: ""
                });
            }
            callback(JSON.stringify([{ title: "Búsqueda", Data: list }]));
        });
    }

    function load(url, callback) {
        http_get(url, headers, (status, html) => {
            const $ = (s, h) =>
                (h.match(new RegExp(`<${s}[^>]*>([^<]+)<\\/${s}>`, "i")) || [])[1] || "";

            const title =
                $("h1", html) || $("title", html) || "Película/Serie";

            const desc =
                (html.match(/<meta name="description" content="([^"]+)"/i) || [])[1] ||
                (html.match(/<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</p>/i) || [])[1] ||
                "";

            const yearMatch = //fecha-de-estreno/(dddd)[^"]*"/g;
            const years = [];
            for (const m of html.matchAll(yearMatch)) years.push(m[1]);
            const yearStr = years.length > 0 ? years[years.length - 1] : "";

            const poster =
                (html.match(/<img[^>]*class="[^"]*post-thumbnail[^"]*".*?src="([^"]+.jpg|png|webp)"/i) || [])[1] ||
                (html.match(/<img[^>]*class="[^"]*thumbnail[^"]*".*?src="([^"]+.jpg|png|webp)"/i) || [])[1] ||
                "";

            const type =
                //peliculas//.test(url)
                    ? "Movie"
                    : //series//.test(url)
                    ? "Tv"
                    : //animes//.test(url)
                    ? "Anime"
                    : "Tv";

            callback(
                JSON.stringify({
                    url: url,
                    data: url,
                    title: title,
                    description: desc,
                    year: yearStr ? parseInt(yearStr) : undefined,
                    poster: poster,
                    type: type
                })
            );
        });
    }

    function loadStreams(dataUrl, callback) {
        const playUrl =
            dataUrl.includes("http") ? dataUrl : `${mainUrl}/player/${dataUrl}`;

        http_get(playUrl, headers, (status, html) => {
            const streams = [];

            const vimeosDirect = (
                html.match(/https://vimeos.net/d/[a-zA-Z0-9_]+/i) || []
            )[0];

            if (vimeosDirect) {
                streams.push({
                    name: "Vimeos Stream",
                    url: vimeosDirect,
                    headers: headers
                });
            } else {
                const iframe = (
                    html.match(/src="([^"]*vimeos.net[^"]*")/i) ||
                    html.match(/data-src="([^"]*vimeos.net[^"]*")/i) ||
                    []
                )[1];
                if (iframe) {
                    const full = iframe.startsWith("http") ? iframe : `${mainUrl}${iframe}`;
                    streams.push({
                        name: "Vimeos iframe",
                        url: full,
                        headers: headers
                    });
                }
            }

            if (streams.length === 0) {
                streams.push({
                    name: "Stream fallback",
                    url: playUrl,
                    headers: headers
                });
            }

            callback(JSON.stringify(streams));
        });
    }

    return { getManifest, getHome, search, load, loadStreams };
})();

// ===================================================================
// EXPORTS FOR SKYSTREAM
// ===================================================================

function getProviders(callback) {
    const list = Object.keys(providers).map(id => providers[id].getManifest());
    callback(JSON.stringify(list));
}

function runProvider(id, action, args, callback) {
    const p = providers[id];
    if (!p) return callback(`{"error":"Provider not found: ${id}"}`);
    if (typeof p[action] !== "function")
        return callback(`{"error":"Action not found: ${action}"}`);
    p[action].apply(null, [...args, callback]);
}
