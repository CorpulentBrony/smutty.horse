"use strict";
if (!self.requestAnimationFrame)
	self.requestAnimationFrame = self.webkitRequestAnimationFrame || self.mozRequestAnimationFrame || self.msRequestAnimationFrame || self.oRequestAnimationFrame || function(callback) { self.setTimeout(callback); };

(function() {
	const ENABLE_SERVICE_WORKER = true;

	function loadDeferredStylesheets(containerId = "deferred-stylesheets") {
		const container = self.document.getElementById(containerId);

		if (container == null)
			return;
		self.requestAnimationFrame(async () => {
			try {
				const parser = new self.DOMParser();
				const links = parser.parseFromString(container.textContent, "text/html").querySelectorAll("link");
				await self.Promise.all(self.Array.prototype.map.call(links, (link) => new self.Promise((resolve) => {
					link.addEventListener("load", resolve, { once: true, passive: true });
					self.document.head.appendChild(link);
				})));
				self.document.body.classList.add("css-loaded");
			} catch (error) { console.log(error); }
		});
	}
	async function registerServiceWorker() {
		if (!("serviceWorker" in self.navigator))
			return;
		else if (ENABLE_SERVICE_WORKER) {
			const registration = await self.navigator.serviceWorker.register("/sw.js");

			function onInstallingStateChange() {
				if (registration.installing && registration.installing.state === "installed")
					if (self.navigator.serviceWorker.controller)
						console.log("New or updated content is available. (should display message to user)");
					else
						console.log("Content is now available offline.  (maybe display message to user)");
			}

			registration.addEventListener("updatefound", () => registration.installing.addEventListener("statechange", onInstallingStateChange, { passive: true }), { passive: true });
			return registration;
		} else if ("getRegistrations" in self.navigator.serviceWorker) {
			const registrations = await self.navigator.serviceWorker.getRegistrations();
			registrations.forEach((registration) => registration.unregister().catch(console.error));
		} else
			self.navigator.serviceWorker.getRegistration("/").unregister().catch(console.error);
	}
	/* Set-up the event handlers for the <button>, <input> and the window itself
		 and also set the "js" class on selector "#upload-form", presumably to
		 allow custom styles for clients running javascript. */
	function onDomContentLoaded() {
		self.document.body.classList.add("js");
		loadDeferredStylesheets();
		registerServiceWorker().catch(console.error);
	}

	if (self.document.readyState === "loading")
		self.document.addEventListener("DOMContentLoaded", onDomContentLoaded, { once: true, passive: true });
	else
		onDomContentLoaded();
})();