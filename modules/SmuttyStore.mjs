const MESSAGE_ERROR_ABSTRACT_UNIMPLEMENTED_METHOD = "Unimplemented SmuttyStoreAccessor.StatefulAbstract method.";
const MESSAGE_ERROR_INSTANTION = "Attempted to instantiate uninstantiable class.";
const MESSAGE_ERROR_INTERFACE_UNIMPLEMENTED_METHOD = "Unimplemented SmuttyStoreInterface method.";
const STORAGE_KEY_NAME = "SmuttyLocalStore";
const IMPLEMENTED_ACCESSOR_TYPES = ["LocalStorage", "Cookie", "WindowName", "Window", "Stateless"];

/* SmuttyStoreError - Common Errors */
class SmuttyStoreError extends self.Error {}

/* SmuttyStoreInterface - common methods that must be implemented by SmuttyStore and any of its accessors */
class SmuttyStoreInterface {
	static clear() { throw new this.Error.UnimplementedMethod(); }
	static delete(key) { throw new this.Error.UnimplementedMethod(); }
	static entry(key, callbackOrValue) { throw new this.Error.UnimplementedMethod(); }
	static get(key) { throw new this.Error.UnimplementedMethod(); }
	static has(key) { throw new this.Error.UnimplementedMethod(); }
	static set(key, value) { throw new this.Error.UnimplementedMethod(); }
	constructor() { throw new this.constructor.Error.Instantiation(); }
}
SmuttyStoreInterface.Error = class Error extends SmuttyStoreError {};
SmuttyStoreInterface.Error.Instantiation = class Instantiation extends SmuttyStoreInterface.Error {
	constructor() { super(MESSAGE_ERROR_INSTANTION); }
};
SmuttyStoreInterface.Error.UnimplementedMethod = class UnimplementedMethod extends SmuttyStoreInterface.Error {
	constructor() { super(MESSAGE_ERROR_INTERFACE_UNIMPLEMENTED_METHOD); }
};

/* SmuttyStore - allows for storage of values, possibly persistent or non-persistent; automatically picks the best implementation available */
// <!--# if expr="$isModuleLoad != false" -->
export
// <!--# endif -->
class SmuttyStore extends SmuttyStoreInterface {
	static get accessorType() { return this._accessor.name; }
	static get _accessor() {
		if (this.__accessor)
			return this.__accessor;

		for (let i = 0; i < IMPLEMENTED_ACCESSOR_TYPES.length; i++)
			if (SmuttyStoreAccessor[IMPLEMENTED_ACCESSOR_TYPES[i]].isSupported())
				return this.__accessor = SmuttyStoreAccessor[IMPLEMENTED_ACCESSOR_TYPES[i]];
	}
	static clear() { this._accessor.clear(); }
	static delete(key) { this._accessor.delete(key); }
	static entry(key, callbackOrValue) { return this._accessor.entry(key, callbackOrValue); }
	static get(key) { return this._accessor.get(key); }
	static has(key) { return this._accessor.has(key); }
	static set(key, value) { this._accessor.set(key, value); }
	constructor() { throw new SmuttyStoreAccessor.Interface.Error.Instantiation(); }
}
SmuttyStore.__accessor = undefined;

/* SmuttyStoreAccessor - namespace for the different accessor implementations */
const SmuttyStoreAccessor = {};

/* SmuttyStoreAccessor.Interface - methods an accessor implementation must implement */
SmuttyStoreAccessor.Interface = class Interface extends SmuttyStoreInterface {
	static get _store() { throw new this.Error.UnimplementedMethod(); }
	static isSupported() { throw new this.Error.UnimplementedMethod(); }
};

/* SmuttyStoreAccessor.Abstract - common methods for all accessor implementations */
SmuttyStoreAccessor.Abstract = class Abstract extends SmuttyStoreAccessor.Interface {
	static get _store() { throw new this.Error.UnimplementedMethod(); }
	static clear() { this._store.clear(); }
	static delete(key) { this._store.delete(key); }
	static entry(key, callbackOrValue) {
		if (!this.has(key))
			this.set(key, (callbackOrValue instanceof self.Function) ? callbackOrValue.call(undefined) : callbackorValue);
		return this.get(key);
	}
	static get(key) { return this._store.get(key); }
	static has(key) { return this._store.has(key); }
	static set(key, value) { this._store.set(key, value); }
}

/* SmuttyStoreAccessor.Stateless - an implementation that relies on non-persistent memory storage; a fallback */
SmuttyStoreAccessor.Stateless = class Stateless extends SmuttyStoreAccessor.Abstract {
	static get _store() {
		if (this.__store)
			return this.__store;
		return this.__store = new self.Map();
	}
	static isSupported() { return "Map" in self; }
};
SmuttyStoreAccessor.Stateless.__store = undefined;

/* SmuttyStoreAccessor.StatefulAbstract - common methods for all stateful (persistent) accessor implementations */
SmuttyStoreAccessor.StatefulAbstract = class StatefulAbstract extends SmuttyStoreAccessor.Abstract {
	static clear() {
		super.clear();
		this._writeCache();
	}
	static delete(key) {
		super.delete(key);
		this._writeCache();
	}
	static set(key, value) {
		super.set(key, value);
		this._writeCache();
	}
	static _writeCache(store) { throw new this.UnimplementedMethodError(); }
};
SmuttyStoreAccessor.StatefulAbstract.UnimplementedMethodError = class UnimplementedMethodError extends SmuttyStoreAccessor.StatefulAbstract.Error {
	constructor() { super(MESSAGE_ERROR_ABSTRACT_UNIMPLEMENTED_METHOD); }
};

/* SmuttyStoreAccessor.Cookie - accessor implementation leveraging cookie storage; based on: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework */
SmuttyStoreAccessor.Cookie = class Cookie extends SmuttyStoreAccessor.StatefulAbstract {
	static get _store() {
		if (this.__store)
			return this.__store;
		const cookieString = self.decodeURIComponent(self.document.cookie.replace(new self.RegExp(`(?:(?:^|.*;)\\s*${self.encodeURIComponent(STORAGE_KEY_NAME).replace(/[\-\.\+\*]/g, "\\$&")}\\s*\\=\\s*([^;]*).*$)|^.*$`), "$1")) || null;
		return this.__store = (cookieString === null) ? new self.Map() : new self.Map(self.JSON.parse(cookieString));
	}
	static isSupported() {
		if ("cookieEnabled" in self.navigator)
			return self.navigator.cookieEnabled;

		try {
			self.document.cookie = "TwilightSparkleIsBestPony=true";
			const result = self.document.cookie.indexOf("TwilightSparkleIsBestPony=") !== -1;
			self.document.cookie = "TwilightSparkleIsBestPony=true; expires=Thu, 01-Jan-1970 00:00:01 GMT";
			return result;
		} catch (error) { return false; }
	}
	static _writeCache(store) {
		self.requestAnimationFrame(() => {
			if (/^(?:expires|max\-age|path|domain|secure)$/i.test(STORAGE_KEY_NAME))
				return;
			self.document.cookie = `${self.encodeURIComponent(STORAGE_KEY_NAME)}=${self.encodeURIComponent(self.JSON.stringify(self.Array.from(this._store)))}; expires=Fri, 31 Dec 9999 23:59:59 GMT; secure; samesite=strict`;
		});
	}
};

/* SmuttyStoreAccessor.LocalStorage - accessor implementation leveraging localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage */
SmuttyStoreAccessor.LocalStorage = class LocalStorage extends SmuttyStoreAccessor.StatefulAbstract {
	static get _store() {
		if (this.__store)
			return this.__store;
		const localStorageString = self.localStorage.getItem(STORAGE_KEY_NAME);
		return this.__store = (localStorageString === null) ? new self.Map() : new self.Map(self.JSON.parse(localStorageString));
	}
	static isSupported() {
		try {
			const test = "TwilightSparkleIsBestPony";
			self.localStorage.setItem(test, test);
			self.localStorage.removeItem(test);
			return true;
		} catch (error) { return false; }
	}
	static _writeCache(store) { self.requestAnimationFrame(() => self.localStorage.setItem(STORAGE_KEY_NAME, self.JSON.stringify(self.Array.from(this._store)))); }
};

/* SmuttyStoreAccessor.Window - fallback accessor that should be persistent between page loads/refreshes, just stores data in a variable on the self object */
SmuttyStoreAccessor.Window = class Window extends SmuttyStoreAccessor.StatefulAbstract {
	static get _store() {
		if (this.__store)
			return this.__store;
		return this.__store = (self[STORAGE_KEY_NAME] instanceof self.Map) ? self[STORAGE_KEY_NAME] : new self.Map();
	}
	static isSupported() {
		try {
			const test = "TwilightSparkleIsBestPony";
			self[test] = new self.Map();
			delete self[test];
			return true;
		} catch (error) { return false; }
	}
	static _writeCache(store) { self.requestAnimationFrame(() => self[STORAGE_KEY_NAME] = this._store); }
};

/* SmuttyStoreAccessor.WindowName - a bit hacky, makes use of the fact self.name is persistent across page loads in the same tab: https://stackoverflow.com/questions/10567847/window-name-as-a-data-transport-a-valid-approach */
SmuttyStoreAccessor.WindowName = class WindowName extends SmuttyStoreAccessor.StatefulAbstract {
	static get _store() {
		if (this.__store)
			return this.__store;

		try { return this.__store = new self.Map(self.JSON.parse(self.name)); }
		catch (error) { return this.__store = new self.Map(); }
	}
	static isSupported() { return "name" in self; }
	static _writeCache(store) { self.requestAnimationFrame(() => self.name = self.JSON.stringify(self.Array.from(this._store))); }
};