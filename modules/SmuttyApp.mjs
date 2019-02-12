// <!--# if expr="$isModuleLoad != false" -->
import { SmuttyFileUpload } from "./SmuttyFileUpload.mjs";
import { SmuttyInteractionHandler } from "./SmuttyInteractionHandler.mjs";

export
// <!--# endif -->
class SmuttyApp {
	static init() { SmuttyInteractionHandler.init(this); }
	static uploadFiles(files = []) { self.Array.prototype.forEach.call(files, (file) => new SmuttyFileUpload(file)); }
	constructor() { throw new self.Error("Attempted to instantiate static class."); }
}