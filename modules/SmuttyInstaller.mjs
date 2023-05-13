// <!--# if expr="$isModuleLoad != false" -->
import { ELEMENT_IDS, Elements, INSTALL_LINK_TITLE } from "./SmuttyConstants.mjs";

export
// <!--# endif -->
class SmuttyInstaller {
	static get installLinkParent() { return Elements.get(ELEMENT_IDS.INSTALL_LINK); }
	constructor(installPrompt) {
		this.installPrompt = installPrompt;
		this.createInstallLink();
	}
	get installLink() { return new this.constructor.Link(this.installPrompt); }
	createInstallLink() { this.constructor.installLinkParent.appendChild(this.installLink.element).appendChild(this.constructor.installLinkParent.firstChild); }
}
SmuttyInstaller.prototype.installPrompt = undefined;

SmuttyInstaller.Link = class Link {
	constructor(installPrompt) {
		this.addElement();
		this.installPrompt = installPrompt;
	}
	addElement() {
		if (this.element !== undefined)
			return;
		this.element = self.document.createElement("a");
		self.Object.entries(this.constructor.INSTALL_LINK_ATTRIBUTES).forEach(([attribute, value]) => this.element.setAttribute(attribute, value));
		this.element.addEventListener("click", this.onClick, { once: true, passive: true });
	}
	onClick() {
		if (!("prompt" in this.installPrompt))
			return;
		this.installPrompt.prompt();
		this.removeElement();

		if (!("userChoice" in this.installPrompt))
			return;
		this.installPrompt.userChoice.catch(self.console.error);
	}
	removeElement() {
		if (!(this.element instanceof self.Node))
			return;
		this.element.parentNode.appendChild(this.element.firstChild);
		this.element.parentNode.removeChild(this.element);
		this.element.removeEventListener("click", this.onClick, { once: true, passive: true });
		this.element = undefined;
	}
};
SmuttyInstaller.Link.INSTALL_LINK_ATTRIBUTES = { ["aria-label"]: INSTALL_LINK_TITLE, role: "button", title: INSTALL_LINK_TITLE };
SmuttyInstaller.Link.prototype.element = undefined;
SmuttyInstaller.Link.prototype.installPrompt = undefined;