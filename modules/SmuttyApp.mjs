// <!--# if expr="$isModuleLoad != false" -->
import { SmuttyFileUpload } from "./SmuttyFileUpload.mjs";
import { SmuttyInstaller } from "./SmuttyInstaller.mjs";
import { SmuttyInteractionHandler } from "./SmuttyInteractionHandler.mjs";

export
// <!--# endif -->
class SmuttyApp {
	static init() {
		self.addEventListener("beforeinstallprompt", this.onBeforeInstallPrompt, { once: true, passive: true });
		SmuttyInteractionHandler.init(this);
	}
	static onBeforeInstallPrompt(event) {
		this.installer = new SmuttyInstaller(event);
		self.removeEventListener("beforeinstallprompt", this.onBeforeInstallPrompt, { once: true, passive: true });
	}
	static uploadFiles(files = []) { self.Array.prototype.forEach.call(files, (file) => new SmuttyFileUpload(file)); }
	constructor() { throw new self.Error("Attempted to instantiate static class."); }
}
SmuttyApp.installer = undefined;