const ELEMENT_CLASSES = {
	CLIPBOARD_BUTTON: "upload-clipboard-btn",
	FILE_MESSAGE: "file-url-copied",
	FILE_NAME: "file-name",
	FILE_PROGRESS: "file-progress",
	FILE_PROGRESS_CONTAINER: "file-progress-container",
	PROGRESS_PERCENT: "progress-percent",
	SHARE_BUTTON: "upload-share-btn"
};
const ELEMENT_IDS = {
	INSTALL_LINK: "install-link",
	UPLOAD_BUTTON: "upload-btn",
	UPLOAD_FILELIST: {
		toString() { return "upload-filelist"; },
		FILE_URL: "upload-filelist-file-url",
		ITEM: "upload-filelist-item"
	},
	UPLOAD_INPUT: "upload-input"
};
const HASH_DIGEST_ALGORITHM = "SHA-1";
const INSTALL_LINK_TITLE = "Install Smutty.Horse";
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
export { ELEMENT_CLASSES, ELEMENT_IDS, HASH_DIGEST_ALGORITHM, INSTALL_LINK_TITLE, UPLOAD_BUTTON_TEXT_ON_DRAG, UPLOAD_ENDPOINT, Elements };
// <!--# endif -->