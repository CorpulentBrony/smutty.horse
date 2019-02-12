const ELEMENT_CLASSES = { FILE_NAME: "file-name", FILE_PROGRESS: "file-progress", FILE_PROGRESS_CONTAINER: "file-progress-container", PROGRESS_PERCENT: "progress-percent" };
const ELEMENT_IDS = {
	UPLOAD_BUTTON: "upload-btn",
	UPLOAD_FILELIST: {
		toString() { return "upload-filelist"; },
		FILE_URL: "upload-filelist-file-url",
		ITEM: "upload-filelist-item"
	},
	UPLOAD_INPUT: "upload-input"
};
const HASH_DIGEST_ALGORITHM = "SHA-1";
const UPLOAD_BUTTON_TEXT_ON_DRAG = "Drop it here~";
const UPLOAD_ENDPOINT = "/upload.php";

const Elements = {
	get(elementId, parent = self.document) {
		elementId = self.String(elementId);

		if (elementId in this)
			return this[elementId];
		return self.Object.defineProperty(this, elementId, { enumerable: true, value: parent.getElementById(elementId) })[elementId];
	}
};

// <!--# if expr="$isModuleLoad != false" -->
export { ELEMENT_CLASSES, ELEMENT_IDS, HASH_DIGEST_ALGORITHM, UPLOAD_BUTTON_TEXT_ON_DRAG, UPLOAD_ENDPOINT, Elements };
// <!--# endif -->