// <!--# if expr="$request_uri = \/index.js" -->
	// <!--# set value="false" var="isModuleLoad" -->
"use strict";
// <!--# else -->
	// <!--# set value="true" var="isModuleLoad" -->
import { SmuttyApp } from "./SmuttyApp.mjs";
// <!--# endif -->

if (!self.requestAnimationFrame)
	self.requestAnimationFrame = self.webkitRequestAnimationFrame || self.mozRequestAnimationFrame || self.msRequestAnimationFrame || self.oRequestAnimationFrame || self.setTimeout;

(function() {
	// <!--# if expr="$isModuleLoad = false" -->
		// <!--# include file="/modules/SmuttyConstants.mjs" -->
		// <!--# include file="/modules/SmuttyInstaller.mjs" -->
		// <!--# include file="/modules/SmuttyApp.mjs" -->
		// <!--# include file="/modules/SmuttyFileUpload.mjs" -->
		// <!--# include file="/modules/SmuttyInteractionHandler.mjs" -->
		// <!--# include file="/modules/SmuttyRow.mjs" -->
	// <!--# endif -->

	function onDomContentLoaded() { SmuttyApp.init(); }

	if (self.document.readyState === "loading")
		self.document.addEventListener("DOMContentLoaded", onDomContentLoaded, { once: true, passive: true });
	else
		onDomContentLoaded();
})();