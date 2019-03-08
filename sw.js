"use strict";

// https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading
// https://developers.google.com/web/fundamentals/app-install-banners/
// maybe use this?  https://developers.google.com/web/tools/workbox/

const CACHE_VERSION = 45;
const CACHE_NAME = `smutty-horse-cache-version-${self.String(CACHE_VERSION)}`;
const CACHE_OPTIONS = { ignoreSearch: false };
const DOMAIN = "smutty.horse";
const FILES_CACHED_MAP = [
	{ [""]: [
		"",
		"app.js",
		"favicon.ico",
		"favicon.png",
		{ img: ["copy.svg"] },
		"pomf.css"
	] },
	"https://www.google-analytics.com/analytics.js",
	"https://www.googletagmanager.com/gtag/js?id=UA-53253741-14"
];
const FILES_NOT_CACHED = ["/ngx_pagespeed_beacon", "/upload.php"];
const FILES_UPDATED_CACHED = ["/", "/faq.html", "/index.html", "/tools.html"];

const CACHE = self.caches.open(CACHE_NAME);

class SmuttyRequest {
	constructor(request) {
		this._cache = CACHE;
		this._request = request;
		this._url = new self.URL(this.request.url);
	}
	get cache() { return this._cache; }
	get request() { return this._request; }
	get url() { return this._url; }
	checkFiles(files, isThisDomain = true) { return isThisDomain ? (this.url.host === DOMAIN && files.includes(this.url.pathname)) : (this.url.host !== DOMAIN && files.includes(this.url.href)); }
	fetch() {
		if (this.request.mode === "navigate")
			return self.fetch(this.request);
		return self.fetch(this.request, this.constructor.FETCH_OPTIONS);
	}
	async fetchAndCache() {
		const cachedResponse = await this.fetchFromCache();

		if (cachedResponse) {
			if (this.checkFiles(FILES_UPDATED_CACHED))
				this.insertIntoCache(this.fetch().catch(console.error)).catch(console.error);
			return cachedResponse;
		}

		try {
			const response = await this.fetch();
			this.insertIntoCache(response.clone()).catch(console.error);
			return response;
		} catch (e) {
			if (this.url.pathname.startsWith(this.constructor.GRILL_PATH_PREFIX))
				return this.fetchRandomCachedGrill();
		}
	}
	async fetchFromCache() {
		const cache = await this.cache;
		return cache.match(this.request, CACHE_OPTIONS);
	}
	fetchNoCache() { return this.fetch(this.request).catch(console.error); }
	async fetchRandomCachedGrill() {
		const cache = await this.cache;
		const fileName = this.url.pathname.substr(this.url.pathname.lastIndexOf("/") + 1);
		const cachedRequests = await cache.keys();
		const matchingRequests = cachedRequests.filter((request) => request.url.endsWith(fileName));
		return cache.match(matchingRequests[self.Math.random() * matchingRequests.length >>> 0]);
	}
	async insertIntoCache(response) {
		const responseResolved = await self.Promise.resolve(response);

		if (responseResolved && responseResolved.status < 400) {
			const cache = await this.cache;
			return cache.put(this.request, responseResolved);
		}
	}
}
SmuttyRequest.FETCH_OPTIONS = { mode: "no-cors" };
SmuttyRequest.GRILL_PATH_PREFIX = "/img/grill/";

class SmuttyEventRequest extends SmuttyRequest {
	static onFetch(event) {
		const request = new SmuttyEventRequest(event);
		request.fetchHandler();
	}
	constructor(event) {
		super(event.request);
		this._event = event;
	}
	get event() { return this._event; }
	async fetchAndCache() {
		try {
			const preloadedResponse = await self.Promise.resolve(this.event.preloadResponse);

			if (preloadedResponse) {
				if (this.checkFiles(FILES_UPDATED_CACHED))
					this.insertIntoCache(this.fetch().catch(console.error)).catch(console.error);
				return preloadedResponse;
			}
		} catch (e) { console.error(e); }
		return super.fetchAndCache();
	}
	fetchHandler() {
		if (this.checkFiles(FILES_NOT_CACHED) || this.constructor.GOOGLE_ANALYTICS_COLLECTOR_PREFIX.some((prefix) => this.url.href.startsWith(prefix)))
			return this.event.respondWith(this.fetch().catch(console.error));
		return this.event.respondWith(this.fetchAndCache().catch(console.error));
	}
}
SmuttyEventRequest.GOOGLE_ANALYTICS_COLLECTOR_PREFIX = ["https://www.google-analytics.com/collect", "https://www.google-analytics.com/r/collect"];

function expandFileList(fileList = [], prefix = "") {
	return fileList.reduce((result, entry) => {
		if (typeof entry === "string")
			result.push(prefix + entry);
		else if (typeof entry === "object") {
			const entryKey = self.Object.keys(entry)[0];
			result = result.concat(expandFileList(entry[entryKey], `${prefix}${entryKey}/`));
		}
		return result;
	}, []);
}
async function insertIntoCache(request, response) {
	if (response.status < 400) {
		const cache = await CACHE;
		return cache.put(request, response);
	}
}
async function onActivate() {
	const keys = await self.caches.keys();
	const response = keys.filter((key) => key !== CACHE_NAME).map((key) => self.caches.delete(key).catch(console.error));

	if (self.registration.navigationPreload)
		await self.registration.navigationPreload.enable();
	return self.Promise.all(response);
}
function onInstall() {
	return self.Promise.all(FILES_CACHED.map(async (file) => insertIntoCache(file, await self.fetch(file, { mode: "no-cors" })))).catch(console.error);
}

const FILES_CACHED = expandFileList(FILES_CACHED_MAP);

self.addEventListener("activate", (event) => event.waitUntil(onActivate().catch(console.error)));
self.addEventListener("fetch", SmuttyEventRequest.onFetch);
self.addEventListener("install", (event) => event.waitUntil(onInstall().catch(console.error)));