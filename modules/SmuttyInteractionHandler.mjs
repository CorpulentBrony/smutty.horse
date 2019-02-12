// <!--# if expr="$isModuleLoad != false" -->
import { ELEMENT_IDS, UPLOAD_BUTTON_TEXT_ON_DRAG, Elements } from "./SmuttyConstants.mjs";

export
// <!--# endif -->
class SmuttyInteractionHandler {
	static get uploadButton() { return Elements.get(ELEMENT_IDS.UPLOAD_BUTTON); }
	static get uploadInput() { return Elements.get(ELEMENT_IDS.UPLOAD_INPUT); }
	static init(app) {
		self.Object.defineProperties(this, {
			app: { enumerable: true, value: app },
			// uploadButtonDefaultText: { enumerable: true, value: this.uploadButton.textContent }
			uploadButtonDefaultText: { enumerable: true, value: self.getComputedStyle(this.uploadButton).getPropertyValue("--upload-btn-text").trim() }
		});
		this.dragCount = 0;
		self.addEventListener("dragenter", this.handleDrag.bind(this), false);
		self.addEventListener("dragleave", this.handleDragAway.bind(this), false);
		self.addEventListener("drop", this.handleDragAway.bind(this), false);
		self.addEventListener("dragover", this.stopDefaultEvent, false);
		this.uploadInput.addEventListener("change", this.handleUploadFiles.bind(this), { passive: true });
		this.uploadButton.addEventListener("click", this.selectFiles.bind(this), false);
		this.uploadButton.addEventListener("drop", this.handleDrop.bind(this), false);
	}
	static handleDrag(event) {
		this.stopDefaultEvent(event);

		if (this.dragCount === 1)
			this.uploadButton.style.setProperty("--upload-btn-text", `"${UPLOAD_BUTTON_TEXT_ON_DRAG}"`);
			// this.uploadButton.textContent = UPLOAD_BUTTON_TEXT_ON_DRAG;
		this.dragCount++;
	}
	static handleDragAway(event) {
		this.stopDefaultEvent(event);
		this.dragCount--;

		if (this.dragCount === 0)
			this.uploadButton.style.setProperty("--upload-btn-text", this.uploadButtonDefaultText);
			// this.uploadButton.style.removeProperty("--upload-btn-text");
			// this.uploadButton.textContent = this.uploadButtonDefaultText;
	}
	static handleDrop(event) {
		this.handleDragAway(event);
		this.app.uploadFiles(event.dataTransfer.files);
	}
	static handleUploadFiles(event) { this.app.uploadFiles(event.target.files); }
	static selectFiles(event) {
		this.stopDefaultEvent(event);
		this.uploadInput.click();
	}
	static stopDefaultEvent(event) {
		event.stopPropagation();
		event.preventDefault();
	}
	constructor() { throw new self.Error("Attempted to instantiate static class."); }
}