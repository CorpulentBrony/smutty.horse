// <!--# if expr="$isModuleLoad != false" -->
import { HASH_DIGEST_ALGORITHM, UPLOAD_ENDPOINT } from "./SmuttyConstants.mjs";
import { SmuttyRow } from "./SmuttyRow.mjs";
// import { SmuttyStore } from "./SmuttyStore.mjs";

export
// <!--# endif -->
class SmuttyFileUpload {
	constructor(file) {
		self.Object.defineProperties(this, {
			file: { enumerable: true, value: file },
			handlers: { enumerable: true, value: { progress: this.handleProgress.bind(this) } },
			row: { enumerable: true, value: new SmuttyRow(file.name) }
		});
		this.handleUpload().catch(console.error);
	}
	async getIsFileAlreadyUploaded() {
		const result = new self.Promise(async (resolve, reject) => {
			const fileReader = new self.FileReader();
			fileReader.addEventListener("load", async (event) => {
				try {
					const digestArray = new self.Uint8Array(await self.crypto.subtle.digest(HASH_DIGEST_ALGORITHM, event.target.result));
					const hash = self.Array.prototype.map.call(digestArray, (value) => value.toString(16).padStart(2, "0")).join("");
					const search = new self.URLSearchParams({ hash, name: this.file.name, size: this.file.size });
					const response = await self.fetch(`${UPLOAD_ENDPOINT}?${search.toString()}`, { importance: "high" });
					const result = await response.json();
					fileReader.removeEventListener("error", reject, { once: true, passive: true });
					fileReader.removeEventListener("progress", this.handlers.progress, { passive: true });

					if (result.success) {
						this.row.url = result.files[0].url;
						resolve();
					} else
						reject();
				} catch(e) { reject(); }
			}, { once: true, passive: true });
			fileReader.addEventListener("progress", this.handlers.progress, { passive: true });
			fileReader.addEventListener("error", reject, { once: true, passive: true });
			fileReader.readAsArrayBuffer(this.file);
		});
		try { await result; }
		catch (e) { return false; }
		return true;
	}
	handleProgress(event) {
		if (event.lengthComputable)
			this.row.progress = event;
	}
	async handleUpload() {
		// const isFileAlreadyUploaded = await this.getIsFileAlreadyUploaded();

		// if (isFileAlreadyUploaded)
		// 	return;
		this.uploadFile();
	}
	handleUploadComplete({ target: xhr }) {
		xhr.upload.removeEventListener("progress", this.handlers.progress, { passive: true });

		if (xhr.status === 200) {
			const response = self.JSON.parse(xhr.responseText);

			if (response.success) {
				this.row.url = response.files[0].url;
				// SmuttyStore.entry("uploadedFiles", () => []).push(response.files[0]);
			}
			else
				this.row.error = "Error: " + response.description;
		} else if (xhr.status === 413)
			this.row.error = "File too big!";
		else
			this.row.error = "Server error!";
	}
	uploadFile() {
		const xhr = new self.XMLHttpRequest();
		xhr.open("POST", UPLOAD_ENDPOINT);
		xhr.addEventListener("load", this.handleUploadComplete.bind(this), { once: true, passive: true });
		xhr.upload.addEventListener("progress", this.handlers.progress, { passive: true });
		const form = new self.FormData();
		form.append("files[]", this.file);
		xhr.send(form);
	}
}