// <!--# if expr="$isModuleLoad != false" -->
import { ELEMENT_CLASSES, ELEMENT_IDS, Elements } from "./SmuttyConstants.mjs";

export
// <!--# endif -->
class SmuttyRow {
	static get fileList() { return Elements.get(ELEMENT_IDS.UPLOAD_FILELIST); }
	static get templateRow() { return Elements.get(ELEMENT_IDS.UPLOAD_FILELIST.ITEM); }
	static get templateUrl() { return Elements.get(ELEMENT_IDS.UPLOAD_FILELIST.FILE_URL); }
	static writeTextToClipboard(text) { // returns self.Promise
		if ("navigator" in self && "clipboard" in self.navigator && "writeText" in self.navigator.clipboard)
			return self.navigator.clipboard.writeText(self.String(text));
		else
			return new self.Promise((resolve) => {
				self.requestAnimationFrame(() => {
					const textArea = self.document.createElement("textarea");
					textArea.value = self.String(text);
					self.document.body.appendChild(textArea);
					textArea.select();
					self.document.execCommand("copy");
					textArea.remove();
					resolve();
				});
			});
	}
	constructor(fileName = "") {
		const template = this.constructor.templateRow.content.cloneNode(true);
		this.element = template.querySelector("li");
		self.requestAnimationFrame(() => {
			this.fileName = fileName;
			this.constructor.fileList.appendChild(template);
		});
	}
	get fileNameDisplay() { return this.element.querySelector(`.${ELEMENT_CLASSES.FILE_NAME}`); }
	get fileProgress() { return this.element.querySelector(`.${ELEMENT_CLASSES.FILE_PROGRESS}`); }
	get fileProgressContainer() { return this.element.querySelector(`.${ELEMENT_CLASSES.FILE_PROGRESS_CONTAINER}`); }
	get progressPercent() { return this.element.querySelector(`.${ELEMENT_CLASSES.PROGRESS_PERCENT}`); }
	set error(error) {
		this.initTemplateUrl().textContent = error;
		this.showUrl();
	}
	set fileName(fileName) { this.fileNameDisplay.textContent = fileName; }
	set progress({ loaded, total }) {
		if (total === 0)
			return;
		self.requestAnimationFrame(() => {
			if (total === undefined) {
				this.fileProgress.removeAttribute("value");
				this.progressPercent.removeAttribute("value");
				this.progressPercent.textContent = "";
			} else {
				const progressPercent = loaded / total;
				this.fileProgress.setAttribute("value", progressPercent);
				this.progressPercent.setAttribute("value", progressPercent);
				this.progressPercent.textContent = `${progressPercent * 100 >>> 0}%`;
			}
		});
	}
	set url(url) {
		const link = this.initTemplateUrl();
		link.textContent = url.replace(/.*?:\/\//g, "");
		link.href = url;
		this.templateUrl.querySelector("button").addEventListener("click", (event) => this.constructor.writeTextToClipboard(url).catch(console.error), { passive: true });
		this.showUrl();
	}
	initTemplateUrl() {
		this.templateUrl = this.constructor.templateUrl.content.cloneNode(true);
		return this.templateUrl.querySelector("a");
	}
	showUrl() {
		self.requestAnimationFrame(() => {
			this.fileProgressContainer.visibility = "hidden";
			this.element.removeChild(this.fileProgressContainer);
			this.element.appendChild(this.templateUrl);
		});
	}
}