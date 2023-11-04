(() => {
    "use strict";
    const flsModules = {};
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(webP.height == 2);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = support === true ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    let bodyLockStatus = true;
    let bodyLockToggle = (delay = 500) => {
        if (document.documentElement.classList.contains("lock")) bodyUnlock(delay); else bodyLock(delay);
    };
    let bodyUnlock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                body.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let body = document.querySelector("body");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            }
            body.style.paddingRight = window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuInit() {
        if (document.querySelector(".icon-menu")) document.addEventListener("click", (function(e) {
            if (bodyLockStatus && e.target.closest(".icon-menu")) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        }));
    }
    function FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }
    class Popup {
        constructor(options) {
            let config = {
                logging: true,
                init: true,
                attributeOpenButton: "data-popup",
                attributeCloseButton: "data-close",
                fixElementSelector: "[data-lp]",
                youtubeAttribute: "data-popup-youtube",
                youtubePlaceAttribute: "data-popup-youtube-place",
                setAutoplayYoutube: true,
                classes: {
                    popup: "popup",
                    popupContent: "popup__content",
                    popupActive: "popup_show",
                    bodyActive: "popup-show"
                },
                focusCatch: true,
                closeEsc: true,
                bodyLock: true,
                hashSettings: {
                    location: true,
                    goHash: true
                },
                on: {
                    beforeOpen: function() {},
                    afterOpen: function() {},
                    beforeClose: function() {},
                    afterClose: function() {}
                }
            };
            this.youTubeCode;
            this.isOpen = false;
            this.targetOpen = {
                selector: false,
                element: false
            };
            this.previousOpen = {
                selector: false,
                element: false
            };
            this.lastClosed = {
                selector: false,
                element: false
            };
            this._dataValue = false;
            this.hash = false;
            this._reopen = false;
            this._selectorOpen = false;
            this.lastFocusEl = false;
            this._focusEl = [ "a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])' ];
            this.options = {
                ...config,
                ...options,
                classes: {
                    ...config.classes,
                    ...options?.classes
                },
                hashSettings: {
                    ...config.hashSettings,
                    ...options?.hashSettings
                },
                on: {
                    ...config.on,
                    ...options?.on
                }
            };
            this.bodyLock = false;
            this.options.init ? this.initPopups() : null;
        }
        initPopups() {
            this.popupLogging(`Проснулся`);
            this.eventsPopup();
        }
        eventsPopup() {
            document.addEventListener("click", function(e) {
                const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
                if (buttonOpen) {
                    e.preventDefault();
                    this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                    this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
                    if (this._dataValue !== "error") {
                        if (!this.isOpen) this.lastFocusEl = buttonOpen;
                        this.targetOpen.selector = `${this._dataValue}`;
                        this._selectorOpen = true;
                        this.open();
                        return;
                    } else this.popupLogging(`Ой ой, не заполнен атрибут у ${buttonOpen.classList}`);
                    return;
                }
                const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
                if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
            }.bind(this));
            document.addEventListener("keydown", function(e) {
                if (this.options.closeEsc && e.which == 27 && e.code === "Escape" && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
                if (this.options.focusCatch && e.which == 9 && this.isOpen) {
                    this._focusCatch(e);
                    return;
                }
            }.bind(this));
            if (this.options.hashSettings.goHash) {
                window.addEventListener("hashchange", function() {
                    if (window.location.hash) this._openToHash(); else this.close(this.targetOpen.selector);
                }.bind(this));
                window.addEventListener("load", function() {
                    if (window.location.hash) this._openToHash();
                }.bind(this));
            }
        }
        open(selectorValue) {
            if (bodyLockStatus) {
                this.bodyLock = document.documentElement.classList.contains("lock") && !this.isOpen ? true : false;
                if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
                    this.targetOpen.selector = selectorValue;
                    this._selectorOpen = true;
                }
                if (this.isOpen) {
                    this._reopen = true;
                    this.close();
                }
                if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
                if (!this._reopen) this.previousActiveElement = document.activeElement;
                this.targetOpen.element = document.querySelector(this.targetOpen.selector);
                if (this.targetOpen.element) {
                    if (this.youTubeCode) {
                        const codeVideo = this.youTubeCode;
                        const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;
                        const iframe = document.createElement("iframe");
                        iframe.setAttribute("allowfullscreen", "");
                        const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
                        iframe.setAttribute("allow", `${autoplay}; encrypted-media`);
                        iframe.setAttribute("src", urlVideo);
                        if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
                            this.targetOpen.element.querySelector(".popup__text").setAttribute(`${this.options.youtubePlaceAttribute}`, "");
                        }
                        this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
                    }
                    if (this.options.hashSettings.location) {
                        this._getHash();
                        this._setHash();
                    }
                    this.options.on.beforeOpen(this);
                    document.dispatchEvent(new CustomEvent("beforePopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.targetOpen.element.classList.add(this.options.classes.popupActive);
                    document.documentElement.classList.add(this.options.classes.bodyActive);
                    if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
                    this.targetOpen.element.setAttribute("aria-hidden", "false");
                    this.previousOpen.selector = this.targetOpen.selector;
                    this.previousOpen.element = this.targetOpen.element;
                    this._selectorOpen = false;
                    this.isOpen = true;
                    setTimeout((() => {
                        this._focusTrap();
                    }), 50);
                    this.options.on.afterOpen(this);
                    document.dispatchEvent(new CustomEvent("afterPopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.popupLogging(`Открыл попап`);
                } else this.popupLogging(`Ой ой, такого попапа нет.Проверьте корректность ввода. `);
            }
        }
        close(selectorValue) {
            if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") this.previousOpen.selector = selectorValue;
            if (!this.isOpen || !bodyLockStatus) return;
            this.options.on.beforeClose(this);
            document.dispatchEvent(new CustomEvent("beforePopupClose", {
                detail: {
                    popup: this
                }
            }));
            if (this.youTubeCode) if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = "";
            this.previousOpen.element.classList.remove(this.options.classes.popupActive);
            this.previousOpen.element.setAttribute("aria-hidden", "true");
            if (!this._reopen) {
                document.documentElement.classList.remove(this.options.classes.bodyActive);
                !this.bodyLock ? bodyUnlock() : null;
                this.isOpen = false;
            }
            this._removeHash();
            if (this._selectorOpen) {
                this.lastClosed.selector = this.previousOpen.selector;
                this.lastClosed.element = this.previousOpen.element;
            }
            this.options.on.afterClose(this);
            document.dispatchEvent(new CustomEvent("afterPopupClose", {
                detail: {
                    popup: this
                }
            }));
            setTimeout((() => {
                this._focusTrap();
            }), 50);
            this.popupLogging(`Закрыл попап`);
        }
        _getHash() {
            if (this.options.hashSettings.location) this.hash = this.targetOpen.selector.includes("#") ? this.targetOpen.selector : this.targetOpen.selector.replace(".", "#");
        }
        _openToHash() {
            let classInHash = document.querySelector(`.${window.location.hash.replace("#", "")}`) ? `.${window.location.hash.replace("#", "")}` : document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` : null;
            const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace(".", "#")}"]`);
            if (buttons && classInHash) this.open(classInHash);
        }
        _setHash() {
            history.pushState("", "", this.hash);
        }
        _removeHash() {
            history.pushState("", "", window.location.href.split("#")[0]);
        }
        _focusCatch(e) {
            const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
            const focusArray = Array.prototype.slice.call(focusable);
            const focusedIndex = focusArray.indexOf(document.activeElement);
            if (e.shiftKey && focusedIndex === 0) {
                focusArray[focusArray.length - 1].focus();
                e.preventDefault();
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus();
                e.preventDefault();
            }
        }
        _focusTrap() {
            const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
            if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
        }
        popupLogging(message) {
            this.options.logging ? FLS(`[Попапос]: ${message}`) : null;
        }
    }
    flsModules.popup = new Popup({});
    function ssr_window_esm_isObject(obj) {
        return obj !== null && typeof obj === "object" && "constructor" in obj && obj.constructor === Object;
    }
    function extend(target, src) {
        if (target === void 0) target = {};
        if (src === void 0) src = {};
        Object.keys(src).forEach((key => {
            if (typeof target[key] === "undefined") target[key] = src[key]; else if (ssr_window_esm_isObject(src[key]) && ssr_window_esm_isObject(target[key]) && Object.keys(src[key]).length > 0) extend(target[key], src[key]);
        }));
    }
    const ssrDocument = {
        body: {},
        addEventListener() {},
        removeEventListener() {},
        activeElement: {
            blur() {},
            nodeName: ""
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        getElementById() {
            return null;
        },
        createEvent() {
            return {
                initEvent() {}
            };
        },
        createElement() {
            return {
                children: [],
                childNodes: [],
                style: {},
                setAttribute() {},
                getElementsByTagName() {
                    return [];
                }
            };
        },
        createElementNS() {
            return {};
        },
        importNode() {
            return null;
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        }
    };
    function ssr_window_esm_getDocument() {
        const doc = typeof document !== "undefined" ? document : {};
        extend(doc, ssrDocument);
        return doc;
    }
    const ssrWindow = {
        document: ssrDocument,
        navigator: {
            userAgent: ""
        },
        location: {
            hash: "",
            host: "",
            hostname: "",
            href: "",
            origin: "",
            pathname: "",
            protocol: "",
            search: ""
        },
        history: {
            replaceState() {},
            pushState() {},
            go() {},
            back() {}
        },
        CustomEvent: function CustomEvent() {
            return this;
        },
        addEventListener() {},
        removeEventListener() {},
        getComputedStyle() {
            return {
                getPropertyValue() {
                    return "";
                }
            };
        },
        Image() {},
        Date() {},
        screen: {},
        setTimeout() {},
        clearTimeout() {},
        matchMedia() {
            return {};
        },
        requestAnimationFrame(callback) {
            if (typeof setTimeout === "undefined") {
                callback();
                return null;
            }
            return setTimeout(callback, 0);
        },
        cancelAnimationFrame(id) {
            if (typeof setTimeout === "undefined") return;
            clearTimeout(id);
        }
    };
    function ssr_window_esm_getWindow() {
        const win = typeof window !== "undefined" ? window : {};
        extend(win, ssrWindow);
        return win;
    }
    function deleteProps(obj) {
        const object = obj;
        Object.keys(object).forEach((key => {
            try {
                object[key] = null;
            } catch (e) {}
            try {
                delete object[key];
            } catch (e) {}
        }));
    }
    function utils_nextTick(callback, delay) {
        if (delay === void 0) delay = 0;
        return setTimeout(callback, delay);
    }
    function utils_now() {
        return Date.now();
    }
    function utils_getComputedStyle(el) {
        const window = ssr_window_esm_getWindow();
        let style;
        if (window.getComputedStyle) style = window.getComputedStyle(el, null);
        if (!style && el.currentStyle) style = el.currentStyle;
        if (!style) style = el.style;
        return style;
    }
    function utils_getTranslate(el, axis) {
        if (axis === void 0) axis = "x";
        const window = ssr_window_esm_getWindow();
        let matrix;
        let curTransform;
        let transformMatrix;
        const curStyle = utils_getComputedStyle(el);
        if (window.WebKitCSSMatrix) {
            curTransform = curStyle.transform || curStyle.webkitTransform;
            if (curTransform.split(",").length > 6) curTransform = curTransform.split(", ").map((a => a.replace(",", "."))).join(", ");
            transformMatrix = new window.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
        } else {
            transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
            matrix = transformMatrix.toString().split(",");
        }
        if (axis === "x") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); else curTransform = parseFloat(matrix[4]);
        if (axis === "y") if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); else curTransform = parseFloat(matrix[5]);
        return curTransform || 0;
    }
    function utils_isObject(o) {
        return typeof o === "object" && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === "Object";
    }
    function isNode(node) {
        if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") return node instanceof HTMLElement;
        return node && (node.nodeType === 1 || node.nodeType === 11);
    }
    function utils_extend() {
        const to = Object(arguments.length <= 0 ? void 0 : arguments[0]);
        const noExtend = [ "__proto__", "constructor", "prototype" ];
        for (let i = 1; i < arguments.length; i += 1) {
            const nextSource = i < 0 || arguments.length <= i ? void 0 : arguments[i];
            if (nextSource !== void 0 && nextSource !== null && !isNode(nextSource)) {
                const keysArray = Object.keys(Object(nextSource)).filter((key => noExtend.indexOf(key) < 0));
                for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
                    const nextKey = keysArray[nextIndex];
                    const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== void 0 && desc.enumerable) if (utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]); else if (!utils_isObject(to[nextKey]) && utils_isObject(nextSource[nextKey])) {
                        to[nextKey] = {};
                        if (nextSource[nextKey].__swiper__) to[nextKey] = nextSource[nextKey]; else utils_extend(to[nextKey], nextSource[nextKey]);
                    } else to[nextKey] = nextSource[nextKey];
                }
            }
        }
        return to;
    }
    function utils_setCSSProperty(el, varName, varValue) {
        el.style.setProperty(varName, varValue);
    }
    function animateCSSModeScroll(_ref) {
        let {swiper, targetPosition, side} = _ref;
        const window = ssr_window_esm_getWindow();
        const startPosition = -swiper.translate;
        let startTime = null;
        let time;
        const duration = swiper.params.speed;
        swiper.wrapperEl.style.scrollSnapType = "none";
        window.cancelAnimationFrame(swiper.cssModeFrameID);
        const dir = targetPosition > startPosition ? "next" : "prev";
        const isOutOfBound = (current, target) => dir === "next" && current >= target || dir === "prev" && current <= target;
        const animate = () => {
            time = (new Date).getTime();
            if (startTime === null) startTime = time;
            const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
            const easeProgress = .5 - Math.cos(progress * Math.PI) / 2;
            let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
            if (isOutOfBound(currentPosition, targetPosition)) currentPosition = targetPosition;
            swiper.wrapperEl.scrollTo({
                [side]: currentPosition
            });
            if (isOutOfBound(currentPosition, targetPosition)) {
                swiper.wrapperEl.style.overflow = "hidden";
                swiper.wrapperEl.style.scrollSnapType = "";
                setTimeout((() => {
                    swiper.wrapperEl.style.overflow = "";
                    swiper.wrapperEl.scrollTo({
                        [side]: currentPosition
                    });
                }));
                window.cancelAnimationFrame(swiper.cssModeFrameID);
                return;
            }
            swiper.cssModeFrameID = window.requestAnimationFrame(animate);
        };
        animate();
    }
    function utils_elementChildren(element, selector) {
        if (selector === void 0) selector = "";
        return [ ...element.children ].filter((el => el.matches(selector)));
    }
    function utils_createElement(tag, classes) {
        if (classes === void 0) classes = [];
        const el = document.createElement(tag);
        el.classList.add(...Array.isArray(classes) ? classes : [ classes ]);
        return el;
    }
    function elementPrevAll(el, selector) {
        const prevEls = [];
        while (el.previousElementSibling) {
            const prev = el.previousElementSibling;
            if (selector) {
                if (prev.matches(selector)) prevEls.push(prev);
            } else prevEls.push(prev);
            el = prev;
        }
        return prevEls;
    }
    function elementNextAll(el, selector) {
        const nextEls = [];
        while (el.nextElementSibling) {
            const next = el.nextElementSibling;
            if (selector) {
                if (next.matches(selector)) nextEls.push(next);
            } else nextEls.push(next);
            el = next;
        }
        return nextEls;
    }
    function elementStyle(el, prop) {
        const window = ssr_window_esm_getWindow();
        return window.getComputedStyle(el, null).getPropertyValue(prop);
    }
    function utils_elementIndex(el) {
        let child = el;
        let i;
        if (child) {
            i = 0;
            while ((child = child.previousSibling) !== null) if (child.nodeType === 1) i += 1;
            return i;
        }
        return;
    }
    function utils_elementParents(el, selector) {
        const parents = [];
        let parent = el.parentElement;
        while (parent) {
            if (selector) {
                if (parent.matches(selector)) parents.push(parent);
            } else parents.push(parent);
            parent = parent.parentElement;
        }
        return parents;
    }
    function elementOuterSize(el, size, includeMargins) {
        const window = ssr_window_esm_getWindow();
        if (includeMargins) return el[size === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-right" : "margin-top")) + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === "width" ? "margin-left" : "margin-bottom"));
        return el.offsetWidth;
    }
    let support;
    function calcSupport() {
        const window = ssr_window_esm_getWindow();
        const document = ssr_window_esm_getDocument();
        return {
            smoothScroll: document.documentElement && document.documentElement.style && "scrollBehavior" in document.documentElement.style,
            touch: !!("ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
    }
    function getSupport() {
        if (!support) support = calcSupport();
        return support;
    }
    let deviceCached;
    function calcDevice(_temp) {
        let {userAgent} = _temp === void 0 ? {} : _temp;
        const support = getSupport();
        const window = ssr_window_esm_getWindow();
        const platform = window.navigator.platform;
        const ua = userAgent || window.navigator.userAgent;
        const device = {
            ios: false,
            android: false
        };
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
        let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
        const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
        const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
        const windows = platform === "Win32";
        let macos = platform === "MacIntel";
        const iPadScreens = [ "1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810" ];
        if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
            ipad = ua.match(/(Version)\/([\d.]+)/);
            if (!ipad) ipad = [ 0, 1, "13_0_0" ];
            macos = false;
        }
        if (android && !windows) {
            device.os = "android";
            device.android = true;
        }
        if (ipad || iphone || ipod) {
            device.os = "ios";
            device.ios = true;
        }
        return device;
    }
    function getDevice(overrides) {
        if (overrides === void 0) overrides = {};
        if (!deviceCached) deviceCached = calcDevice(overrides);
        return deviceCached;
    }
    let browser;
    function calcBrowser() {
        const window = ssr_window_esm_getWindow();
        let needPerspectiveFix = false;
        function isSafari() {
            const ua = window.navigator.userAgent.toLowerCase();
            return ua.indexOf("safari") >= 0 && ua.indexOf("chrome") < 0 && ua.indexOf("android") < 0;
        }
        if (isSafari()) {
            const ua = String(window.navigator.userAgent);
            if (ua.includes("Version/")) {
                const [major, minor] = ua.split("Version/")[1].split(" ")[0].split(".").map((num => Number(num)));
                needPerspectiveFix = major < 16 || major === 16 && minor < 2;
            }
        }
        return {
            isSafari: needPerspectiveFix || isSafari(),
            needPerspectiveFix,
            isWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent)
        };
    }
    function getBrowser() {
        if (!browser) browser = calcBrowser();
        return browser;
    }
    function Resize(_ref) {
        let {swiper, on, emit} = _ref;
        const window = ssr_window_esm_getWindow();
        let observer = null;
        let animationFrame = null;
        const resizeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("beforeResize");
            emit("resize");
        };
        const createObserver = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            observer = new ResizeObserver((entries => {
                animationFrame = window.requestAnimationFrame((() => {
                    const {width, height} = swiper;
                    let newWidth = width;
                    let newHeight = height;
                    entries.forEach((_ref2 => {
                        let {contentBoxSize, contentRect, target} = _ref2;
                        if (target && target !== swiper.el) return;
                        newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
                        newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
                    }));
                    if (newWidth !== width || newHeight !== height) resizeHandler();
                }));
            }));
            observer.observe(swiper.el);
        };
        const removeObserver = () => {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            if (observer && observer.unobserve && swiper.el) {
                observer.unobserve(swiper.el);
                observer = null;
            }
        };
        const orientationChangeHandler = () => {
            if (!swiper || swiper.destroyed || !swiper.initialized) return;
            emit("orientationchange");
        };
        on("init", (() => {
            if (swiper.params.resizeObserver && typeof window.ResizeObserver !== "undefined") {
                createObserver();
                return;
            }
            window.addEventListener("resize", resizeHandler);
            window.addEventListener("orientationchange", orientationChangeHandler);
        }));
        on("destroy", (() => {
            removeObserver();
            window.removeEventListener("resize", resizeHandler);
            window.removeEventListener("orientationchange", orientationChangeHandler);
        }));
    }
    function Observer(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const observers = [];
        const window = ssr_window_esm_getWindow();
        const attach = function(target, options) {
            if (options === void 0) options = {};
            const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
            const observer = new ObserverFunc((mutations => {
                if (swiper.__preventObserver__) return;
                if (mutations.length === 1) {
                    emit("observerUpdate", mutations[0]);
                    return;
                }
                const observerUpdate = function observerUpdate() {
                    emit("observerUpdate", mutations[0]);
                };
                if (window.requestAnimationFrame) window.requestAnimationFrame(observerUpdate); else window.setTimeout(observerUpdate, 0);
            }));
            observer.observe(target, {
                attributes: typeof options.attributes === "undefined" ? true : options.attributes,
                childList: typeof options.childList === "undefined" ? true : options.childList,
                characterData: typeof options.characterData === "undefined" ? true : options.characterData
            });
            observers.push(observer);
        };
        const init = () => {
            if (!swiper.params.observer) return;
            if (swiper.params.observeParents) {
                const containerParents = utils_elementParents(swiper.hostEl);
                for (let i = 0; i < containerParents.length; i += 1) attach(containerParents[i]);
            }
            attach(swiper.hostEl, {
                childList: swiper.params.observeSlideChildren
            });
            attach(swiper.wrapperEl, {
                attributes: false
            });
        };
        const destroy = () => {
            observers.forEach((observer => {
                observer.disconnect();
            }));
            observers.splice(0, observers.length);
        };
        extendParams({
            observer: false,
            observeParents: false,
            observeSlideChildren: false
        });
        on("init", init);
        on("destroy", destroy);
    }
    var eventsEmitter = {
        on(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            events.split(" ").forEach((event => {
                if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
                self.eventsListeners[event][method](handler);
            }));
            return self;
        },
        once(events, handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            function onceHandler() {
                self.off(events, onceHandler);
                if (onceHandler.__emitterProxy) delete onceHandler.__emitterProxy;
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
                handler.apply(self, args);
            }
            onceHandler.__emitterProxy = handler;
            return self.on(events, onceHandler, priority);
        },
        onAny(handler, priority) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (typeof handler !== "function") return self;
            const method = priority ? "unshift" : "push";
            if (self.eventsAnyListeners.indexOf(handler) < 0) self.eventsAnyListeners[method](handler);
            return self;
        },
        offAny(handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsAnyListeners) return self;
            const index = self.eventsAnyListeners.indexOf(handler);
            if (index >= 0) self.eventsAnyListeners.splice(index, 1);
            return self;
        },
        off(events, handler) {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            events.split(" ").forEach((event => {
                if (typeof handler === "undefined") self.eventsListeners[event] = []; else if (self.eventsListeners[event]) self.eventsListeners[event].forEach(((eventHandler, index) => {
                    if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) self.eventsListeners[event].splice(index, 1);
                }));
            }));
            return self;
        },
        emit() {
            const self = this;
            if (!self.eventsListeners || self.destroyed) return self;
            if (!self.eventsListeners) return self;
            let events;
            let data;
            let context;
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
            if (typeof args[0] === "string" || Array.isArray(args[0])) {
                events = args[0];
                data = args.slice(1, args.length);
                context = self;
            } else {
                events = args[0].events;
                data = args[0].data;
                context = args[0].context || self;
            }
            data.unshift(context);
            const eventsArray = Array.isArray(events) ? events : events.split(" ");
            eventsArray.forEach((event => {
                if (self.eventsAnyListeners && self.eventsAnyListeners.length) self.eventsAnyListeners.forEach((eventHandler => {
                    eventHandler.apply(context, [ event, ...data ]);
                }));
                if (self.eventsListeners && self.eventsListeners[event]) self.eventsListeners[event].forEach((eventHandler => {
                    eventHandler.apply(context, data);
                }));
            }));
            return self;
        }
    };
    function updateSize() {
        const swiper = this;
        let width;
        let height;
        const el = swiper.el;
        if (typeof swiper.params.width !== "undefined" && swiper.params.width !== null) width = swiper.params.width; else width = el.clientWidth;
        if (typeof swiper.params.height !== "undefined" && swiper.params.height !== null) height = swiper.params.height; else height = el.clientHeight;
        if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) return;
        width = width - parseInt(elementStyle(el, "padding-left") || 0, 10) - parseInt(elementStyle(el, "padding-right") || 0, 10);
        height = height - parseInt(elementStyle(el, "padding-top") || 0, 10) - parseInt(elementStyle(el, "padding-bottom") || 0, 10);
        if (Number.isNaN(width)) width = 0;
        if (Number.isNaN(height)) height = 0;
        Object.assign(swiper, {
            width,
            height,
            size: swiper.isHorizontal() ? width : height
        });
    }
    function updateSlides() {
        const swiper = this;
        function getDirectionLabel(property) {
            if (swiper.isHorizontal()) return property;
            return {
                width: "height",
                "margin-top": "margin-left",
                "margin-bottom ": "margin-right",
                "margin-left": "margin-top",
                "margin-right": "margin-bottom",
                "padding-left": "padding-top",
                "padding-right": "padding-bottom",
                marginRight: "marginBottom"
            }[property];
        }
        function getDirectionPropertyValue(node, label) {
            return parseFloat(node.getPropertyValue(getDirectionLabel(label)) || 0);
        }
        const params = swiper.params;
        const {wrapperEl, slidesEl, size: swiperSize, rtlTranslate: rtl, wrongRTL} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
        const slides = utils_elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
        const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
        let snapGrid = [];
        const slidesGrid = [];
        const slidesSizesGrid = [];
        let offsetBefore = params.slidesOffsetBefore;
        if (typeof offsetBefore === "function") offsetBefore = params.slidesOffsetBefore.call(swiper);
        let offsetAfter = params.slidesOffsetAfter;
        if (typeof offsetAfter === "function") offsetAfter = params.slidesOffsetAfter.call(swiper);
        const previousSnapGridLength = swiper.snapGrid.length;
        const previousSlidesGridLength = swiper.slidesGrid.length;
        let spaceBetween = params.spaceBetween;
        let slidePosition = -offsetBefore;
        let prevSlideSize = 0;
        let index = 0;
        if (typeof swiperSize === "undefined") return;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiperSize; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        swiper.virtualSize = -spaceBetween;
        slides.forEach((slideEl => {
            if (rtl) slideEl.style.marginLeft = ""; else slideEl.style.marginRight = "";
            slideEl.style.marginBottom = "";
            slideEl.style.marginTop = "";
        }));
        if (params.centeredSlides && params.cssMode) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", "");
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", "");
        }
        const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
        if (gridEnabled) swiper.grid.initSlides(slidesLength);
        let slideSize;
        const shouldResetSlideSize = params.slidesPerView === "auto" && params.breakpoints && Object.keys(params.breakpoints).filter((key => typeof params.breakpoints[key].slidesPerView !== "undefined")).length > 0;
        for (let i = 0; i < slidesLength; i += 1) {
            slideSize = 0;
            let slide;
            if (slides[i]) slide = slides[i];
            if (gridEnabled) swiper.grid.updateSlide(i, slide, slidesLength, getDirectionLabel);
            if (slides[i] && elementStyle(slide, "display") === "none") continue;
            if (params.slidesPerView === "auto") {
                if (shouldResetSlideSize) slides[i].style[getDirectionLabel("width")] = ``;
                const slideStyles = getComputedStyle(slide);
                const currentTransform = slide.style.transform;
                const currentWebKitTransform = slide.style.webkitTransform;
                if (currentTransform) slide.style.transform = "none";
                if (currentWebKitTransform) slide.style.webkitTransform = "none";
                if (params.roundLengths) slideSize = swiper.isHorizontal() ? elementOuterSize(slide, "width", true) : elementOuterSize(slide, "height", true); else {
                    const width = getDirectionPropertyValue(slideStyles, "width");
                    const paddingLeft = getDirectionPropertyValue(slideStyles, "padding-left");
                    const paddingRight = getDirectionPropertyValue(slideStyles, "padding-right");
                    const marginLeft = getDirectionPropertyValue(slideStyles, "margin-left");
                    const marginRight = getDirectionPropertyValue(slideStyles, "margin-right");
                    const boxSizing = slideStyles.getPropertyValue("box-sizing");
                    if (boxSizing && boxSizing === "border-box") slideSize = width + marginLeft + marginRight; else {
                        const {clientWidth, offsetWidth} = slide;
                        slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
                    }
                }
                if (currentTransform) slide.style.transform = currentTransform;
                if (currentWebKitTransform) slide.style.webkitTransform = currentWebKitTransform;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
            } else {
                slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
                if (params.roundLengths) slideSize = Math.floor(slideSize);
                if (slides[i]) slides[i].style[getDirectionLabel("width")] = `${slideSize}px`;
            }
            if (slides[i]) slides[i].swiperSlideSize = slideSize;
            slidesSizesGrid.push(slideSize);
            if (params.centeredSlides) {
                slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
                if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
                if (Math.abs(slidePosition) < 1 / 1e3) slidePosition = 0;
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
            } else {
                if (params.roundLengths) slidePosition = Math.floor(slidePosition);
                if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
                slidesGrid.push(slidePosition);
                slidePosition = slidePosition + slideSize + spaceBetween;
            }
            swiper.virtualSize += slideSize + spaceBetween;
            prevSlideSize = slideSize;
            index += 1;
        }
        swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
        if (rtl && wrongRTL && (params.effect === "slide" || params.effect === "coverflow")) wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
        if (params.setWrapperSize) wrapperEl.style[getDirectionLabel("width")] = `${swiper.virtualSize + spaceBetween}px`;
        if (gridEnabled) swiper.grid.updateWrapperSize(slideSize, snapGrid, getDirectionLabel);
        if (!params.centeredSlides) {
            const newSlidesGrid = [];
            for (let i = 0; i < snapGrid.length; i += 1) {
                let slidesGridItem = snapGrid[i];
                if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
                if (snapGrid[i] <= swiper.virtualSize - swiperSize) newSlidesGrid.push(slidesGridItem);
            }
            snapGrid = newSlidesGrid;
            if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) snapGrid.push(swiper.virtualSize - swiperSize);
        }
        if (isVirtual && params.loop) {
            const size = slidesSizesGrid[0] + spaceBetween;
            if (params.slidesPerGroup > 1) {
                const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
                const groupSize = size * params.slidesPerGroup;
                for (let i = 0; i < groups; i += 1) snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
            }
            for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
                if (params.slidesPerGroup === 1) snapGrid.push(snapGrid[snapGrid.length - 1] + size);
                slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
                swiper.virtualSize += size;
            }
        }
        if (snapGrid.length === 0) snapGrid = [ 0 ];
        if (spaceBetween !== 0) {
            const key = swiper.isHorizontal() && rtl ? "marginLeft" : getDirectionLabel("marginRight");
            slides.filter(((_, slideIndex) => {
                if (!params.cssMode || params.loop) return true;
                if (slideIndex === slides.length - 1) return false;
                return true;
            })).forEach((slideEl => {
                slideEl.style[key] = `${spaceBetween}px`;
            }));
        }
        if (params.centeredSlides && params.centeredSlidesBounds) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            }));
            allSlidesSize -= spaceBetween;
            const maxSnap = allSlidesSize - swiperSize;
            snapGrid = snapGrid.map((snap => {
                if (snap <= 0) return -offsetBefore;
                if (snap > maxSnap) return maxSnap + offsetAfter;
                return snap;
            }));
        }
        if (params.centerInsufficientSlides) {
            let allSlidesSize = 0;
            slidesSizesGrid.forEach((slideSizeValue => {
                allSlidesSize += slideSizeValue + (spaceBetween || 0);
            }));
            allSlidesSize -= spaceBetween;
            if (allSlidesSize < swiperSize) {
                const allSlidesOffset = (swiperSize - allSlidesSize) / 2;
                snapGrid.forEach(((snap, snapIndex) => {
                    snapGrid[snapIndex] = snap - allSlidesOffset;
                }));
                slidesGrid.forEach(((snap, snapIndex) => {
                    slidesGrid[snapIndex] = snap + allSlidesOffset;
                }));
            }
        }
        Object.assign(swiper, {
            slides,
            snapGrid,
            slidesGrid,
            slidesSizesGrid
        });
        if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-before", `${-snapGrid[0]}px`);
            utils_setCSSProperty(wrapperEl, "--swiper-centered-offset-after", `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
            const addToSnapGrid = -swiper.snapGrid[0];
            const addToSlidesGrid = -swiper.slidesGrid[0];
            swiper.snapGrid = swiper.snapGrid.map((v => v + addToSnapGrid));
            swiper.slidesGrid = swiper.slidesGrid.map((v => v + addToSlidesGrid));
        }
        if (slidesLength !== previousSlidesLength) swiper.emit("slidesLengthChange");
        if (snapGrid.length !== previousSnapGridLength) {
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            swiper.emit("snapGridLengthChange");
        }
        if (slidesGrid.length !== previousSlidesGridLength) swiper.emit("slidesGridLengthChange");
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        if (!isVirtual && !params.cssMode && (params.effect === "slide" || params.effect === "fade")) {
            const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
            const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
            if (slidesLength <= params.maxBackfaceHiddenSlides) {
                if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
            } else if (hasClassBackfaceClassAdded) swiper.el.classList.remove(backFaceHiddenClass);
        }
    }
    function updateAutoHeight(speed) {
        const swiper = this;
        const activeSlides = [];
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        let newHeight = 0;
        let i;
        if (typeof speed === "number") swiper.setTransition(speed); else if (speed === true) swiper.setTransition(swiper.params.speed);
        const getSlideByIndex = index => {
            if (isVirtual) return swiper.slides[swiper.getSlideIndexByData(index)];
            return swiper.slides[index];
        };
        if (swiper.params.slidesPerView !== "auto" && swiper.params.slidesPerView > 1) if (swiper.params.centeredSlides) (swiper.visibleSlides || []).forEach((slide => {
            activeSlides.push(slide);
        })); else for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
            const index = swiper.activeIndex + i;
            if (index > swiper.slides.length && !isVirtual) break;
            activeSlides.push(getSlideByIndex(index));
        } else activeSlides.push(getSlideByIndex(swiper.activeIndex));
        for (i = 0; i < activeSlides.length; i += 1) if (typeof activeSlides[i] !== "undefined") {
            const height = activeSlides[i].offsetHeight;
            newHeight = height > newHeight ? height : newHeight;
        }
        if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
    }
    function updateSlidesOffset() {
        const swiper = this;
        const slides = swiper.slides;
        const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
        for (let i = 0; i < slides.length; i += 1) slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
    }
    function updateSlidesProgress(translate) {
        if (translate === void 0) translate = this && this.translate || 0;
        const swiper = this;
        const params = swiper.params;
        const {slides, rtlTranslate: rtl, snapGrid} = swiper;
        if (slides.length === 0) return;
        if (typeof slides[0].swiperSlideOffset === "undefined") swiper.updateSlidesOffset();
        let offsetCenter = -translate;
        if (rtl) offsetCenter = translate;
        slides.forEach((slideEl => {
            slideEl.classList.remove(params.slideVisibleClass);
        }));
        swiper.visibleSlidesIndexes = [];
        swiper.visibleSlides = [];
        let spaceBetween = params.spaceBetween;
        if (typeof spaceBetween === "string" && spaceBetween.indexOf("%") >= 0) spaceBetween = parseFloat(spaceBetween.replace("%", "")) / 100 * swiper.size; else if (typeof spaceBetween === "string") spaceBetween = parseFloat(spaceBetween);
        for (let i = 0; i < slides.length; i += 1) {
            const slide = slides[i];
            let slideOffset = slide.swiperSlideOffset;
            if (params.cssMode && params.centeredSlides) slideOffset -= slides[0].swiperSlideOffset;
            const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
            const slideBefore = -(offsetCenter - slideOffset);
            const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
            const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
            if (isVisible) {
                swiper.visibleSlides.push(slide);
                swiper.visibleSlidesIndexes.push(i);
                slides[i].classList.add(params.slideVisibleClass);
            }
            slide.progress = rtl ? -slideProgress : slideProgress;
            slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
        }
    }
    function updateProgress(translate) {
        const swiper = this;
        if (typeof translate === "undefined") {
            const multiplier = swiper.rtlTranslate ? -1 : 1;
            translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
        }
        const params = swiper.params;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        let {progress, isBeginning, isEnd, progressLoop} = swiper;
        const wasBeginning = isBeginning;
        const wasEnd = isEnd;
        if (translatesDiff === 0) {
            progress = 0;
            isBeginning = true;
            isEnd = true;
        } else {
            progress = (translate - swiper.minTranslate()) / translatesDiff;
            const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
            const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
            isBeginning = isBeginningRounded || progress <= 0;
            isEnd = isEndRounded || progress >= 1;
            if (isBeginningRounded) progress = 0;
            if (isEndRounded) progress = 1;
        }
        if (params.loop) {
            const firstSlideIndex = swiper.getSlideIndexByData(0);
            const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
            const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
            const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
            const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
            const translateAbs = Math.abs(translate);
            if (translateAbs >= firstSlideTranslate) progressLoop = (translateAbs - firstSlideTranslate) / translateMax; else progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
            if (progressLoop > 1) progressLoop -= 1;
        }
        Object.assign(swiper, {
            progress,
            progressLoop,
            isBeginning,
            isEnd
        });
        if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);
        if (isBeginning && !wasBeginning) swiper.emit("reachBeginning toEdge");
        if (isEnd && !wasEnd) swiper.emit("reachEnd toEdge");
        if (wasBeginning && !isBeginning || wasEnd && !isEnd) swiper.emit("fromEdge");
        swiper.emit("progress", progress);
    }
    function updateSlidesClasses() {
        const swiper = this;
        const {slides, params, slidesEl, activeIndex} = swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        const getFilteredSlide = selector => utils_elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
        slides.forEach((slideEl => {
            slideEl.classList.remove(params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
        }));
        let activeSlide;
        if (isVirtual) if (params.loop) {
            let slideIndex = activeIndex - swiper.virtual.slidesBefore;
            if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
            if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
            activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
        } else activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`); else activeSlide = slides[activeIndex];
        if (activeSlide) {
            activeSlide.classList.add(params.slideActiveClass);
            let nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !nextSlide) nextSlide = slides[0];
            if (nextSlide) nextSlide.classList.add(params.slideNextClass);
            let prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
            if (params.loop && !prevSlide === 0) prevSlide = slides[slides.length - 1];
            if (prevSlide) prevSlide.classList.add(params.slidePrevClass);
        }
        swiper.emitSlidesClasses();
    }
    const processLazyPreloader = (swiper, imageEl) => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
        const slideEl = imageEl.closest(slideSelector());
        if (slideEl) {
            let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
            if (!lazyEl && swiper.isElement) if (slideEl.shadowRoot) lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`); else requestAnimationFrame((() => {
                if (slideEl.shadowRoot) {
                    lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
                    if (lazyEl) lazyEl.remove();
                }
            }));
            if (lazyEl) lazyEl.remove();
        }
    };
    const unlazy = (swiper, index) => {
        if (!swiper.slides[index]) return;
        const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
        if (imageEl) imageEl.removeAttribute("loading");
    };
    const preload = swiper => {
        if (!swiper || swiper.destroyed || !swiper.params) return;
        let amount = swiper.params.lazyPreloadPrevNext;
        const len = swiper.slides.length;
        if (!len || !amount || amount < 0) return;
        amount = Math.min(amount, len);
        const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
        const activeIndex = swiper.activeIndex;
        if (swiper.params.grid && swiper.params.grid.rows > 1) {
            const activeColumn = activeIndex;
            const preloadColumns = [ activeColumn - amount ];
            preloadColumns.push(...Array.from({
                length: amount
            }).map(((_, i) => activeColumn + slidesPerView + i)));
            swiper.slides.forEach(((slideEl, i) => {
                if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
            }));
            return;
        }
        const slideIndexLastInView = activeIndex + slidesPerView - 1;
        if (swiper.params.rewind || swiper.params.loop) for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
            const realIndex = (i % len + len) % len;
            if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
        } else for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) unlazy(swiper, i);
    };
    function getActiveIndexByTranslate(swiper) {
        const {slidesGrid, params} = swiper;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        let activeIndex;
        for (let i = 0; i < slidesGrid.length; i += 1) if (typeof slidesGrid[i + 1] !== "undefined") {
            if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) activeIndex = i; else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) activeIndex = i + 1;
        } else if (translate >= slidesGrid[i]) activeIndex = i;
        if (params.normalizeSlideIndex) if (activeIndex < 0 || typeof activeIndex === "undefined") activeIndex = 0;
        return activeIndex;
    }
    function updateActiveIndex(newActiveIndex) {
        const swiper = this;
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        const {snapGrid, params, activeIndex: previousIndex, realIndex: previousRealIndex, snapIndex: previousSnapIndex} = swiper;
        let activeIndex = newActiveIndex;
        let snapIndex;
        const getVirtualRealIndex = aIndex => {
            let realIndex = aIndex - swiper.virtual.slidesBefore;
            if (realIndex < 0) realIndex = swiper.virtual.slides.length + realIndex;
            if (realIndex >= swiper.virtual.slides.length) realIndex -= swiper.virtual.slides.length;
            return realIndex;
        };
        if (typeof activeIndex === "undefined") activeIndex = getActiveIndexByTranslate(swiper);
        if (snapGrid.indexOf(translate) >= 0) snapIndex = snapGrid.indexOf(translate); else {
            const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
            snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
        }
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        if (activeIndex === previousIndex) {
            if (snapIndex !== previousSnapIndex) {
                swiper.snapIndex = snapIndex;
                swiper.emit("snapIndexChange");
            }
            if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) swiper.realIndex = getVirtualRealIndex(activeIndex);
            return;
        }
        let realIndex;
        if (swiper.virtual && params.virtual.enabled && params.loop) realIndex = getVirtualRealIndex(activeIndex); else if (swiper.slides[activeIndex]) realIndex = parseInt(swiper.slides[activeIndex].getAttribute("data-swiper-slide-index") || activeIndex, 10); else realIndex = activeIndex;
        Object.assign(swiper, {
            previousSnapIndex,
            snapIndex,
            previousRealIndex,
            realIndex,
            previousIndex,
            activeIndex
        });
        if (swiper.initialized) preload(swiper);
        swiper.emit("activeIndexChange");
        swiper.emit("snapIndexChange");
        if (swiper.initialized || swiper.params.runCallbacksOnInit) {
            if (previousRealIndex !== realIndex) swiper.emit("realIndexChange");
            swiper.emit("slideChange");
        }
    }
    function updateClickedSlide(el, path) {
        const swiper = this;
        const params = swiper.params;
        let slide = el.closest(`.${params.slideClass}, swiper-slide`);
        if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) [ ...path.slice(path.indexOf(el) + 1, path.length) ].forEach((pathEl => {
            if (!slide && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) slide = pathEl;
        }));
        let slideFound = false;
        let slideIndex;
        if (slide) for (let i = 0; i < swiper.slides.length; i += 1) if (swiper.slides[i] === slide) {
            slideFound = true;
            slideIndex = i;
            break;
        }
        if (slide && slideFound) {
            swiper.clickedSlide = slide;
            if (swiper.virtual && swiper.params.virtual.enabled) swiper.clickedIndex = parseInt(slide.getAttribute("data-swiper-slide-index"), 10); else swiper.clickedIndex = slideIndex;
        } else {
            swiper.clickedSlide = void 0;
            swiper.clickedIndex = void 0;
            return;
        }
        if (params.slideToClickedSlide && swiper.clickedIndex !== void 0 && swiper.clickedIndex !== swiper.activeIndex) swiper.slideToClickedSlide();
    }
    var update = {
        updateSize,
        updateSlides,
        updateAutoHeight,
        updateSlidesOffset,
        updateSlidesProgress,
        updateProgress,
        updateSlidesClasses,
        updateActiveIndex,
        updateClickedSlide
    };
    function getSwiperTranslate(axis) {
        if (axis === void 0) axis = this.isHorizontal() ? "x" : "y";
        const swiper = this;
        const {params, rtlTranslate: rtl, translate, wrapperEl} = swiper;
        if (params.virtualTranslate) return rtl ? -translate : translate;
        if (params.cssMode) return translate;
        let currentTranslate = utils_getTranslate(wrapperEl, axis);
        currentTranslate += swiper.cssOverflowAdjustment();
        if (rtl) currentTranslate = -currentTranslate;
        return currentTranslate || 0;
    }
    function setTranslate(translate, byController) {
        const swiper = this;
        const {rtlTranslate: rtl, params, wrapperEl, progress} = swiper;
        let x = 0;
        let y = 0;
        const z = 0;
        if (swiper.isHorizontal()) x = rtl ? -translate : translate; else y = translate;
        if (params.roundLengths) {
            x = Math.floor(x);
            y = Math.floor(y);
        }
        swiper.previousTranslate = swiper.translate;
        swiper.translate = swiper.isHorizontal() ? x : y;
        if (params.cssMode) wrapperEl[swiper.isHorizontal() ? "scrollLeft" : "scrollTop"] = swiper.isHorizontal() ? -x : -y; else if (!params.virtualTranslate) {
            if (swiper.isHorizontal()) x -= swiper.cssOverflowAdjustment(); else y -= swiper.cssOverflowAdjustment();
            wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
        }
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== progress) swiper.updateProgress(translate);
        swiper.emit("setTranslate", swiper.translate, byController);
    }
    function minTranslate() {
        return -this.snapGrid[0];
    }
    function maxTranslate() {
        return -this.snapGrid[this.snapGrid.length - 1];
    }
    function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
        if (translate === void 0) translate = 0;
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        if (translateBounds === void 0) translateBounds = true;
        const swiper = this;
        const {params, wrapperEl} = swiper;
        if (swiper.animating && params.preventInteractionOnTransition) return false;
        const minTranslate = swiper.minTranslate();
        const maxTranslate = swiper.maxTranslate();
        let newTranslate;
        if (translateBounds && translate > minTranslate) newTranslate = minTranslate; else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate; else newTranslate = translate;
        swiper.updateProgress(newTranslate);
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            if (speed === 0) wrapperEl[isH ? "scrollLeft" : "scrollTop"] = -newTranslate; else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: -newTranslate,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: -newTranslate,
                    behavior: "smooth"
                });
            }
            return true;
        }
        if (speed === 0) {
            swiper.setTransition(0);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionEnd");
            }
        } else {
            swiper.setTransition(speed);
            swiper.setTranslate(newTranslate);
            if (runCallbacks) {
                swiper.emit("beforeTransitionStart", speed, internal);
                swiper.emit("transitionStart");
            }
            if (!swiper.animating) {
                swiper.animating = true;
                if (!swiper.onTranslateToWrapperTransitionEnd) swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
                    if (!swiper || swiper.destroyed) return;
                    if (e.target !== this) return;
                    swiper.wrapperEl.removeEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
                    swiper.onTranslateToWrapperTransitionEnd = null;
                    delete swiper.onTranslateToWrapperTransitionEnd;
                    if (runCallbacks) swiper.emit("transitionEnd");
                };
                swiper.wrapperEl.addEventListener("transitionend", swiper.onTranslateToWrapperTransitionEnd);
            }
        }
        return true;
    }
    var translate = {
        getTranslate: getSwiperTranslate,
        setTranslate,
        minTranslate,
        maxTranslate,
        translateTo
    };
    function setTransition(duration, byController) {
        const swiper = this;
        if (!swiper.params.cssMode) {
            swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
            swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : "";
        }
        swiper.emit("setTransition", duration, byController);
    }
    function transitionEmit(_ref) {
        let {swiper, runCallbacks, direction, step} = _ref;
        const {activeIndex, previousIndex} = swiper;
        let dir = direction;
        if (!dir) if (activeIndex > previousIndex) dir = "next"; else if (activeIndex < previousIndex) dir = "prev"; else dir = "reset";
        swiper.emit(`transition${step}`);
        if (runCallbacks && activeIndex !== previousIndex) {
            if (dir === "reset") {
                swiper.emit(`slideResetTransition${step}`);
                return;
            }
            swiper.emit(`slideChangeTransition${step}`);
            if (dir === "next") swiper.emit(`slideNextTransition${step}`); else swiper.emit(`slidePrevTransition${step}`);
        }
    }
    function transitionStart(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        if (params.cssMode) return;
        if (params.autoHeight) swiper.updateAutoHeight();
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "Start"
        });
    }
    function transitionEnd(runCallbacks, direction) {
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params} = swiper;
        swiper.animating = false;
        if (params.cssMode) return;
        swiper.setTransition(0);
        transitionEmit({
            swiper,
            runCallbacks,
            direction,
            step: "End"
        });
    }
    var transition = {
        setTransition,
        transitionStart,
        transitionEnd
    };
    function slideTo(index, speed, runCallbacks, internal, initial) {
        if (index === void 0) index = 0;
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") index = parseInt(index, 10);
        const swiper = this;
        let slideIndex = index;
        if (slideIndex < 0) slideIndex = 0;
        const {params, snapGrid, slidesGrid, previousIndex, activeIndex, rtlTranslate: rtl, wrapperEl, enabled} = swiper;
        if (swiper.animating && params.preventInteractionOnTransition || !enabled && !internal && !initial) return false;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
        let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
        if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
        const translate = -snapGrid[snapIndex];
        if (params.normalizeSlideIndex) for (let i = 0; i < slidesGrid.length; i += 1) {
            const normalizedTranslate = -Math.floor(translate * 100);
            const normalizedGrid = Math.floor(slidesGrid[i] * 100);
            const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
            if (typeof slidesGrid[i + 1] !== "undefined") {
                if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) slideIndex = i; else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) slideIndex = i + 1;
            } else if (normalizedTranslate >= normalizedGrid) slideIndex = i;
        }
        if (swiper.initialized && slideIndex !== activeIndex) {
            if (!swiper.allowSlideNext && (rtl ? translate > swiper.translate && translate > swiper.minTranslate() : translate < swiper.translate && translate < swiper.minTranslate())) return false;
            if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) if ((activeIndex || 0) !== slideIndex) return false;
        }
        if (slideIndex !== (previousIndex || 0) && runCallbacks) swiper.emit("beforeSlideChangeStart");
        swiper.updateProgress(translate);
        let direction;
        if (slideIndex > activeIndex) direction = "next"; else if (slideIndex < activeIndex) direction = "prev"; else direction = "reset";
        if (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate) {
            swiper.updateActiveIndex(slideIndex);
            if (params.autoHeight) swiper.updateAutoHeight();
            swiper.updateSlidesClasses();
            if (params.effect !== "slide") swiper.setTranslate(translate);
            if (direction !== "reset") {
                swiper.transitionStart(runCallbacks, direction);
                swiper.transitionEnd(runCallbacks, direction);
            }
            return false;
        }
        if (params.cssMode) {
            const isH = swiper.isHorizontal();
            const t = rtl ? translate : -translate;
            if (speed === 0) {
                const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
                if (isVirtual) {
                    swiper.wrapperEl.style.scrollSnapType = "none";
                    swiper._immediateVirtual = true;
                }
                if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
                    swiper._cssModeVirtualInitialSet = true;
                    requestAnimationFrame((() => {
                        wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                    }));
                } else wrapperEl[isH ? "scrollLeft" : "scrollTop"] = t;
                if (isVirtual) requestAnimationFrame((() => {
                    swiper.wrapperEl.style.scrollSnapType = "";
                    swiper._immediateVirtual = false;
                }));
            } else {
                if (!swiper.support.smoothScroll) {
                    animateCSSModeScroll({
                        swiper,
                        targetPosition: t,
                        side: isH ? "left" : "top"
                    });
                    return true;
                }
                wrapperEl.scrollTo({
                    [isH ? "left" : "top"]: t,
                    behavior: "smooth"
                });
            }
            return true;
        }
        swiper.setTransition(speed);
        swiper.setTranslate(translate);
        swiper.updateActiveIndex(slideIndex);
        swiper.updateSlidesClasses();
        swiper.emit("beforeTransitionStart", speed, internal);
        swiper.transitionStart(runCallbacks, direction);
        if (speed === 0) swiper.transitionEnd(runCallbacks, direction); else if (!swiper.animating) {
            swiper.animating = true;
            if (!swiper.onSlideToWrapperTransitionEnd) swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
                if (!swiper || swiper.destroyed) return;
                if (e.target !== this) return;
                swiper.wrapperEl.removeEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
                swiper.onSlideToWrapperTransitionEnd = null;
                delete swiper.onSlideToWrapperTransitionEnd;
                swiper.transitionEnd(runCallbacks, direction);
            };
            swiper.wrapperEl.addEventListener("transitionend", swiper.onSlideToWrapperTransitionEnd);
        }
        return true;
    }
    function slideToLoop(index, speed, runCallbacks, internal) {
        if (index === void 0) index = 0;
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        if (typeof index === "string") {
            const indexAsNumber = parseInt(index, 10);
            index = indexAsNumber;
        }
        const swiper = this;
        let newIndex = index;
        if (swiper.params.loop) if (swiper.virtual && swiper.params.virtual.enabled) newIndex += swiper.virtual.slidesBefore; else newIndex = swiper.getSlideIndexByData(newIndex);
        return swiper.slideTo(newIndex, speed, runCallbacks, internal);
    }
    function slideNext(speed, runCallbacks, internal) {
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {enabled, params, animating} = swiper;
        if (!enabled) return swiper;
        let perGroup = params.slidesPerGroup;
        if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) perGroup = Math.max(swiper.slidesPerViewDynamic("current", true), 1);
        const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "next"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
            if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
                requestAnimationFrame((() => {
                    swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
                }));
                return true;
            }
        }
        if (params.rewind && swiper.isEnd) return swiper.slideTo(0, speed, runCallbacks, internal);
        return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
    }
    function slidePrev(speed, runCallbacks, internal) {
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        const {params, snapGrid, slidesGrid, rtlTranslate, enabled, animating} = swiper;
        if (!enabled) return swiper;
        const isVirtual = swiper.virtual && params.virtual.enabled;
        if (params.loop) {
            if (animating && !isVirtual && params.loopPreventsSliding) return false;
            swiper.loopFix({
                direction: "prev"
            });
            swiper._clientLeft = swiper.wrapperEl.clientLeft;
        }
        const translate = rtlTranslate ? swiper.translate : -swiper.translate;
        function normalize(val) {
            if (val < 0) return -Math.floor(Math.abs(val));
            return Math.floor(val);
        }
        const normalizedTranslate = normalize(translate);
        const normalizedSnapGrid = snapGrid.map((val => normalize(val)));
        let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
        if (typeof prevSnap === "undefined" && params.cssMode) {
            let prevSnapIndex;
            snapGrid.forEach(((snap, snapIndex) => {
                if (normalizedTranslate >= snap) prevSnapIndex = snapIndex;
            }));
            if (typeof prevSnapIndex !== "undefined") prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
        }
        let prevIndex = 0;
        if (typeof prevSnap !== "undefined") {
            prevIndex = slidesGrid.indexOf(prevSnap);
            if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
            if (params.slidesPerView === "auto" && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
                prevIndex = prevIndex - swiper.slidesPerViewDynamic("previous", true) + 1;
                prevIndex = Math.max(prevIndex, 0);
            }
        }
        if (params.rewind && swiper.isBeginning) {
            const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
            return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
        } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
            requestAnimationFrame((() => {
                swiper.slideTo(prevIndex, speed, runCallbacks, internal);
            }));
            return true;
        }
        return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
    }
    function slideReset(speed, runCallbacks, internal) {
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        const swiper = this;
        return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
    }
    function slideToClosest(speed, runCallbacks, internal, threshold) {
        if (speed === void 0) speed = this.params.speed;
        if (runCallbacks === void 0) runCallbacks = true;
        if (threshold === void 0) threshold = .5;
        const swiper = this;
        let index = swiper.activeIndex;
        const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
        const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
        const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
        if (translate >= swiper.snapGrid[snapIndex]) {
            const currentSnap = swiper.snapGrid[snapIndex];
            const nextSnap = swiper.snapGrid[snapIndex + 1];
            if (translate - currentSnap > (nextSnap - currentSnap) * threshold) index += swiper.params.slidesPerGroup;
        } else {
            const prevSnap = swiper.snapGrid[snapIndex - 1];
            const currentSnap = swiper.snapGrid[snapIndex];
            if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) index -= swiper.params.slidesPerGroup;
        }
        index = Math.max(index, 0);
        index = Math.min(index, swiper.slidesGrid.length - 1);
        return swiper.slideTo(index, speed, runCallbacks, internal);
    }
    function slideToClickedSlide() {
        const swiper = this;
        const {params, slidesEl} = swiper;
        const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : params.slidesPerView;
        let slideToIndex = swiper.clickedIndex;
        let realIndex;
        const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
        if (params.loop) {
            if (swiper.animating) return;
            realIndex = parseInt(swiper.clickedSlide.getAttribute("data-swiper-slide-index"), 10);
            if (params.centeredSlides) if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(utils_elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                utils_nextTick((() => {
                    swiper.slideTo(slideToIndex);
                }));
            } else swiper.slideTo(slideToIndex); else if (slideToIndex > swiper.slides.length - slidesPerView) {
                swiper.loopFix();
                slideToIndex = swiper.getSlideIndex(utils_elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
                utils_nextTick((() => {
                    swiper.slideTo(slideToIndex);
                }));
            } else swiper.slideTo(slideToIndex);
        } else swiper.slideTo(slideToIndex);
    }
    var slide = {
        slideTo,
        slideToLoop,
        slideNext,
        slidePrev,
        slideReset,
        slideToClosest,
        slideToClickedSlide
    };
    function loopCreate(slideRealIndex) {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
        const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        slides.forEach(((el, index) => {
            el.setAttribute("data-swiper-slide-index", index);
        }));
        swiper.loopFix({
            slideRealIndex,
            direction: params.centeredSlides ? void 0 : "next"
        });
    }
    function loopFix(_temp) {
        let {slideRealIndex, slideTo = true, direction, setTranslate, activeSlideIndex, byController, byMousewheel} = _temp === void 0 ? {} : _temp;
        const swiper = this;
        if (!swiper.params.loop) return;
        swiper.emit("beforeLoopFix");
        const {slides, allowSlidePrev, allowSlideNext, slidesEl, params} = swiper;
        swiper.allowSlidePrev = true;
        swiper.allowSlideNext = true;
        if (swiper.virtual && params.virtual.enabled) {
            if (slideTo) if (!params.centeredSlides && swiper.snapIndex === 0) swiper.slideTo(swiper.virtual.slides.length, 0, false, true); else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true); else if (swiper.snapIndex === swiper.snapGrid.length - 1) swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
            swiper.allowSlidePrev = allowSlidePrev;
            swiper.allowSlideNext = allowSlideNext;
            swiper.emit("loopFix");
            return;
        }
        const slidesPerView = params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10));
        let loopedSlides = params.loopedSlides || slidesPerView;
        if (loopedSlides % params.slidesPerGroup !== 0) loopedSlides += params.slidesPerGroup - loopedSlides % params.slidesPerGroup;
        swiper.loopedSlides = loopedSlides;
        const prependSlidesIndexes = [];
        const appendSlidesIndexes = [];
        let activeIndex = swiper.activeIndex;
        if (typeof activeSlideIndex === "undefined") activeSlideIndex = swiper.getSlideIndex(swiper.slides.filter((el => el.classList.contains(params.slideActiveClass)))[0]); else activeIndex = activeSlideIndex;
        const isNext = direction === "next" || !direction;
        const isPrev = direction === "prev" || !direction;
        let slidesPrepended = 0;
        let slidesAppended = 0;
        if (activeSlideIndex < loopedSlides) {
            slidesPrepended = Math.max(loopedSlides - activeSlideIndex, params.slidesPerGroup);
            for (let i = 0; i < loopedSlides - activeSlideIndex; i += 1) {
                const index = i - Math.floor(i / slides.length) * slides.length;
                prependSlidesIndexes.push(slides.length - index - 1);
            }
        } else if (activeSlideIndex > swiper.slides.length - loopedSlides * 2) {
            slidesAppended = Math.max(activeSlideIndex - (swiper.slides.length - loopedSlides * 2), params.slidesPerGroup);
            for (let i = 0; i < slidesAppended; i += 1) {
                const index = i - Math.floor(i / slides.length) * slides.length;
                appendSlidesIndexes.push(index);
            }
        }
        if (isPrev) prependSlidesIndexes.forEach((index => {
            swiper.slides[index].swiperLoopMoveDOM = true;
            slidesEl.prepend(swiper.slides[index]);
            swiper.slides[index].swiperLoopMoveDOM = false;
        }));
        if (isNext) appendSlidesIndexes.forEach((index => {
            swiper.slides[index].swiperLoopMoveDOM = true;
            slidesEl.append(swiper.slides[index]);
            swiper.slides[index].swiperLoopMoveDOM = false;
        }));
        swiper.recalcSlides();
        if (params.slidesPerView === "auto") swiper.updateSlides();
        if (params.watchSlidesProgress) swiper.updateSlidesOffset();
        if (slideTo) if (prependSlidesIndexes.length > 0 && isPrev) {
            if (typeof slideRealIndex === "undefined") {
                const currentSlideTranslate = swiper.slidesGrid[activeIndex];
                const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
                const diff = newSlideTranslate - currentSlideTranslate;
                if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                    swiper.slideTo(activeIndex + slidesPrepended, 0, false, true);
                    if (setTranslate) {
                        swiper.touches[swiper.isHorizontal() ? "startX" : "startY"] += diff;
                        swiper.touchEventsData.currentTranslate = swiper.translate;
                    }
                }
            } else if (setTranslate) {
                swiper.slideToLoop(slideRealIndex, 0, false, true);
                swiper.touchEventsData.currentTranslate = swiper.translate;
            }
        } else if (appendSlidesIndexes.length > 0 && isNext) if (typeof slideRealIndex === "undefined") {
            const currentSlideTranslate = swiper.slidesGrid[activeIndex];
            const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
            const diff = newSlideTranslate - currentSlideTranslate;
            if (byMousewheel) swiper.setTranslate(swiper.translate - diff); else {
                swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
                if (setTranslate) {
                    swiper.touches[swiper.isHorizontal() ? "startX" : "startY"] += diff;
                    swiper.touchEventsData.currentTranslate = swiper.translate;
                }
            }
        } else swiper.slideToLoop(slideRealIndex, 0, false, true);
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.controller && swiper.controller.control && !byController) {
            const loopParams = {
                slideRealIndex,
                direction,
                setTranslate,
                activeSlideIndex,
                byController: true
            };
            if (Array.isArray(swiper.controller.control)) swiper.controller.control.forEach((c => {
                if (!c.destroyed && c.params.loop) c.loopFix({
                    ...loopParams,
                    slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false
                });
            })); else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) swiper.controller.control.loopFix({
                ...loopParams,
                slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo : false
            });
        }
        swiper.emit("loopFix");
    }
    function loopDestroy() {
        const swiper = this;
        const {params, slidesEl} = swiper;
        if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
        swiper.recalcSlides();
        const newSlidesOrder = [];
        swiper.slides.forEach((slideEl => {
            const index = typeof slideEl.swiperSlideIndex === "undefined" ? slideEl.getAttribute("data-swiper-slide-index") * 1 : slideEl.swiperSlideIndex;
            newSlidesOrder[index] = slideEl;
        }));
        swiper.slides.forEach((slideEl => {
            slideEl.removeAttribute("data-swiper-slide-index");
        }));
        newSlidesOrder.forEach((slideEl => {
            slidesEl.append(slideEl);
        }));
        swiper.recalcSlides();
        swiper.slideTo(swiper.realIndex, 0);
    }
    var loop = {
        loopCreate,
        loopFix,
        loopDestroy
    };
    function setGrabCursor(moving) {
        const swiper = this;
        if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        const el = swiper.params.touchEventsTarget === "container" ? swiper.el : swiper.wrapperEl;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        el.style.cursor = "move";
        el.style.cursor = moving ? "grabbing" : "grab";
        if (swiper.isElement) requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
    }
    function unsetGrabCursor() {
        const swiper = this;
        if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
        if (swiper.isElement) swiper.__preventObserver__ = true;
        swiper[swiper.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "";
        if (swiper.isElement) requestAnimationFrame((() => {
            swiper.__preventObserver__ = false;
        }));
    }
    var grabCursor = {
        setGrabCursor,
        unsetGrabCursor
    };
    function closestElement(selector, base) {
        if (base === void 0) base = this;
        function __closestFrom(el) {
            if (!el || el === ssr_window_esm_getDocument() || el === ssr_window_esm_getWindow()) return null;
            if (el.assignedSlot) el = el.assignedSlot;
            const found = el.closest(selector);
            if (!found && !el.getRootNode) return null;
            return found || __closestFrom(el.getRootNode().host);
        }
        return __closestFrom(base);
    }
    function onTouchStart(event) {
        const swiper = this;
        const document = ssr_window_esm_getDocument();
        const window = ssr_window_esm_getWindow();
        const data = swiper.touchEventsData;
        data.evCache.push(event);
        const {params, touches, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && event.pointerType === "mouse") return;
        if (swiper.animating && params.preventInteractionOnTransition) return;
        if (!swiper.animating && params.cssMode && params.loop) swiper.loopFix();
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        let targetEl = e.target;
        if (params.touchEventsTarget === "wrapper") if (!swiper.wrapperEl.contains(targetEl)) return;
        if ("which" in e && e.which === 3) return;
        if ("button" in e && e.button > 0) return;
        if (data.isTouched && data.isMoved) return;
        const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== "";
        const eventPath = event.composedPath ? event.composedPath() : event.path;
        if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) targetEl = eventPath[0];
        const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
        const isTargetShadow = !!(e.target && e.target.shadowRoot);
        if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
            swiper.allowClick = true;
            return;
        }
        if (params.swipeHandler) if (!targetEl.closest(params.swipeHandler)) return;
        touches.currentX = e.pageX;
        touches.currentY = e.pageY;
        const startX = touches.currentX;
        const startY = touches.currentY;
        const edgeSwipeDetection = params.edgeSwipeDetection || params.iOSEdgeSwipeDetection;
        const edgeSwipeThreshold = params.edgeSwipeThreshold || params.iOSEdgeSwipeThreshold;
        if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) if (edgeSwipeDetection === "prevent") event.preventDefault(); else return;
        Object.assign(data, {
            isTouched: true,
            isMoved: false,
            allowTouchCallbacks: true,
            isScrolling: void 0,
            startMoving: void 0
        });
        touches.startX = startX;
        touches.startY = startY;
        data.touchStartTime = utils_now();
        swiper.allowClick = true;
        swiper.updateSize();
        swiper.swipeDirection = void 0;
        if (params.threshold > 0) data.allowThresholdMove = false;
        let preventDefault = true;
        if (targetEl.matches(data.focusableElements)) {
            preventDefault = false;
            if (targetEl.nodeName === "SELECT") data.isTouched = false;
        }
        if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl) document.activeElement.blur();
        const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
        if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) e.preventDefault();
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) swiper.freeMode.onTouchStart();
        swiper.emit("touchStart", e);
    }
    function onTouchMove(event) {
        const document = ssr_window_esm_getDocument();
        const swiper = this;
        const data = swiper.touchEventsData;
        const {params, touches, rtlTranslate: rtl, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && event.pointerType === "mouse") return;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        if (!data.isTouched) {
            if (data.startMoving && data.isScrolling) swiper.emit("touchMoveOpposite", e);
            return;
        }
        const pointerIndex = data.evCache.findIndex((cachedEv => cachedEv.pointerId === e.pointerId));
        if (pointerIndex >= 0) data.evCache[pointerIndex] = e;
        const targetTouch = data.evCache.length > 1 ? data.evCache[0] : e;
        const pageX = targetTouch.pageX;
        const pageY = targetTouch.pageY;
        if (e.preventedByNestedSwiper) {
            touches.startX = pageX;
            touches.startY = pageY;
            return;
        }
        if (!swiper.allowTouchMove) {
            if (!e.target.matches(data.focusableElements)) swiper.allowClick = false;
            if (data.isTouched) {
                Object.assign(touches, {
                    startX: pageX,
                    startY: pageY,
                    prevX: swiper.touches.currentX,
                    prevY: swiper.touches.currentY,
                    currentX: pageX,
                    currentY: pageY
                });
                data.touchStartTime = utils_now();
            }
            return;
        }
        if (params.touchReleaseOnEdges && !params.loop) if (swiper.isVertical()) {
            if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
                data.isTouched = false;
                data.isMoved = false;
                return;
            }
        } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) return;
        if (document.activeElement) if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
            data.isMoved = true;
            swiper.allowClick = false;
            return;
        }
        if (data.allowTouchCallbacks) swiper.emit("touchMove", e);
        if (e.targetTouches && e.targetTouches.length > 1) return;
        touches.currentX = pageX;
        touches.currentY = pageY;
        const diffX = touches.currentX - touches.startX;
        const diffY = touches.currentY - touches.startY;
        if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
        if (typeof data.isScrolling === "undefined") {
            let touchAngle;
            if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) data.isScrolling = false; else if (diffX * diffX + diffY * diffY >= 25) {
                touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
                data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
            }
        }
        if (data.isScrolling) swiper.emit("touchMoveOpposite", e);
        if (typeof data.startMoving === "undefined") if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) data.startMoving = true;
        if (data.isScrolling || swiper.zoom && swiper.params.zoom && swiper.params.zoom.enabled && data.evCache.length > 1) {
            data.isTouched = false;
            return;
        }
        if (!data.startMoving) return;
        swiper.allowClick = false;
        if (!params.cssMode && e.cancelable) e.preventDefault();
        if (params.touchMoveStopPropagation && !params.nested) e.stopPropagation();
        let diff = swiper.isHorizontal() ? diffX : diffY;
        let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
        if (params.oneWayMovement) {
            diff = Math.abs(diff) * (rtl ? 1 : -1);
            touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
        }
        touches.diff = diff;
        diff *= params.touchRatio;
        if (rtl) {
            diff = -diff;
            touchesDiff = -touchesDiff;
        }
        const prevTouchesDirection = swiper.touchesDirection;
        swiper.swipeDirection = diff > 0 ? "prev" : "next";
        swiper.touchesDirection = touchesDiff > 0 ? "prev" : "next";
        const isLoop = swiper.params.loop && !params.cssMode;
        const allowLoopFix = swiper.swipeDirection === "next" && swiper.allowSlideNext || swiper.swipeDirection === "prev" && swiper.allowSlidePrev;
        if (!data.isMoved) {
            if (isLoop && allowLoopFix) swiper.loopFix({
                direction: swiper.swipeDirection
            });
            data.startTranslate = swiper.getTranslate();
            swiper.setTransition(0);
            if (swiper.animating) {
                const evt = new window.CustomEvent("transitionend", {
                    bubbles: true,
                    cancelable: true
                });
                swiper.wrapperEl.dispatchEvent(evt);
            }
            data.allowMomentumBounce = false;
            if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(true);
            swiper.emit("sliderFirstMove", e);
        }
        let loopFixed;
        if (data.isMoved && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
            swiper.loopFix({
                direction: swiper.swipeDirection,
                setTranslate: true
            });
            loopFixed = true;
        }
        swiper.emit("sliderMove", e);
        data.isMoved = true;
        data.currentTranslate = diff + data.startTranslate;
        let disableParentSwiper = true;
        let resistanceRatio = params.resistanceRatio;
        if (params.touchReleaseOnEdges) resistanceRatio = 0;
        if (diff > 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.size / 2 : swiper.minTranslate())) swiper.loopFix({
                direction: "prev",
                setTranslate: true,
                activeSlideIndex: 0
            });
            if (data.currentTranslate > swiper.minTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
            }
        } else if (diff < 0) {
            if (isLoop && allowLoopFix && !loopFixed && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.size / 2 : swiper.maxTranslate())) swiper.loopFix({
                direction: "next",
                setTranslate: true,
                activeSlideIndex: swiper.slides.length - (params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
            });
            if (data.currentTranslate < swiper.maxTranslate()) {
                disableParentSwiper = false;
                if (params.resistance) data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
            }
        }
        if (disableParentSwiper) e.preventedByNestedSwiper = true;
        if (!swiper.allowSlideNext && swiper.swipeDirection === "next" && data.currentTranslate < data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && swiper.swipeDirection === "prev" && data.currentTranslate > data.startTranslate) data.currentTranslate = data.startTranslate;
        if (!swiper.allowSlidePrev && !swiper.allowSlideNext) data.currentTranslate = data.startTranslate;
        if (params.threshold > 0) if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
            if (!data.allowThresholdMove) {
                data.allowThresholdMove = true;
                touches.startX = touches.currentX;
                touches.startY = touches.currentY;
                data.currentTranslate = data.startTranslate;
                touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
                return;
            }
        } else {
            data.currentTranslate = data.startTranslate;
            return;
        }
        if (!params.followFinger || params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        if (params.freeMode && params.freeMode.enabled && swiper.freeMode) swiper.freeMode.onTouchMove();
        swiper.updateProgress(data.currentTranslate);
        swiper.setTranslate(data.currentTranslate);
    }
    function onTouchEnd(event) {
        const swiper = this;
        const data = swiper.touchEventsData;
        const pointerIndex = data.evCache.findIndex((cachedEv => cachedEv.pointerId === event.pointerId));
        if (pointerIndex >= 0) data.evCache.splice(pointerIndex, 1);
        if ([ "pointercancel", "pointerout", "pointerleave", "contextmenu" ].includes(event.type)) {
            const proceed = [ "pointercancel", "contextmenu" ].includes(event.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
            if (!proceed) return;
        }
        const {params, touches, rtlTranslate: rtl, slidesGrid, enabled} = swiper;
        if (!enabled) return;
        if (!params.simulateTouch && event.pointerType === "mouse") return;
        let e = event;
        if (e.originalEvent) e = e.originalEvent;
        if (data.allowTouchCallbacks) swiper.emit("touchEnd", e);
        data.allowTouchCallbacks = false;
        if (!data.isTouched) {
            if (data.isMoved && params.grabCursor) swiper.setGrabCursor(false);
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) swiper.setGrabCursor(false);
        const touchEndTime = utils_now();
        const timeDiff = touchEndTime - data.touchStartTime;
        if (swiper.allowClick) {
            const pathTree = e.path || e.composedPath && e.composedPath();
            swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
            swiper.emit("tap click", e);
            if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) swiper.emit("doubleTap doubleClick", e);
        }
        data.lastClickTime = utils_now();
        utils_nextTick((() => {
            if (!swiper.destroyed) swiper.allowClick = true;
        }));
        if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 || data.currentTranslate === data.startTranslate) {
            data.isTouched = false;
            data.isMoved = false;
            data.startMoving = false;
            return;
        }
        data.isTouched = false;
        data.isMoved = false;
        data.startMoving = false;
        let currentPos;
        if (params.followFinger) currentPos = rtl ? swiper.translate : -swiper.translate; else currentPos = -data.currentTranslate;
        if (params.cssMode) return;
        if (params.freeMode && params.freeMode.enabled) {
            swiper.freeMode.onTouchEnd({
                currentPos
            });
            return;
        }
        let stopIndex = 0;
        let groupSize = swiper.slidesSizesGrid[0];
        for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
            const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
            if (typeof slidesGrid[i + increment] !== "undefined") {
                if (currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
                    stopIndex = i;
                    groupSize = slidesGrid[i + increment] - slidesGrid[i];
                }
            } else if (currentPos >= slidesGrid[i]) {
                stopIndex = i;
                groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
            }
        }
        let rewindFirstIndex = null;
        let rewindLastIndex = null;
        if (params.rewind) if (swiper.isBeginning) rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1; else if (swiper.isEnd) rewindFirstIndex = 0;
        const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
        const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
        if (timeDiff > params.longSwipesMs) {
            if (!params.longSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            if (swiper.swipeDirection === "next") if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment); else swiper.slideTo(stopIndex);
            if (swiper.swipeDirection === "prev") if (ratio > 1 - params.longSwipesRatio) swiper.slideTo(stopIndex + increment); else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) swiper.slideTo(rewindLastIndex); else swiper.slideTo(stopIndex);
        } else {
            if (!params.shortSwipes) {
                swiper.slideTo(swiper.activeIndex);
                return;
            }
            const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
            if (!isNavButtonTarget) {
                if (swiper.swipeDirection === "next") swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
                if (swiper.swipeDirection === "prev") swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
            } else if (e.target === swiper.navigation.nextEl) swiper.slideTo(stopIndex + increment); else swiper.slideTo(stopIndex);
        }
    }
    function onResize() {
        const swiper = this;
        const {params, el} = swiper;
        if (el && el.offsetWidth === 0) return;
        if (params.breakpoints) swiper.setBreakpoint();
        const {allowSlideNext, allowSlidePrev, snapGrid} = swiper;
        const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
        swiper.allowSlideNext = true;
        swiper.allowSlidePrev = true;
        swiper.updateSize();
        swiper.updateSlides();
        swiper.updateSlidesClasses();
        const isVirtualLoop = isVirtual && params.loop;
        if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) swiper.slideTo(swiper.slides.length - 1, 0, false, true); else if (swiper.params.loop && !isVirtual) swiper.slideToLoop(swiper.realIndex, 0, false, true); else swiper.slideTo(swiper.activeIndex, 0, false, true);
        if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
            clearTimeout(swiper.autoplay.resizeTimeout);
            swiper.autoplay.resizeTimeout = setTimeout((() => {
                if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) swiper.autoplay.resume();
            }), 500);
        }
        swiper.allowSlidePrev = allowSlidePrev;
        swiper.allowSlideNext = allowSlideNext;
        if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
    }
    function onClick(e) {
        const swiper = this;
        if (!swiper.enabled) return;
        if (!swiper.allowClick) {
            if (swiper.params.preventClicks) e.preventDefault();
            if (swiper.params.preventClicksPropagation && swiper.animating) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }
    }
    function onScroll() {
        const swiper = this;
        const {wrapperEl, rtlTranslate, enabled} = swiper;
        if (!enabled) return;
        swiper.previousTranslate = swiper.translate;
        if (swiper.isHorizontal()) swiper.translate = -wrapperEl.scrollLeft; else swiper.translate = -wrapperEl.scrollTop;
        if (swiper.translate === 0) swiper.translate = 0;
        swiper.updateActiveIndex();
        swiper.updateSlidesClasses();
        let newProgress;
        const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
        if (translatesDiff === 0) newProgress = 0; else newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
        if (newProgress !== swiper.progress) swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
        swiper.emit("setTranslate", swiper.translate, false);
    }
    function onLoad(e) {
        const swiper = this;
        processLazyPreloader(swiper, e.target);
        if (swiper.params.cssMode || swiper.params.slidesPerView !== "auto" && !swiper.params.autoHeight) return;
        swiper.update();
    }
    let dummyEventAttached = false;
    function dummyEventListener() {}
    const events = (swiper, method) => {
        const document = ssr_window_esm_getDocument();
        const {params, el, wrapperEl, device} = swiper;
        const capture = !!params.nested;
        const domMethod = method === "on" ? "addEventListener" : "removeEventListener";
        const swiperMethod = method;
        el[domMethod]("pointerdown", swiper.onTouchStart, {
            passive: false
        });
        document[domMethod]("pointermove", swiper.onTouchMove, {
            passive: false,
            capture
        });
        document[domMethod]("pointerup", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointercancel", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerout", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("pointerleave", swiper.onTouchEnd, {
            passive: true
        });
        document[domMethod]("contextmenu", swiper.onTouchEnd, {
            passive: true
        });
        if (params.preventClicks || params.preventClicksPropagation) el[domMethod]("click", swiper.onClick, true);
        if (params.cssMode) wrapperEl[domMethod]("scroll", swiper.onScroll);
        if (params.updateOnWindowResize) swiper[swiperMethod](device.ios || device.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", onResize, true); else swiper[swiperMethod]("observerUpdate", onResize, true);
        el[domMethod]("load", swiper.onLoad, {
            capture: true
        });
    };
    function attachEvents() {
        const swiper = this;
        const document = ssr_window_esm_getDocument();
        const {params} = swiper;
        swiper.onTouchStart = onTouchStart.bind(swiper);
        swiper.onTouchMove = onTouchMove.bind(swiper);
        swiper.onTouchEnd = onTouchEnd.bind(swiper);
        if (params.cssMode) swiper.onScroll = onScroll.bind(swiper);
        swiper.onClick = onClick.bind(swiper);
        swiper.onLoad = onLoad.bind(swiper);
        if (!dummyEventAttached) {
            document.addEventListener("touchstart", dummyEventListener);
            dummyEventAttached = true;
        }
        events(swiper, "on");
    }
    function detachEvents() {
        const swiper = this;
        events(swiper, "off");
    }
    var events$1 = {
        attachEvents,
        detachEvents
    };
    const isGridEnabled = (swiper, params) => swiper.grid && params.grid && params.grid.rows > 1;
    function setBreakpoint() {
        const swiper = this;
        const {realIndex, initialized, params, el} = swiper;
        const breakpoints = params.breakpoints;
        if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;
        const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);
        if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
        const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : void 0;
        const breakpointParams = breakpointOnlyParams || swiper.originalParams;
        const wasMultiRow = isGridEnabled(swiper, params);
        const isMultiRow = isGridEnabled(swiper, breakpointParams);
        const wasEnabled = params.enabled;
        if (wasMultiRow && !isMultiRow) {
            el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        } else if (!wasMultiRow && isMultiRow) {
            el.classList.add(`${params.containerModifierClass}grid`);
            if (breakpointParams.grid.fill && breakpointParams.grid.fill === "column" || !breakpointParams.grid.fill && params.grid.fill === "column") el.classList.add(`${params.containerModifierClass}grid-column`);
            swiper.emitContainerClasses();
        }
        [ "navigation", "pagination", "scrollbar" ].forEach((prop => {
            if (typeof breakpointParams[prop] === "undefined") return;
            const wasModuleEnabled = params[prop] && params[prop].enabled;
            const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
            if (wasModuleEnabled && !isModuleEnabled) swiper[prop].disable();
            if (!wasModuleEnabled && isModuleEnabled) swiper[prop].enable();
        }));
        const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
        const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
        const wasLoop = params.loop;
        if (directionChanged && initialized) swiper.changeDirection();
        utils_extend(swiper.params, breakpointParams);
        const isEnabled = swiper.params.enabled;
        const hasLoop = swiper.params.loop;
        Object.assign(swiper, {
            allowTouchMove: swiper.params.allowTouchMove,
            allowSlideNext: swiper.params.allowSlideNext,
            allowSlidePrev: swiper.params.allowSlidePrev
        });
        if (wasEnabled && !isEnabled) swiper.disable(); else if (!wasEnabled && isEnabled) swiper.enable();
        swiper.currentBreakpoint = breakpoint;
        swiper.emit("_beforeBreakpoint", breakpointParams);
        if (initialized) if (needsReLoop) {
            swiper.loopDestroy();
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (!wasLoop && hasLoop) {
            swiper.loopCreate(realIndex);
            swiper.updateSlides();
        } else if (wasLoop && !hasLoop) swiper.loopDestroy();
        swiper.emit("breakpoint", breakpointParams);
    }
    function getBreakpoint(breakpoints, base, containerEl) {
        if (base === void 0) base = "window";
        if (!breakpoints || base === "container" && !containerEl) return;
        let breakpoint = false;
        const window = ssr_window_esm_getWindow();
        const currentHeight = base === "window" ? window.innerHeight : containerEl.clientHeight;
        const points = Object.keys(breakpoints).map((point => {
            if (typeof point === "string" && point.indexOf("@") === 0) {
                const minRatio = parseFloat(point.substr(1));
                const value = currentHeight * minRatio;
                return {
                    value,
                    point
                };
            }
            return {
                value: point,
                point
            };
        }));
        points.sort(((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10)));
        for (let i = 0; i < points.length; i += 1) {
            const {point, value} = points[i];
            if (base === "window") {
                if (window.matchMedia(`(min-width: ${value}px)`).matches) breakpoint = point;
            } else if (value <= containerEl.clientWidth) breakpoint = point;
        }
        return breakpoint || "max";
    }
    var breakpoints = {
        setBreakpoint,
        getBreakpoint
    };
    function prepareClasses(entries, prefix) {
        const resultClasses = [];
        entries.forEach((item => {
            if (typeof item === "object") Object.keys(item).forEach((classNames => {
                if (item[classNames]) resultClasses.push(prefix + classNames);
            })); else if (typeof item === "string") resultClasses.push(prefix + item);
        }));
        return resultClasses;
    }
    function addClasses() {
        const swiper = this;
        const {classNames, params, rtl, el, device} = swiper;
        const suffixes = prepareClasses([ "initialized", params.direction, {
            "free-mode": swiper.params.freeMode && params.freeMode.enabled
        }, {
            autoheight: params.autoHeight
        }, {
            rtl
        }, {
            grid: params.grid && params.grid.rows > 1
        }, {
            "grid-column": params.grid && params.grid.rows > 1 && params.grid.fill === "column"
        }, {
            android: device.android
        }, {
            ios: device.ios
        }, {
            "css-mode": params.cssMode
        }, {
            centered: params.cssMode && params.centeredSlides
        }, {
            "watch-progress": params.watchSlidesProgress
        } ], params.containerModifierClass);
        classNames.push(...suffixes);
        el.classList.add(...classNames);
        swiper.emitContainerClasses();
    }
    function swiper_core_removeClasses() {
        const swiper = this;
        const {el, classNames} = swiper;
        el.classList.remove(...classNames);
        swiper.emitContainerClasses();
    }
    var classes = {
        addClasses,
        removeClasses: swiper_core_removeClasses
    };
    function checkOverflow() {
        const swiper = this;
        const {isLocked: wasLocked, params} = swiper;
        const {slidesOffsetBefore} = params;
        if (slidesOffsetBefore) {
            const lastSlideIndex = swiper.slides.length - 1;
            const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
            swiper.isLocked = swiper.size > lastSlideRightEdge;
        } else swiper.isLocked = swiper.snapGrid.length === 1;
        if (params.allowSlideNext === true) swiper.allowSlideNext = !swiper.isLocked;
        if (params.allowSlidePrev === true) swiper.allowSlidePrev = !swiper.isLocked;
        if (wasLocked && wasLocked !== swiper.isLocked) swiper.isEnd = false;
        if (wasLocked !== swiper.isLocked) swiper.emit(swiper.isLocked ? "lock" : "unlock");
    }
    var checkOverflow$1 = {
        checkOverflow
    };
    var defaults = {
        init: true,
        direction: "horizontal",
        oneWayMovement: false,
        touchEventsTarget: "wrapper",
        initialSlide: 0,
        speed: 300,
        cssMode: false,
        updateOnWindowResize: true,
        resizeObserver: true,
        nested: false,
        createElements: false,
        enabled: true,
        focusableElements: "input, select, option, textarea, button, video, label",
        width: null,
        height: null,
        preventInteractionOnTransition: false,
        userAgent: null,
        url: null,
        edgeSwipeDetection: false,
        edgeSwipeThreshold: 20,
        autoHeight: false,
        setWrapperSize: false,
        virtualTranslate: false,
        effect: "slide",
        breakpoints: void 0,
        breakpointsBase: "window",
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerGroup: 1,
        slidesPerGroupSkip: 0,
        slidesPerGroupAuto: false,
        centeredSlides: false,
        centeredSlidesBounds: false,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        normalizeSlideIndex: true,
        centerInsufficientSlides: false,
        watchOverflow: true,
        roundLengths: false,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: true,
        shortSwipes: true,
        longSwipes: true,
        longSwipesRatio: .5,
        longSwipesMs: 300,
        followFinger: true,
        allowTouchMove: true,
        threshold: 5,
        touchMoveStopPropagation: false,
        touchStartPreventDefault: true,
        touchStartForcePreventDefault: false,
        touchReleaseOnEdges: false,
        uniqueNavElements: true,
        resistance: true,
        resistanceRatio: .85,
        watchSlidesProgress: false,
        grabCursor: false,
        preventClicks: true,
        preventClicksPropagation: true,
        slideToClickedSlide: false,
        loop: false,
        loopedSlides: null,
        loopPreventsSliding: true,
        rewind: false,
        allowSlidePrev: true,
        allowSlideNext: true,
        swipeHandler: null,
        noSwiping: true,
        noSwipingClass: "swiper-no-swiping",
        noSwipingSelector: null,
        passiveListeners: true,
        maxBackfaceHiddenSlides: 10,
        containerModifierClass: "swiper-",
        slideClass: "swiper-slide",
        slideActiveClass: "swiper-slide-active",
        slideVisibleClass: "swiper-slide-visible",
        slideNextClass: "swiper-slide-next",
        slidePrevClass: "swiper-slide-prev",
        wrapperClass: "swiper-wrapper",
        lazyPreloaderClass: "swiper-lazy-preloader",
        lazyPreloadPrevNext: 0,
        runCallbacksOnInit: true,
        _emitClasses: false
    };
    function moduleExtendParams(params, allModulesParams) {
        return function extendParams(obj) {
            if (obj === void 0) obj = {};
            const moduleParamName = Object.keys(obj)[0];
            const moduleParams = obj[moduleParamName];
            if (typeof moduleParams !== "object" || moduleParams === null) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (params[moduleParamName] === true) params[moduleParamName] = {
                enabled: true
            };
            if (moduleParamName === "navigation" && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) params[moduleParamName].auto = true;
            if ([ "pagination", "scrollbar" ].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) params[moduleParamName].auto = true;
            if (!(moduleParamName in params && "enabled" in moduleParams)) {
                utils_extend(allModulesParams, obj);
                return;
            }
            if (typeof params[moduleParamName] === "object" && !("enabled" in params[moduleParamName])) params[moduleParamName].enabled = true;
            if (!params[moduleParamName]) params[moduleParamName] = {
                enabled: false
            };
            utils_extend(allModulesParams, obj);
        };
    }
    const prototypes = {
        eventsEmitter,
        update,
        translate,
        transition,
        slide,
        loop,
        grabCursor,
        events: events$1,
        breakpoints,
        checkOverflow: checkOverflow$1,
        classes
    };
    const extendedDefaults = {};
    class swiper_core_Swiper {
        constructor() {
            let el;
            let params;
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
            if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === "Object") params = args[0]; else [el, params] = args;
            if (!params) params = {};
            params = utils_extend({}, params);
            if (el && !params.el) params.el = el;
            const document = ssr_window_esm_getDocument();
            if (params.el && typeof params.el === "string" && document.querySelectorAll(params.el).length > 1) {
                const swipers = [];
                document.querySelectorAll(params.el).forEach((containerEl => {
                    const newParams = utils_extend({}, params, {
                        el: containerEl
                    });
                    swipers.push(new swiper_core_Swiper(newParams));
                }));
                return swipers;
            }
            const swiper = this;
            swiper.__swiper__ = true;
            swiper.support = getSupport();
            swiper.device = getDevice({
                userAgent: params.userAgent
            });
            swiper.browser = getBrowser();
            swiper.eventsListeners = {};
            swiper.eventsAnyListeners = [];
            swiper.modules = [ ...swiper.__modules__ ];
            if (params.modules && Array.isArray(params.modules)) swiper.modules.push(...params.modules);
            const allModulesParams = {};
            swiper.modules.forEach((mod => {
                mod({
                    params,
                    swiper,
                    extendParams: moduleExtendParams(params, allModulesParams),
                    on: swiper.on.bind(swiper),
                    once: swiper.once.bind(swiper),
                    off: swiper.off.bind(swiper),
                    emit: swiper.emit.bind(swiper)
                });
            }));
            const swiperParams = utils_extend({}, defaults, allModulesParams);
            swiper.params = utils_extend({}, swiperParams, extendedDefaults, params);
            swiper.originalParams = utils_extend({}, swiper.params);
            swiper.passedParams = utils_extend({}, params);
            if (swiper.params && swiper.params.on) Object.keys(swiper.params.on).forEach((eventName => {
                swiper.on(eventName, swiper.params.on[eventName]);
            }));
            if (swiper.params && swiper.params.onAny) swiper.onAny(swiper.params.onAny);
            Object.assign(swiper, {
                enabled: swiper.params.enabled,
                el,
                classNames: [],
                slides: [],
                slidesGrid: [],
                snapGrid: [],
                slidesSizesGrid: [],
                isHorizontal() {
                    return swiper.params.direction === "horizontal";
                },
                isVertical() {
                    return swiper.params.direction === "vertical";
                },
                activeIndex: 0,
                realIndex: 0,
                isBeginning: true,
                isEnd: false,
                translate: 0,
                previousTranslate: 0,
                progress: 0,
                velocity: 0,
                animating: false,
                cssOverflowAdjustment() {
                    return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
                },
                allowSlideNext: swiper.params.allowSlideNext,
                allowSlidePrev: swiper.params.allowSlidePrev,
                touchEventsData: {
                    isTouched: void 0,
                    isMoved: void 0,
                    allowTouchCallbacks: void 0,
                    touchStartTime: void 0,
                    isScrolling: void 0,
                    currentTranslate: void 0,
                    startTranslate: void 0,
                    allowThresholdMove: void 0,
                    focusableElements: swiper.params.focusableElements,
                    lastClickTime: 0,
                    clickTimeout: void 0,
                    velocities: [],
                    allowMomentumBounce: void 0,
                    startMoving: void 0,
                    evCache: []
                },
                allowClick: true,
                allowTouchMove: swiper.params.allowTouchMove,
                touches: {
                    startX: 0,
                    startY: 0,
                    currentX: 0,
                    currentY: 0,
                    diff: 0
                },
                imagesToLoad: [],
                imagesLoaded: 0
            });
            swiper.emit("_swiper");
            if (swiper.params.init) swiper.init();
            return swiper;
        }
        getSlideIndex(slideEl) {
            const {slidesEl, params} = this;
            const slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
            const firstSlideIndex = utils_elementIndex(slides[0]);
            return utils_elementIndex(slideEl) - firstSlideIndex;
        }
        getSlideIndexByData(index) {
            return this.getSlideIndex(this.slides.filter((slideEl => slideEl.getAttribute("data-swiper-slide-index") * 1 === index))[0]);
        }
        recalcSlides() {
            const swiper = this;
            const {slidesEl, params} = swiper;
            swiper.slides = utils_elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
        }
        enable() {
            const swiper = this;
            if (swiper.enabled) return;
            swiper.enabled = true;
            if (swiper.params.grabCursor) swiper.setGrabCursor();
            swiper.emit("enable");
        }
        disable() {
            const swiper = this;
            if (!swiper.enabled) return;
            swiper.enabled = false;
            if (swiper.params.grabCursor) swiper.unsetGrabCursor();
            swiper.emit("disable");
        }
        setProgress(progress, speed) {
            const swiper = this;
            progress = Math.min(Math.max(progress, 0), 1);
            const min = swiper.minTranslate();
            const max = swiper.maxTranslate();
            const current = (max - min) * progress + min;
            swiper.translateTo(current, typeof speed === "undefined" ? 0 : speed);
            swiper.updateActiveIndex();
            swiper.updateSlidesClasses();
        }
        emitContainerClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const cls = swiper.el.className.split(" ").filter((className => className.indexOf("swiper") === 0 || className.indexOf(swiper.params.containerModifierClass) === 0));
            swiper.emit("_containerClasses", cls.join(" "));
        }
        getSlideClasses(slideEl) {
            const swiper = this;
            if (swiper.destroyed) return "";
            return slideEl.className.split(" ").filter((className => className.indexOf("swiper-slide") === 0 || className.indexOf(swiper.params.slideClass) === 0)).join(" ");
        }
        emitSlidesClasses() {
            const swiper = this;
            if (!swiper.params._emitClasses || !swiper.el) return;
            const updates = [];
            swiper.slides.forEach((slideEl => {
                const classNames = swiper.getSlideClasses(slideEl);
                updates.push({
                    slideEl,
                    classNames
                });
                swiper.emit("_slideClass", slideEl, classNames);
            }));
            swiper.emit("_slideClasses", updates);
        }
        slidesPerViewDynamic(view, exact) {
            if (view === void 0) view = "current";
            if (exact === void 0) exact = false;
            const swiper = this;
            const {params, slides, slidesGrid, slidesSizesGrid, size: swiperSize, activeIndex} = swiper;
            let spv = 1;
            if (typeof params.slidesPerView === "number") return params.slidesPerView;
            if (params.centeredSlides) {
                let slideSize = slides[activeIndex] ? slides[activeIndex].swiperSlideSize : 0;
                let breakLoop;
                for (let i = activeIndex + 1; i < slides.length; i += 1) if (slides[i] && !breakLoop) {
                    slideSize += slides[i].swiperSlideSize;
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
                for (let i = activeIndex - 1; i >= 0; i -= 1) if (slides[i] && !breakLoop) {
                    slideSize += slides[i].swiperSlideSize;
                    spv += 1;
                    if (slideSize > swiperSize) breakLoop = true;
                }
            } else if (view === "current") for (let i = activeIndex + 1; i < slides.length; i += 1) {
                const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
                if (slideInView) spv += 1;
            } else for (let i = activeIndex - 1; i >= 0; i -= 1) {
                const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
                if (slideInView) spv += 1;
            }
            return spv;
        }
        update() {
            const swiper = this;
            if (!swiper || swiper.destroyed) return;
            const {snapGrid, params} = swiper;
            if (params.breakpoints) swiper.setBreakpoint();
            [ ...swiper.el.querySelectorAll('[loading="lazy"]') ].forEach((imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl);
            }));
            swiper.updateSize();
            swiper.updateSlides();
            swiper.updateProgress();
            swiper.updateSlidesClasses();
            function setTranslate() {
                const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
                const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
                swiper.setTranslate(newTranslate);
                swiper.updateActiveIndex();
                swiper.updateSlidesClasses();
            }
            let translated;
            if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
                setTranslate();
                if (params.autoHeight) swiper.updateAutoHeight();
            } else {
                if ((params.slidesPerView === "auto" || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
                    const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
                    translated = swiper.slideTo(slides.length - 1, 0, false, true);
                } else translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
                if (!translated) setTranslate();
            }
            if (params.watchOverflow && snapGrid !== swiper.snapGrid) swiper.checkOverflow();
            swiper.emit("update");
        }
        changeDirection(newDirection, needUpdate) {
            if (needUpdate === void 0) needUpdate = true;
            const swiper = this;
            const currentDirection = swiper.params.direction;
            if (!newDirection) newDirection = currentDirection === "horizontal" ? "vertical" : "horizontal";
            if (newDirection === currentDirection || newDirection !== "horizontal" && newDirection !== "vertical") return swiper;
            swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
            swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
            swiper.emitContainerClasses();
            swiper.params.direction = newDirection;
            swiper.slides.forEach((slideEl => {
                if (newDirection === "vertical") slideEl.style.width = ""; else slideEl.style.height = "";
            }));
            swiper.emit("changeDirection");
            if (needUpdate) swiper.update();
            return swiper;
        }
        changeLanguageDirection(direction) {
            const swiper = this;
            if (swiper.rtl && direction === "rtl" || !swiper.rtl && direction === "ltr") return;
            swiper.rtl = direction === "rtl";
            swiper.rtlTranslate = swiper.params.direction === "horizontal" && swiper.rtl;
            if (swiper.rtl) {
                swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "rtl";
            } else {
                swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
                swiper.el.dir = "ltr";
            }
            swiper.update();
        }
        mount(element) {
            const swiper = this;
            if (swiper.mounted) return true;
            let el = element || swiper.params.el;
            if (typeof el === "string") el = document.querySelector(el);
            if (!el) return false;
            el.swiper = swiper;
            if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === "SWIPER-CONTAINER") swiper.isElement = true;
            const getWrapperSelector = () => `.${(swiper.params.wrapperClass || "").trim().split(" ").join(".")}`;
            const getWrapper = () => {
                if (el && el.shadowRoot && el.shadowRoot.querySelector) {
                    const res = el.shadowRoot.querySelector(getWrapperSelector());
                    return res;
                }
                return utils_elementChildren(el, getWrapperSelector())[0];
            };
            let wrapperEl = getWrapper();
            if (!wrapperEl && swiper.params.createElements) {
                wrapperEl = utils_createElement("div", swiper.params.wrapperClass);
                el.append(wrapperEl);
                utils_elementChildren(el, `.${swiper.params.slideClass}`).forEach((slideEl => {
                    wrapperEl.append(slideEl);
                }));
            }
            Object.assign(swiper, {
                el,
                wrapperEl,
                slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
                hostEl: swiper.isElement ? el.parentNode.host : el,
                mounted: true,
                rtl: el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl",
                rtlTranslate: swiper.params.direction === "horizontal" && (el.dir.toLowerCase() === "rtl" || elementStyle(el, "direction") === "rtl"),
                wrongRTL: elementStyle(wrapperEl, "display") === "-webkit-box"
            });
            return true;
        }
        init(el) {
            const swiper = this;
            if (swiper.initialized) return swiper;
            const mounted = swiper.mount(el);
            if (mounted === false) return swiper;
            swiper.emit("beforeInit");
            if (swiper.params.breakpoints) swiper.setBreakpoint();
            swiper.addClasses();
            swiper.updateSize();
            swiper.updateSlides();
            if (swiper.params.watchOverflow) swiper.checkOverflow();
            if (swiper.params.grabCursor && swiper.enabled) swiper.setGrabCursor();
            if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true); else swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
            if (swiper.params.loop) swiper.loopCreate();
            swiper.attachEvents();
            const lazyElements = [ ...swiper.el.querySelectorAll('[loading="lazy"]') ];
            if (swiper.isElement) lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
            lazyElements.forEach((imageEl => {
                if (imageEl.complete) processLazyPreloader(swiper, imageEl); else imageEl.addEventListener("load", (e => {
                    processLazyPreloader(swiper, e.target);
                }));
            }));
            preload(swiper);
            swiper.initialized = true;
            preload(swiper);
            swiper.emit("init");
            swiper.emit("afterInit");
            return swiper;
        }
        destroy(deleteInstance, cleanStyles) {
            if (deleteInstance === void 0) deleteInstance = true;
            if (cleanStyles === void 0) cleanStyles = true;
            const swiper = this;
            const {params, el, wrapperEl, slides} = swiper;
            if (typeof swiper.params === "undefined" || swiper.destroyed) return null;
            swiper.emit("beforeDestroy");
            swiper.initialized = false;
            swiper.detachEvents();
            if (params.loop) swiper.loopDestroy();
            if (cleanStyles) {
                swiper.removeClasses();
                el.removeAttribute("style");
                wrapperEl.removeAttribute("style");
                if (slides && slides.length) slides.forEach((slideEl => {
                    slideEl.classList.remove(params.slideVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
                    slideEl.removeAttribute("style");
                    slideEl.removeAttribute("data-swiper-slide-index");
                }));
            }
            swiper.emit("destroy");
            Object.keys(swiper.eventsListeners).forEach((eventName => {
                swiper.off(eventName);
            }));
            if (deleteInstance !== false) {
                swiper.el.swiper = null;
                deleteProps(swiper);
            }
            swiper.destroyed = true;
            return null;
        }
        static extendDefaults(newDefaults) {
            utils_extend(extendedDefaults, newDefaults);
        }
        static get extendedDefaults() {
            return extendedDefaults;
        }
        static get defaults() {
            return defaults;
        }
        static installModule(mod) {
            if (!swiper_core_Swiper.prototype.__modules__) swiper_core_Swiper.prototype.__modules__ = [];
            const modules = swiper_core_Swiper.prototype.__modules__;
            if (typeof mod === "function" && modules.indexOf(mod) < 0) modules.push(mod);
        }
        static use(module) {
            if (Array.isArray(module)) {
                module.forEach((m => swiper_core_Swiper.installModule(m)));
                return swiper_core_Swiper;
            }
            swiper_core_Swiper.installModule(module);
            return swiper_core_Swiper;
        }
    }
    Object.keys(prototypes).forEach((prototypeGroup => {
        Object.keys(prototypes[prototypeGroup]).forEach((protoMethod => {
            swiper_core_Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
        }));
    }));
    swiper_core_Swiper.use([ Resize, Observer ]);
    function create_element_if_not_defined_createElementIfNotDefined(swiper, originalParams, params, checkProps) {
        if (swiper.params.createElements) Object.keys(checkProps).forEach((key => {
            if (!params[key] && params.auto === true) {
                let element = utils_elementChildren(swiper.el, `.${checkProps[key]}`)[0];
                if (!element) {
                    element = utils_createElement("div", checkProps[key]);
                    element.className = checkProps[key];
                    swiper.el.append(element);
                }
                params[key] = element;
                originalParams[key] = element;
            }
        }));
        return params;
    }
    function Navigation(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        extendParams({
            navigation: {
                nextEl: null,
                prevEl: null,
                hideOnClick: false,
                disabledClass: "swiper-button-disabled",
                hiddenClass: "swiper-button-hidden",
                lockClass: "swiper-button-lock",
                navigationDisabledClass: "swiper-navigation-disabled"
            }
        });
        swiper.navigation = {
            nextEl: null,
            prevEl: null
        };
        const makeElementsArray = el => (Array.isArray(el) ? el : [ el ]).filter((e => !!e));
        function getEl(el) {
            let res;
            if (el && typeof el === "string" && swiper.isElement) {
                res = swiper.el.querySelector(el);
                if (res) return res;
            }
            if (el) {
                if (typeof el === "string") res = [ ...document.querySelectorAll(el) ];
                if (swiper.params.uniqueNavElements && typeof el === "string" && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) res = swiper.el.querySelector(el);
            }
            if (el && !res) return el;
            return res;
        }
        function toggleEl(el, disabled) {
            const params = swiper.params.navigation;
            el = makeElementsArray(el);
            el.forEach((subEl => {
                if (subEl) {
                    subEl.classList[disabled ? "add" : "remove"](...params.disabledClass.split(" "));
                    if (subEl.tagName === "BUTTON") subEl.disabled = disabled;
                    if (swiper.params.watchOverflow && swiper.enabled) subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
                }
            }));
        }
        function update() {
            const {nextEl, prevEl} = swiper.navigation;
            if (swiper.params.loop) {
                toggleEl(prevEl, false);
                toggleEl(nextEl, false);
                return;
            }
            toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
            toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
        }
        function onPrevClick(e) {
            e.preventDefault();
            if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
            swiper.slidePrev();
            emit("navigationPrev");
        }
        function onNextClick(e) {
            e.preventDefault();
            if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
            swiper.slideNext();
            emit("navigationNext");
        }
        function init() {
            const params = swiper.params.navigation;
            swiper.params.navigation = create_element_if_not_defined_createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
                nextEl: "swiper-button-next",
                prevEl: "swiper-button-prev"
            });
            if (!(params.nextEl || params.prevEl)) return;
            let nextEl = getEl(params.nextEl);
            let prevEl = getEl(params.prevEl);
            Object.assign(swiper.navigation, {
                nextEl,
                prevEl
            });
            nextEl = makeElementsArray(nextEl);
            prevEl = makeElementsArray(prevEl);
            const initButton = (el, dir) => {
                if (el) el.addEventListener("click", dir === "next" ? onNextClick : onPrevClick);
                if (!swiper.enabled && el) el.classList.add(...params.lockClass.split(" "));
            };
            nextEl.forEach((el => initButton(el, "next")));
            prevEl.forEach((el => initButton(el, "prev")));
        }
        function destroy() {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = makeElementsArray(nextEl);
            prevEl = makeElementsArray(prevEl);
            const destroyButton = (el, dir) => {
                el.removeEventListener("click", dir === "next" ? onNextClick : onPrevClick);
                el.classList.remove(...swiper.params.navigation.disabledClass.split(" "));
            };
            nextEl.forEach((el => destroyButton(el, "next")));
            prevEl.forEach((el => destroyButton(el, "prev")));
        }
        on("init", (() => {
            if (swiper.params.navigation.enabled === false) disable(); else {
                init();
                update();
            }
        }));
        on("toEdge fromEdge lock unlock", (() => {
            update();
        }));
        on("destroy", (() => {
            destroy();
        }));
        on("enable disable", (() => {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = makeElementsArray(nextEl);
            prevEl = makeElementsArray(prevEl);
            if (swiper.enabled) {
                update();
                return;
            }
            [ ...nextEl, ...prevEl ].filter((el => !!el)).forEach((el => el.classList.add(swiper.params.navigation.lockClass)));
        }));
        on("click", ((_s, e) => {
            let {nextEl, prevEl} = swiper.navigation;
            nextEl = makeElementsArray(nextEl);
            prevEl = makeElementsArray(prevEl);
            const targetEl = e.target;
            if (swiper.params.navigation.hideOnClick && !prevEl.includes(targetEl) && !nextEl.includes(targetEl)) {
                if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
                let isHidden;
                if (nextEl.length) isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass); else if (prevEl.length) isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
                if (isHidden === true) emit("navigationShow"); else emit("navigationHide");
                [ ...nextEl, ...prevEl ].filter((el => !!el)).forEach((el => el.classList.toggle(swiper.params.navigation.hiddenClass)));
            }
        }));
        const enable = () => {
            swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(" "));
            init();
            update();
        };
        const disable = () => {
            swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(" "));
            destroy();
        };
        Object.assign(swiper.navigation, {
            enable,
            disable,
            update,
            init,
            destroy
        });
    }
    function classes_to_selector_classesToSelector(classes) {
        if (classes === void 0) classes = "";
        return `.${classes.trim().replace(/([\.:!+\/])/g, "\\$1").replace(/ /g, ".")}`;
    }
    function Pagination(_ref) {
        let {swiper, extendParams, on, emit} = _ref;
        const pfx = "swiper-pagination";
        extendParams({
            pagination: {
                el: null,
                bulletElement: "span",
                clickable: false,
                hideOnClick: false,
                renderBullet: null,
                renderProgressbar: null,
                renderFraction: null,
                renderCustom: null,
                progressbarOpposite: false,
                type: "bullets",
                dynamicBullets: false,
                dynamicMainBullets: 1,
                formatFractionCurrent: number => number,
                formatFractionTotal: number => number,
                bulletClass: `${pfx}-bullet`,
                bulletActiveClass: `${pfx}-bullet-active`,
                modifierClass: `${pfx}-`,
                currentClass: `${pfx}-current`,
                totalClass: `${pfx}-total`,
                hiddenClass: `${pfx}-hidden`,
                progressbarFillClass: `${pfx}-progressbar-fill`,
                progressbarOppositeClass: `${pfx}-progressbar-opposite`,
                clickableClass: `${pfx}-clickable`,
                lockClass: `${pfx}-lock`,
                horizontalClass: `${pfx}-horizontal`,
                verticalClass: `${pfx}-vertical`,
                paginationDisabledClass: `${pfx}-disabled`
            }
        });
        swiper.pagination = {
            el: null,
            bullets: []
        };
        let bulletSize;
        let dynamicBulletIndex = 0;
        const makeElementsArray = el => (Array.isArray(el) ? el : [ el ]).filter((e => !!e));
        function isPaginationDisabled() {
            return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
        }
        function setSideBullets(bulletEl, position) {
            const {bulletActiveClass} = swiper.params.pagination;
            if (!bulletEl) return;
            bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
            if (bulletEl) {
                bulletEl.classList.add(`${bulletActiveClass}-${position}`);
                bulletEl = bulletEl[`${position === "prev" ? "previous" : "next"}ElementSibling`];
                if (bulletEl) bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
            }
        }
        function onBulletClick(e) {
            const bulletEl = e.target.closest(classes_to_selector_classesToSelector(swiper.params.pagination.bulletClass));
            if (!bulletEl) return;
            e.preventDefault();
            const index = utils_elementIndex(bulletEl) * swiper.params.slidesPerGroup;
            if (swiper.params.loop) {
                if (swiper.realIndex === index) return;
                const realIndex = swiper.realIndex;
                const newSlideIndex = swiper.getSlideIndexByData(index);
                const currentSlideIndex = swiper.getSlideIndexByData(swiper.realIndex);
                const loopFix = dir => {
                    const indexBeforeLoopFix = swiper.activeIndex;
                    swiper.loopFix({
                        direction: dir,
                        activeSlideIndex: newSlideIndex,
                        slideTo: false
                    });
                    const indexAfterFix = swiper.activeIndex;
                    if (indexBeforeLoopFix === indexAfterFix) swiper.slideToLoop(realIndex, 0, false, true);
                };
                if (newSlideIndex > swiper.slides.length - swiper.loopedSlides) loopFix(newSlideIndex > currentSlideIndex ? "next" : "prev"); else if (swiper.params.centeredSlides) {
                    const slidesPerView = swiper.params.slidesPerView === "auto" ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
                    if (newSlideIndex < Math.floor(slidesPerView / 2)) loopFix("prev");
                }
                swiper.slideToLoop(index);
            } else swiper.slideTo(index);
        }
        function update() {
            const rtl = swiper.rtl;
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            let el = swiper.pagination.el;
            el = makeElementsArray(el);
            let current;
            let previousIndex;
            const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
            const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
            if (swiper.params.loop) {
                previousIndex = swiper.previousRealIndex || 0;
                current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
            } else if (typeof swiper.snapIndex !== "undefined") {
                current = swiper.snapIndex;
                previousIndex = swiper.previousSnapIndex;
            } else {
                previousIndex = swiper.previousIndex || 0;
                current = swiper.activeIndex || 0;
            }
            if (params.type === "bullets" && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
                const bullets = swiper.pagination.bullets;
                let firstIndex;
                let lastIndex;
                let midIndex;
                if (params.dynamicBullets) {
                    bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? "width" : "height", true);
                    el.forEach((subEl => {
                        subEl.style[swiper.isHorizontal() ? "width" : "height"] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
                    }));
                    if (params.dynamicMainBullets > 1 && previousIndex !== void 0) {
                        dynamicBulletIndex += current - (previousIndex || 0);
                        if (dynamicBulletIndex > params.dynamicMainBullets - 1) dynamicBulletIndex = params.dynamicMainBullets - 1; else if (dynamicBulletIndex < 0) dynamicBulletIndex = 0;
                    }
                    firstIndex = Math.max(current - dynamicBulletIndex, 0);
                    lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
                    midIndex = (lastIndex + firstIndex) / 2;
                }
                bullets.forEach((bulletEl => {
                    const classesToRemove = [ ...[ "", "-next", "-next-next", "-prev", "-prev-prev", "-main" ].map((suffix => `${params.bulletActiveClass}${suffix}`)) ].map((s => typeof s === "string" && s.includes(" ") ? s.split(" ") : s)).flat();
                    bulletEl.classList.remove(...classesToRemove);
                }));
                if (el.length > 1) bullets.forEach((bullet => {
                    const bulletIndex = utils_elementIndex(bullet);
                    if (bulletIndex === current) bullet.classList.add(...params.bulletActiveClass.split(" ")); else if (swiper.isElement) bullet.setAttribute("part", "bullet");
                    if (params.dynamicBullets) {
                        if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) bullet.classList.add(...`${params.bulletActiveClass}-main`.split(" "));
                        if (bulletIndex === firstIndex) setSideBullets(bullet, "prev");
                        if (bulletIndex === lastIndex) setSideBullets(bullet, "next");
                    }
                })); else {
                    const bullet = bullets[current];
                    if (bullet) bullet.classList.add(...params.bulletActiveClass.split(" "));
                    if (swiper.isElement) bullets.forEach(((bulletEl, bulletIndex) => {
                        bulletEl.setAttribute("part", bulletIndex === current ? "bullet-active" : "bullet");
                    }));
                    if (params.dynamicBullets) {
                        const firstDisplayedBullet = bullets[firstIndex];
                        const lastDisplayedBullet = bullets[lastIndex];
                        for (let i = firstIndex; i <= lastIndex; i += 1) if (bullets[i]) bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(" "));
                        setSideBullets(firstDisplayedBullet, "prev");
                        setSideBullets(lastDisplayedBullet, "next");
                    }
                }
                if (params.dynamicBullets) {
                    const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
                    const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
                    const offsetProp = rtl ? "right" : "left";
                    bullets.forEach((bullet => {
                        bullet.style[swiper.isHorizontal() ? offsetProp : "top"] = `${bulletsOffset}px`;
                    }));
                }
            }
            el.forEach(((subEl, subElIndex) => {
                if (params.type === "fraction") {
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.currentClass)).forEach((fractionEl => {
                        fractionEl.textContent = params.formatFractionCurrent(current + 1);
                    }));
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.totalClass)).forEach((totalEl => {
                        totalEl.textContent = params.formatFractionTotal(total);
                    }));
                }
                if (params.type === "progressbar") {
                    let progressbarDirection;
                    if (params.progressbarOpposite) progressbarDirection = swiper.isHorizontal() ? "vertical" : "horizontal"; else progressbarDirection = swiper.isHorizontal() ? "horizontal" : "vertical";
                    const scale = (current + 1) / total;
                    let scaleX = 1;
                    let scaleY = 1;
                    if (progressbarDirection === "horizontal") scaleX = scale; else scaleY = scale;
                    subEl.querySelectorAll(classes_to_selector_classesToSelector(params.progressbarFillClass)).forEach((progressEl => {
                        progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
                        progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
                    }));
                }
                if (params.type === "custom" && params.renderCustom) {
                    subEl.innerHTML = params.renderCustom(swiper, current + 1, total);
                    if (subElIndex === 0) emit("paginationRender", subEl);
                } else {
                    if (subElIndex === 0) emit("paginationRender", subEl);
                    emit("paginationUpdate", subEl);
                }
                if (swiper.params.watchOverflow && swiper.enabled) subEl.classList[swiper.isLocked ? "add" : "remove"](params.lockClass);
            }));
        }
        function render() {
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
            let el = swiper.pagination.el;
            el = makeElementsArray(el);
            let paginationHTML = "";
            if (params.type === "bullets") {
                let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
                if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) numberOfBullets = slidesLength;
                for (let i = 0; i < numberOfBullets; i += 1) if (params.renderBullet) paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass); else paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ""} class="${params.bulletClass}"></${params.bulletElement}>`;
            }
            if (params.type === "fraction") if (params.renderFraction) paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass); else paginationHTML = `<span class="${params.currentClass}"></span>` + " / " + `<span class="${params.totalClass}"></span>`;
            if (params.type === "progressbar") if (params.renderProgressbar) paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass); else paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
            swiper.pagination.bullets = [];
            el.forEach((subEl => {
                if (params.type !== "custom") subEl.innerHTML = paginationHTML || "";
                if (params.type === "bullets") swiper.pagination.bullets.push(...subEl.querySelectorAll(classes_to_selector_classesToSelector(params.bulletClass)));
            }));
            if (params.type !== "custom") emit("paginationRender", el[0]);
        }
        function init() {
            swiper.params.pagination = create_element_if_not_defined_createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
                el: "swiper-pagination"
            });
            const params = swiper.params.pagination;
            if (!params.el) return;
            let el;
            if (typeof params.el === "string" && swiper.isElement) el = swiper.el.querySelector(params.el);
            if (!el && typeof params.el === "string") el = [ ...document.querySelectorAll(params.el) ];
            if (!el) el = params.el;
            if (!el || el.length === 0) return;
            if (swiper.params.uniqueNavElements && typeof params.el === "string" && Array.isArray(el) && el.length > 1) {
                el = [ ...swiper.el.querySelectorAll(params.el) ];
                if (el.length > 1) el = el.filter((subEl => {
                    if (utils_elementParents(subEl, ".swiper")[0] !== swiper.el) return false;
                    return true;
                }))[0];
            }
            if (Array.isArray(el) && el.length === 1) el = el[0];
            Object.assign(swiper.pagination, {
                el
            });
            el = makeElementsArray(el);
            el.forEach((subEl => {
                if (params.type === "bullets" && params.clickable) subEl.classList.add(...(params.clickableClass || "").split(" "));
                subEl.classList.add(params.modifierClass + params.type);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                if (params.type === "bullets" && params.dynamicBullets) {
                    subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
                    dynamicBulletIndex = 0;
                    if (params.dynamicMainBullets < 1) params.dynamicMainBullets = 1;
                }
                if (params.type === "progressbar" && params.progressbarOpposite) subEl.classList.add(params.progressbarOppositeClass);
                if (params.clickable) subEl.addEventListener("click", onBulletClick);
                if (!swiper.enabled) subEl.classList.add(params.lockClass);
            }));
        }
        function destroy() {
            const params = swiper.params.pagination;
            if (isPaginationDisabled()) return;
            let el = swiper.pagination.el;
            if (el) {
                el = makeElementsArray(el);
                el.forEach((subEl => {
                    subEl.classList.remove(params.hiddenClass);
                    subEl.classList.remove(params.modifierClass + params.type);
                    subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
                    if (params.clickable) {
                        subEl.classList.remove(...(params.clickableClass || "").split(" "));
                        subEl.removeEventListener("click", onBulletClick);
                    }
                }));
            }
            if (swiper.pagination.bullets) swiper.pagination.bullets.forEach((subEl => subEl.classList.remove(...params.bulletActiveClass.split(" "))));
        }
        on("changeDirection", (() => {
            if (!swiper.pagination || !swiper.pagination.el) return;
            const params = swiper.params.pagination;
            let {el} = swiper.pagination;
            el = makeElementsArray(el);
            el.forEach((subEl => {
                subEl.classList.remove(params.horizontalClass, params.verticalClass);
                subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
            }));
        }));
        on("init", (() => {
            if (swiper.params.pagination.enabled === false) disable(); else {
                init();
                render();
                update();
            }
        }));
        on("activeIndexChange", (() => {
            if (typeof swiper.snapIndex === "undefined") update();
        }));
        on("snapIndexChange", (() => {
            update();
        }));
        on("snapGridLengthChange", (() => {
            render();
            update();
        }));
        on("destroy", (() => {
            destroy();
        }));
        on("enable disable", (() => {
            let {el} = swiper.pagination;
            if (el) {
                el = makeElementsArray(el);
                el.forEach((subEl => subEl.classList[swiper.enabled ? "remove" : "add"](swiper.params.pagination.lockClass)));
            }
        }));
        on("lock unlock", (() => {
            update();
        }));
        on("click", ((_s, e) => {
            const targetEl = e.target;
            const el = makeElementsArray(swiper.pagination.el);
            if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
                if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
                const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
                if (isHidden === true) emit("paginationShow"); else emit("paginationHide");
                el.forEach((subEl => subEl.classList.toggle(swiper.params.pagination.hiddenClass)));
            }
        }));
        const enable = () => {
            swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
            let {el} = swiper.pagination;
            if (el) {
                el = makeElementsArray(el);
                el.forEach((subEl => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass)));
            }
            init();
            render();
            update();
        };
        const disable = () => {
            swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
            let {el} = swiper.pagination;
            if (el) {
                el = makeElementsArray(el);
                el.forEach((subEl => subEl.classList.add(swiper.params.pagination.paginationDisabledClass)));
            }
            destroy();
        };
        Object.assign(swiper.pagination, {
            enable,
            disable,
            render,
            update,
            init,
            destroy
        });
    }
    function initSliders() {
        if (document.querySelector(".swiper")) new swiper_core_Swiper(".swiper", {
            modules: [ Navigation ],
            observer: true,
            observeParents: true,
            slidesPerView: 2.5,
            spaceBetween: 0,
            autoHeight: false,
            speed: 800,
            navigation: {
                prevEl: ".swiper-button-prev",
                nextEl: ".swiper-button-next"
            },
            breakpoints: {
                375: {
                    slidesPerView: 1.3,
                    spaceBetween: 0
                },
                500: {
                    slidesPerView: 1.5,
                    spaceBetween: 0
                },
                961: {
                    slidesPerView: 2.5,
                    spaceBetween: 0
                }
            },
            on: {}
        });
        if (document.querySelector(".swiper-skiing")) new swiper_core_Swiper(".swiper-skiing", {
            modules: [ Pagination ],
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            spaceBetween: 0,
            autoHeight: false,
            speed: 800,
            pagination: {
                el: ".swiper-pagination",
                clickable: true
            },
            on: {}
        });
    }
    window.addEventListener("load", (function(e) {
        initSliders();
    }));
    function lastItemOf(arr) {
        return arr[arr.length - 1];
    }
    function pushUnique(arr, ...items) {
        items.forEach((item => {
            if (arr.includes(item)) return;
            arr.push(item);
        }));
        return arr;
    }
    function stringToArray(str, separator) {
        return str ? str.split(separator) : [];
    }
    function isInRange(testVal, min, max) {
        const minOK = min === void 0 || testVal >= min;
        const maxOK = max === void 0 || testVal <= max;
        return minOK && maxOK;
    }
    function limitToRange(val, min, max) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }
    function createTagRepeat(tagName, repeat, attributes = {}, index = 0, html = "") {
        const openTagSrc = Object.keys(attributes).reduce(((src, attr) => {
            let val = attributes[attr];
            if (typeof val === "function") val = val(index);
            return `${src} ${attr}="${val}"`;
        }), tagName);
        html += `<${openTagSrc}></${tagName}>`;
        const next = index + 1;
        return next < repeat ? createTagRepeat(tagName, repeat, attributes, next, html) : html;
    }
    function optimizeTemplateHTML(html) {
        return html.replace(/>\s+/g, ">").replace(/\s+</, "<");
    }
    function stripTime(timeValue) {
        return new Date(timeValue).setHours(0, 0, 0, 0);
    }
    function today() {
        return (new Date).setHours(0, 0, 0, 0);
    }
    function dateValue(...args) {
        switch (args.length) {
          case 0:
            return today();

          case 1:
            return stripTime(args[0]);
        }
        const newDate = new Date(0);
        newDate.setFullYear(...args);
        return newDate.setHours(0, 0, 0, 0);
    }
    function addDays(date, amount) {
        const newDate = new Date(date);
        return newDate.setDate(newDate.getDate() + amount);
    }
    function addWeeks(date, amount) {
        return addDays(date, amount * 7);
    }
    function addMonths(date, amount) {
        const newDate = new Date(date);
        const monthsToSet = newDate.getMonth() + amount;
        let expectedMonth = monthsToSet % 12;
        if (expectedMonth < 0) expectedMonth += 12;
        const time = newDate.setMonth(monthsToSet);
        return newDate.getMonth() !== expectedMonth ? newDate.setDate(0) : time;
    }
    function addYears(date, amount) {
        const newDate = new Date(date);
        const expectedMonth = newDate.getMonth();
        const time = newDate.setFullYear(newDate.getFullYear() + amount);
        return expectedMonth === 1 && newDate.getMonth() === 2 ? newDate.setDate(0) : time;
    }
    function dayDiff(day, from) {
        return (day - from + 7) % 7;
    }
    function dayOfTheWeekOf(baseDate, dayOfWeek, weekStart = 0) {
        const baseDay = new Date(baseDate).getDay();
        return addDays(baseDate, dayDiff(dayOfWeek, weekStart) - dayDiff(baseDay, weekStart));
    }
    function calcWeekNum(dayOfTheWeek, sameDayOfFirstWeek) {
        return Math.round((dayOfTheWeek - sameDayOfFirstWeek) / 6048e5) + 1;
    }
    function getIsoWeek(date) {
        const thuOfTheWeek = dayOfTheWeekOf(date, 4, 1);
        const firstThu = dayOfTheWeekOf(new Date(thuOfTheWeek).setMonth(0, 4), 4, 1);
        return calcWeekNum(thuOfTheWeek, firstThu);
    }
    function calcTraditionalWeekNumber(date, weekStart) {
        const startOfFirstWeek = dayOfTheWeekOf(new Date(date).setMonth(0, 1), weekStart, weekStart);
        const startOfTheWeek = dayOfTheWeekOf(date, weekStart, weekStart);
        const weekNum = calcWeekNum(startOfTheWeek, startOfFirstWeek);
        if (weekNum < 53) return weekNum;
        const weekOneOfNextYear = dayOfTheWeekOf(new Date(date).setDate(32), weekStart, weekStart);
        return startOfTheWeek === weekOneOfNextYear ? 1 : weekNum;
    }
    function getWesternTradWeek(date) {
        return calcTraditionalWeekNumber(date, 0);
    }
    function getMidEasternWeek(date) {
        return calcTraditionalWeekNumber(date, 6);
    }
    function startOfYearPeriod(date, years) {
        const year = new Date(date).getFullYear();
        return Math.floor(year / years) * years;
    }
    function regularizeDate(date, timeSpan, useLastDate) {
        if (timeSpan !== 1 && timeSpan !== 2) return date;
        const newDate = new Date(date);
        if (timeSpan === 1) useLastDate ? newDate.setMonth(newDate.getMonth() + 1, 0) : newDate.setDate(1); else useLastDate ? newDate.setFullYear(newDate.getFullYear() + 1, 0, 0) : newDate.setMonth(0, 1);
        return newDate.setHours(0, 0, 0, 0);
    }
    const reFormatTokens = /dd?|DD?|mm?|MM?|yy?(?:yy)?/;
    const reNonDateParts = /[\s!-/:-@[-`{-~年月日]+/;
    let knownFormats = {};
    const parseFns = {
        y(date, year) {
            return new Date(date).setFullYear(parseInt(year, 10));
        },
        m(date, month, locale) {
            const newDate = new Date(date);
            let monthIndex = parseInt(month, 10) - 1;
            if (isNaN(monthIndex)) {
                if (!month) return NaN;
                const monthName = month.toLowerCase();
                const compareNames = name => name.toLowerCase().startsWith(monthName);
                monthIndex = locale.monthsShort.findIndex(compareNames);
                if (monthIndex < 0) monthIndex = locale.months.findIndex(compareNames);
                if (monthIndex < 0) return NaN;
            }
            newDate.setMonth(monthIndex);
            return newDate.getMonth() !== normalizeMonth(monthIndex) ? newDate.setDate(0) : newDate.getTime();
        },
        d(date, day) {
            return new Date(date).setDate(parseInt(day, 10));
        }
    };
    const formatFns = {
        d(date) {
            return date.getDate();
        },
        dd(date) {
            return padZero(date.getDate(), 2);
        },
        D(date, locale) {
            return locale.daysShort[date.getDay()];
        },
        DD(date, locale) {
            return locale.days[date.getDay()];
        },
        m(date) {
            return date.getMonth() + 1;
        },
        mm(date) {
            return padZero(date.getMonth() + 1, 2);
        },
        M(date, locale) {
            return locale.monthsShort[date.getMonth()];
        },
        MM(date, locale) {
            return locale.months[date.getMonth()];
        },
        y(date) {
            return date.getFullYear();
        },
        yy(date) {
            return padZero(date.getFullYear(), 2).slice(-2);
        },
        yyyy(date) {
            return padZero(date.getFullYear(), 4);
        }
    };
    function normalizeMonth(monthIndex) {
        return monthIndex > -1 ? monthIndex % 12 : normalizeMonth(monthIndex + 12);
    }
    function padZero(num, length) {
        return num.toString().padStart(length, "0");
    }
    function parseFormatString(format) {
        if (typeof format !== "string") throw new Error("Invalid date format.");
        if (format in knownFormats) return knownFormats[format];
        const separators = format.split(reFormatTokens);
        const parts = format.match(new RegExp(reFormatTokens, "g"));
        if (separators.length === 0 || !parts) throw new Error("Invalid date format.");
        const partFormatters = parts.map((token => formatFns[token]));
        const partParserKeys = Object.keys(parseFns).reduce(((keys, key) => {
            const token = parts.find((part => part[0] !== "D" && part[0].toLowerCase() === key));
            if (token) keys.push(key);
            return keys;
        }), []);
        return knownFormats[format] = {
            parser(dateStr, locale) {
                const dateParts = dateStr.split(reNonDateParts).reduce(((dtParts, part, index) => {
                    if (part.length > 0 && parts[index]) {
                        const token = parts[index][0];
                        if (token === "M") dtParts.m = part; else if (token !== "D") dtParts[token] = part;
                    }
                    return dtParts;
                }), {});
                return partParserKeys.reduce(((origDate, key) => {
                    const newDate = parseFns[key](origDate, dateParts[key], locale);
                    return isNaN(newDate) ? origDate : newDate;
                }), today());
            },
            formatter(date, locale) {
                let dateStr = partFormatters.reduce(((str, fn, index) => str += `${separators[index]}${fn(date, locale)}`), "");
                return dateStr += lastItemOf(separators);
            }
        };
    }
    function parseDate(dateStr, format, locale) {
        if (dateStr instanceof Date || typeof dateStr === "number") {
            const date = stripTime(dateStr);
            return isNaN(date) ? void 0 : date;
        }
        if (!dateStr) return;
        if (dateStr === "today") return today();
        if (format && format.toValue) {
            const date = format.toValue(dateStr, format, locale);
            return isNaN(date) ? void 0 : stripTime(date);
        }
        return parseFormatString(format).parser(dateStr, locale);
    }
    function date_format_formatDate(date, format, locale) {
        if (isNaN(date) || !date && date !== 0) return "";
        const dateObj = typeof date === "number" ? new Date(date) : date;
        if (format.toDisplay) return format.toDisplay(dateObj, format, locale);
        return parseFormatString(format).formatter(dateObj, locale);
    }
    const range = document.createRange();
    function parseHTML(html) {
        return range.createContextualFragment(html);
    }
    function getParent(el) {
        return el.parentElement || (el.parentNode instanceof ShadowRoot ? el.parentNode.host : void 0);
    }
    function isActiveElement(el) {
        return el.getRootNode().activeElement === el;
    }
    function hideElement(el) {
        if (el.style.display === "none") return;
        if (el.style.display) el.dataset.styleDisplay = el.style.display;
        el.style.display = "none";
    }
    function showElement(el) {
        if (el.style.display !== "none") return;
        if (el.dataset.styleDisplay) {
            el.style.display = el.dataset.styleDisplay;
            delete el.dataset.styleDisplay;
        } else el.style.display = "";
    }
    function emptyChildNodes(el) {
        if (el.firstChild) {
            el.removeChild(el.firstChild);
            emptyChildNodes(el);
        }
    }
    function replaceChildNodes(el, newChildNodes) {
        emptyChildNodes(el);
        if (newChildNodes instanceof DocumentFragment) el.appendChild(newChildNodes); else if (typeof newChildNodes === "string") el.appendChild(parseHTML(newChildNodes)); else if (typeof newChildNodes.forEach === "function") newChildNodes.forEach((node => {
            el.appendChild(node);
        }));
    }
    const listenerRegistry = new WeakMap;
    const {addEventListener, removeEventListener} = EventTarget.prototype;
    function event_registerListeners(keyObj, listeners) {
        let registered = listenerRegistry.get(keyObj);
        if (!registered) {
            registered = [];
            listenerRegistry.set(keyObj, registered);
        }
        listeners.forEach((listener => {
            addEventListener.call(...listener);
            registered.push(listener);
        }));
    }
    function event_unregisterListeners(keyObj) {
        let listeners = listenerRegistry.get(keyObj);
        if (!listeners) return;
        listeners.forEach((listener => {
            removeEventListener.call(...listener);
        }));
        listenerRegistry.delete(keyObj);
    }
    if (!Event.prototype.composedPath) {
        const getComposedPath = (node, path = []) => {
            path.push(node);
            let parent;
            if (node.parentNode) parent = node.parentNode; else if (node.host) parent = node.host; else if (node.defaultView) parent = node.defaultView;
            return parent ? getComposedPath(parent, path) : path;
        };
        Event.prototype.composedPath = function() {
            return getComposedPath(this.target);
        };
    }
    function findFromPath(path, criteria, currentTarget) {
        const [node, ...rest] = path;
        if (criteria(node)) return node;
        if (node === currentTarget || node.tagName === "HTML" || rest.length === 0) return;
        return findFromPath(rest, criteria, currentTarget);
    }
    function findElementInEventPath(ev, selector) {
        const criteria = typeof selector === "function" ? selector : el => el instanceof Element && el.matches(selector);
        return findFromPath(ev.composedPath(), criteria, ev.currentTarget);
    }
    const base_locales = {
        en: {
            days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            daysShort: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
            daysMin: [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ],
            months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
            monthsShort: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
            today: "Today",
            clear: "Clear",
            titleFormat: "MM y"
        }
    };
    const defaultOptions = {
        autohide: false,
        beforeShowDay: null,
        beforeShowDecade: null,
        beforeShowMonth: null,
        beforeShowYear: null,
        clearButton: false,
        dateDelimiter: ",",
        datesDisabled: [],
        daysOfWeekDisabled: [],
        daysOfWeekHighlighted: [],
        defaultViewDate: void 0,
        disableTouchKeyboard: false,
        enableOnReadonly: true,
        format: "mm/dd/yyyy",
        language: "en",
        maxDate: null,
        maxNumberOfDates: 1,
        maxView: 3,
        minDate: null,
        nextArrow: "»",
        orientation: "auto",
        pickLevel: 0,
        prevArrow: "«",
        showDaysOfWeek: true,
        showOnClick: true,
        showOnFocus: true,
        startView: 0,
        title: "",
        todayButton: false,
        todayButtonMode: 0,
        todayHighlight: false,
        updateOnBlur: true,
        weekNumbers: 0,
        weekStart: 0
    };
    const {language: defaultLang, format: defaultFormat, weekStart: defaultWeekStart} = defaultOptions;
    function sanitizeDOW(dow, day) {
        return dow.length < 6 && day >= 0 && day < 7 ? pushUnique(dow, day) : dow;
    }
    function determineGetWeekMethod(numberingMode, weekStart) {
        const methodId = numberingMode === 4 ? weekStart === 6 ? 3 : !weekStart + 1 : numberingMode;
        switch (methodId) {
          case 1:
            return getIsoWeek;

          case 2:
            return getWesternTradWeek;

          case 3:
            return getMidEasternWeek;
        }
    }
    function updateWeekStart(newValue, config, weekNumbers) {
        config.weekStart = newValue;
        config.weekEnd = (newValue + 6) % 7;
        if (weekNumbers === 4) config.getWeekNumber = determineGetWeekMethod(4, newValue);
        return newValue;
    }
    function validateDate(value, format, locale, origValue) {
        const date = parseDate(value, format, locale);
        return date !== void 0 ? date : origValue;
    }
    function validateViewId(value, origValue, max = 3) {
        const viewId = parseInt(value, 10);
        return viewId >= 0 && viewId <= max ? viewId : origValue;
    }
    function replaceOptions(options, from, to, convert = void 0) {
        if (from in options) {
            if (!(to in options)) options[to] = convert ? convert(options[from]) : options[from];
            delete options[from];
        }
    }
    function processOptions(options, datepicker) {
        const inOpts = Object.assign({}, options);
        const config = {};
        const locales = datepicker.constructor.locales;
        const rangeEnd = !!datepicker.rangeSideIndex;
        let {datesDisabled, format, language, locale, maxDate, maxView, minDate, pickLevel, startView, weekNumbers, weekStart} = datepicker.config || {};
        replaceOptions(inOpts, "calendarWeeks", "weekNumbers", (val => val ? 1 : 0));
        replaceOptions(inOpts, "clearBtn", "clearButton");
        replaceOptions(inOpts, "todayBtn", "todayButton");
        replaceOptions(inOpts, "todayBtnMode", "todayButtonMode");
        if (inOpts.language) {
            let lang;
            if (inOpts.language !== language) if (locales[inOpts.language]) lang = inOpts.language; else {
                lang = inOpts.language.split("-")[0];
                if (!locales[lang]) lang = false;
            }
            delete inOpts.language;
            if (lang) {
                language = config.language = lang;
                const origLocale = locale || locales[defaultLang];
                locale = Object.assign({
                    format: defaultFormat,
                    weekStart: defaultWeekStart
                }, locales[defaultLang]);
                if (language !== defaultLang) Object.assign(locale, locales[language]);
                config.locale = locale;
                if (format === origLocale.format) format = config.format = locale.format;
                if (weekStart === origLocale.weekStart) weekStart = updateWeekStart(locale.weekStart, config, weekNumbers);
            }
        }
        if (inOpts.format) {
            const hasToDisplay = typeof inOpts.format.toDisplay === "function";
            const hasToValue = typeof inOpts.format.toValue === "function";
            const validFormatString = reFormatTokens.test(inOpts.format);
            if (hasToDisplay && hasToValue || validFormatString) format = config.format = inOpts.format;
            delete inOpts.format;
        }
        let newPickLevel = pickLevel;
        if ("pickLevel" in inOpts) {
            newPickLevel = validateViewId(inOpts.pickLevel, pickLevel, 2);
            delete inOpts.pickLevel;
        }
        if (newPickLevel !== pickLevel) {
            if (newPickLevel > pickLevel) {
                if (!("minDate" in inOpts)) inOpts.minDate = minDate;
                if (!("maxDate" in inOpts)) inOpts.maxDate = maxDate;
            }
            if (datesDisabled && !inOpts.datesDisabled) inOpts.datesDisabled = [];
            pickLevel = config.pickLevel = newPickLevel;
        }
        let minDt = minDate;
        let maxDt = maxDate;
        if ("minDate" in inOpts) {
            const defaultMinDt = dateValue(0, 0, 1);
            minDt = inOpts.minDate === null ? defaultMinDt : validateDate(inOpts.minDate, format, locale, minDt);
            if (minDt !== defaultMinDt) minDt = regularizeDate(minDt, pickLevel, false);
            delete inOpts.minDate;
        }
        if ("maxDate" in inOpts) {
            maxDt = inOpts.maxDate === null ? void 0 : validateDate(inOpts.maxDate, format, locale, maxDt);
            if (maxDt !== void 0) maxDt = regularizeDate(maxDt, pickLevel, true);
            delete inOpts.maxDate;
        }
        if (maxDt < minDt) {
            minDate = config.minDate = maxDt;
            maxDate = config.maxDate = minDt;
        } else {
            if (minDate !== minDt) minDate = config.minDate = minDt;
            if (maxDate !== maxDt) maxDate = config.maxDate = maxDt;
        }
        if (inOpts.datesDisabled) {
            const dtsDisabled = inOpts.datesDisabled;
            if (typeof dtsDisabled === "function") {
                config.datesDisabled = null;
                config.checkDisabled = (timeValue, viewId) => dtsDisabled(new Date(timeValue), viewId, rangeEnd);
            } else {
                const disabled = config.datesDisabled = dtsDisabled.reduce(((dates, dt) => {
                    const date = parseDate(dt, format, locale);
                    return date !== void 0 ? pushUnique(dates, regularizeDate(date, pickLevel, rangeEnd)) : dates;
                }), []);
                config.checkDisabled = timeValue => disabled.includes(timeValue);
            }
            delete inOpts.datesDisabled;
        }
        if ("defaultViewDate" in inOpts) {
            const viewDate = parseDate(inOpts.defaultViewDate, format, locale);
            if (viewDate !== void 0) config.defaultViewDate = viewDate;
            delete inOpts.defaultViewDate;
        }
        if ("weekStart" in inOpts) {
            const wkStart = Number(inOpts.weekStart) % 7;
            if (!isNaN(wkStart)) weekStart = updateWeekStart(wkStart, config, weekNumbers);
            delete inOpts.weekStart;
        }
        if (inOpts.daysOfWeekDisabled) {
            config.daysOfWeekDisabled = inOpts.daysOfWeekDisabled.reduce(sanitizeDOW, []);
            delete inOpts.daysOfWeekDisabled;
        }
        if (inOpts.daysOfWeekHighlighted) {
            config.daysOfWeekHighlighted = inOpts.daysOfWeekHighlighted.reduce(sanitizeDOW, []);
            delete inOpts.daysOfWeekHighlighted;
        }
        if ("weekNumbers" in inOpts) {
            let method = inOpts.weekNumbers;
            if (method) {
                const getWeekNumber = typeof method === "function" ? (timeValue, startOfWeek) => method(new Date(timeValue), startOfWeek) : determineGetWeekMethod(method = parseInt(method, 10), weekStart);
                if (getWeekNumber) {
                    weekNumbers = config.weekNumbers = method;
                    config.getWeekNumber = getWeekNumber;
                }
            } else {
                weekNumbers = config.weekNumbers = 0;
                config.getWeekNumber = null;
            }
            delete inOpts.weekNumbers;
        }
        if ("maxNumberOfDates" in inOpts) {
            const maxNumberOfDates = parseInt(inOpts.maxNumberOfDates, 10);
            if (maxNumberOfDates >= 0) {
                config.maxNumberOfDates = maxNumberOfDates;
                config.multidate = maxNumberOfDates !== 1;
            }
            delete inOpts.maxNumberOfDates;
        }
        if (inOpts.dateDelimiter) {
            config.dateDelimiter = String(inOpts.dateDelimiter);
            delete inOpts.dateDelimiter;
        }
        let newMaxView = maxView;
        if ("maxView" in inOpts) {
            newMaxView = validateViewId(inOpts.maxView, maxView);
            delete inOpts.maxView;
        }
        newMaxView = pickLevel > newMaxView ? pickLevel : newMaxView;
        if (newMaxView !== maxView) maxView = config.maxView = newMaxView;
        let newStartView = startView;
        if ("startView" in inOpts) {
            newStartView = validateViewId(inOpts.startView, newStartView);
            delete inOpts.startView;
        }
        if (newStartView < pickLevel) newStartView = pickLevel; else if (newStartView > maxView) newStartView = maxView;
        if (newStartView !== startView) config.startView = newStartView;
        if (inOpts.prevArrow) {
            const prevArrow = parseHTML(inOpts.prevArrow);
            if (prevArrow.childNodes.length > 0) config.prevArrow = prevArrow.childNodes;
            delete inOpts.prevArrow;
        }
        if (inOpts.nextArrow) {
            const nextArrow = parseHTML(inOpts.nextArrow);
            if (nextArrow.childNodes.length > 0) config.nextArrow = nextArrow.childNodes;
            delete inOpts.nextArrow;
        }
        if ("disableTouchKeyboard" in inOpts) {
            config.disableTouchKeyboard = "ontouchstart" in document && !!inOpts.disableTouchKeyboard;
            delete inOpts.disableTouchKeyboard;
        }
        if (inOpts.orientation) {
            const orientation = inOpts.orientation.toLowerCase().split(/\s+/g);
            config.orientation = {
                x: orientation.find((x => x === "left" || x === "right")) || "auto",
                y: orientation.find((y => y === "top" || y === "bottom")) || "auto"
            };
            delete inOpts.orientation;
        }
        if ("todayButtonMode" in inOpts) {
            switch (inOpts.todayButtonMode) {
              case 0:
              case 1:
                config.todayButtonMode = inOpts.todayButtonMode;
            }
            delete inOpts.todayButtonMode;
        }
        Object.entries(inOpts).forEach((([key, value]) => {
            if (value !== void 0 && key in defaultOptions) config[key] = value;
        }));
        return config;
    }
    const defaultShortcutKeys = {
        show: {
            key: "ArrowDown"
        },
        hide: null,
        toggle: {
            key: "Escape"
        },
        prevButton: {
            key: "ArrowLeft",
            ctrlOrMetaKey: true
        },
        nextButton: {
            key: "ArrowRight",
            ctrlOrMetaKey: true
        },
        viewSwitch: {
            key: "ArrowUp",
            ctrlOrMetaKey: true
        },
        clearButton: {
            key: "Backspace",
            ctrlOrMetaKey: true
        },
        todayButton: {
            key: ".",
            ctrlOrMetaKey: true
        },
        exitEditMode: {
            key: "ArrowDown",
            ctrlOrMetaKey: true
        }
    };
    function createShortcutKeyConfig(options) {
        return Object.keys(defaultShortcutKeys).reduce(((keyDefs, shortcut) => {
            const keyDef = options[shortcut] === void 0 ? defaultShortcutKeys[shortcut] : options[shortcut];
            const key = keyDef && keyDef.key;
            if (!key || typeof key !== "string") return keyDefs;
            const normalizedDef = {
                key,
                ctrlOrMetaKey: !!(keyDef.ctrlOrMetaKey || keyDef.ctrlKey || keyDef.metaKey)
            };
            if (key.length > 1) {
                normalizedDef.altKey = !!keyDef.altKey;
                normalizedDef.shiftKey = !!keyDef.shiftKey;
            }
            keyDefs[shortcut] = normalizedDef;
            return keyDefs;
        }), {});
    }
    const getButtons = buttonList => buttonList.map((classes => `<button type="button" class="%buttonClass% ${classes}" tabindex="-1"></button>`)).join("");
    const pickerTemplate = optimizeTemplateHTML(`<div class="datepicker">\n  <div class="datepicker-picker">\n    <div class="datepicker-header">\n      <div class="datepicker-title"></div>\n      <div class="datepicker-controls">\n        ${getButtons([ "prev-button prev-btn", "view-switch", "next-button next-btn" ])}\n      </div>\n    </div>\n    <div class="datepicker-main"></div>\n    <div class="datepicker-footer">\n      <div class="datepicker-controls">\n        ${getButtons([ "today-button today-btn", "clear-button clear-btn" ])}\n      </div>\n    </div>\n  </div>\n</div>`);
    const daysTemplate = optimizeTemplateHTML(`<div class="days">\n  <div class="days-of-week">${createTagRepeat("span", 7, {
        class: "dow"
    })}</div>\n  <div class="datepicker-grid">${createTagRepeat("span", 42)}</div>\n</div>`);
    const weekNumbersTemplate = optimizeTemplateHTML(`<div class="week-numbers calendar-weeks">\n  <div class="days-of-week"><span class="dow"></span></div>\n  <div class="weeks">${createTagRepeat("span", 6, {
        class: "week"
    })}</div>\n</div>`);
    class View {
        constructor(picker, config) {
            Object.assign(this, config, {
                picker,
                element: parseHTML(`<div class="datepicker-view"></div>`).firstChild,
                selected: [],
                isRangeEnd: !!picker.datepicker.rangeSideIndex
            });
            this.init(this.picker.datepicker.config);
        }
        init(options) {
            if ("pickLevel" in options) this.isMinView = this.id === options.pickLevel;
            this.setOptions(options);
            this.updateFocus();
            this.updateSelection();
        }
        prepareForRender(switchLabel, prevButtonDisabled, nextButtonDisabled) {
            this.disabled = [];
            const picker = this.picker;
            picker.setViewSwitchLabel(switchLabel);
            picker.setPrevButtonDisabled(prevButtonDisabled);
            picker.setNextButtonDisabled(nextButtonDisabled);
        }
        setDisabled(date, classList) {
            classList.add("disabled");
            pushUnique(this.disabled, date);
        }
        performBeforeHook(el, timeValue) {
            let result = this.beforeShow(new Date(timeValue));
            switch (typeof result) {
              case "boolean":
                result = {
                    enabled: result
                };
                break;

              case "string":
                result = {
                    classes: result
                };
            }
            if (result) {
                const classList = el.classList;
                if (result.enabled === false) this.setDisabled(timeValue, classList);
                if (result.classes) {
                    const extraClasses = result.classes.split(/\s+/);
                    classList.add(...extraClasses);
                    if (extraClasses.includes("disabled")) this.setDisabled(timeValue, classList);
                }
                if (result.content) replaceChildNodes(el, result.content);
            }
        }
        renderCell(el, content, cellVal, date, {selected, range}, outOfScope, extraClasses = []) {
            el.textContent = content;
            if (this.isMinView) el.dataset.date = date;
            const classList = el.classList;
            el.className = `datepicker-cell ${this.cellClass}`;
            if (cellVal < this.first) classList.add("prev"); else if (cellVal > this.last) classList.add("next");
            classList.add(...extraClasses);
            if (outOfScope || this.checkDisabled(date, this.id)) this.setDisabled(date, classList);
            if (range) {
                const [rangeStart, rangeEnd] = range;
                if (cellVal > rangeStart && cellVal < rangeEnd) classList.add("range");
                if (cellVal === rangeStart) classList.add("range-start");
                if (cellVal === rangeEnd) classList.add("range-end");
            }
            if (selected.includes(cellVal)) classList.add("selected");
            if (cellVal === this.focused) classList.add("focused");
            if (this.beforeShow) this.performBeforeHook(el, date);
        }
        refreshCell(el, cellVal, selected, [rangeStart, rangeEnd]) {
            const classList = el.classList;
            classList.remove("range", "range-start", "range-end", "selected", "focused");
            if (cellVal > rangeStart && cellVal < rangeEnd) classList.add("range");
            if (cellVal === rangeStart) classList.add("range-start");
            if (cellVal === rangeEnd) classList.add("range-end");
            if (selected.includes(cellVal)) classList.add("selected");
            if (cellVal === this.focused) classList.add("focused");
        }
        changeFocusedCell(cellIndex) {
            this.grid.querySelectorAll(".focused").forEach((el => {
                el.classList.remove("focused");
            }));
            this.grid.children[cellIndex].classList.add("focused");
        }
    }
    class DaysView extends View {
        constructor(picker) {
            super(picker, {
                id: 0,
                name: "days",
                cellClass: "day"
            });
        }
        init(options, onConstruction = true) {
            if (onConstruction) {
                const inner = parseHTML(daysTemplate).firstChild;
                this.dow = inner.firstChild;
                this.grid = inner.lastChild;
                this.element.appendChild(inner);
            }
            super.init(options);
        }
        setOptions(options) {
            let updateDOW;
            if ("minDate" in options) this.minDate = options.minDate;
            if ("maxDate" in options) this.maxDate = options.maxDate;
            if (options.checkDisabled) this.checkDisabled = options.checkDisabled;
            if (options.daysOfWeekDisabled) {
                this.daysOfWeekDisabled = options.daysOfWeekDisabled;
                updateDOW = true;
            }
            if (options.daysOfWeekHighlighted) this.daysOfWeekHighlighted = options.daysOfWeekHighlighted;
            if ("todayHighlight" in options) this.todayHighlight = options.todayHighlight;
            if ("weekStart" in options) {
                this.weekStart = options.weekStart;
                this.weekEnd = options.weekEnd;
                updateDOW = true;
            }
            if (options.locale) {
                const locale = this.locale = options.locale;
                this.dayNames = locale.daysMin;
                this.switchLabelFormat = locale.titleFormat;
                updateDOW = true;
            }
            if ("beforeShowDay" in options) this.beforeShow = typeof options.beforeShowDay === "function" ? options.beforeShowDay : void 0;
            if ("weekNumbers" in options) if (options.weekNumbers && !this.weekNumbers) {
                const weeksElem = parseHTML(weekNumbersTemplate).firstChild;
                this.weekNumbers = {
                    element: weeksElem,
                    dow: weeksElem.firstChild,
                    weeks: weeksElem.lastChild
                };
                this.element.insertBefore(weeksElem, this.element.firstChild);
            } else if (this.weekNumbers && !options.weekNumbers) {
                this.element.removeChild(this.weekNumbers.element);
                this.weekNumbers = null;
            }
            if ("getWeekNumber" in options) this.getWeekNumber = options.getWeekNumber;
            if ("showDaysOfWeek" in options) if (options.showDaysOfWeek) {
                showElement(this.dow);
                if (this.weekNumbers) showElement(this.weekNumbers.dow);
            } else {
                hideElement(this.dow);
                if (this.weekNumbers) hideElement(this.weekNumbers.dow);
            }
            if (updateDOW) Array.from(this.dow.children).forEach(((el, index) => {
                const dow = (this.weekStart + index) % 7;
                el.textContent = this.dayNames[dow];
                el.className = this.daysOfWeekDisabled.includes(dow) ? "dow disabled" : "dow";
            }));
        }
        updateFocus() {
            const viewDate = new Date(this.picker.viewDate);
            const viewYear = viewDate.getFullYear();
            const viewMonth = viewDate.getMonth();
            const firstOfMonth = dateValue(viewYear, viewMonth, 1);
            const start = dayOfTheWeekOf(firstOfMonth, this.weekStart, this.weekStart);
            this.first = firstOfMonth;
            this.last = dateValue(viewYear, viewMonth + 1, 0);
            this.start = start;
            this.focused = this.picker.viewDate;
        }
        updateSelection() {
            const {dates, rangepicker} = this.picker.datepicker;
            this.selected = dates;
            if (rangepicker) this.range = rangepicker.dates;
        }
        render() {
            this.today = this.todayHighlight ? today() : void 0;
            this.prepareForRender(date_format_formatDate(this.focused, this.switchLabelFormat, this.locale), this.first <= this.minDate, this.last >= this.maxDate);
            if (this.weekNumbers) {
                const weekStart = this.weekStart;
                const startOfWeek = dayOfTheWeekOf(this.first, weekStart, weekStart);
                Array.from(this.weekNumbers.weeks.children).forEach(((el, index) => {
                    const dateOfWeekStart = addWeeks(startOfWeek, index);
                    el.textContent = this.getWeekNumber(dateOfWeekStart, weekStart);
                    if (index > 3) el.classList[dateOfWeekStart > this.last ? "add" : "remove"]("next");
                }));
            }
            Array.from(this.grid.children).forEach(((el, index) => {
                const current = addDays(this.start, index);
                const dateObj = new Date(current);
                const day = dateObj.getDay();
                const extraClasses = [];
                if (this.today === current) extraClasses.push("today");
                if (this.daysOfWeekHighlighted.includes(day)) extraClasses.push("highlighted");
                this.renderCell(el, dateObj.getDate(), current, current, this, current < this.minDate || current > this.maxDate || this.daysOfWeekDisabled.includes(day), extraClasses);
            }));
        }
        refresh() {
            const range = this.range || [];
            Array.from(this.grid.children).forEach((el => {
                this.refreshCell(el, Number(el.dataset.date), this.selected, range);
            }));
        }
        refreshFocus() {
            this.changeFocusedCell(Math.round((this.focused - this.start) / 864e5));
        }
    }
    function computeMonthRange(range, thisYear) {
        if (!range || !range[0] || !range[1]) return;
        const [[startY, startM], [endY, endM]] = range;
        if (startY > thisYear || endY < thisYear) return;
        return [ startY === thisYear ? startM : -1, endY === thisYear ? endM : 12 ];
    }
    class MonthsView extends View {
        constructor(picker) {
            super(picker, {
                id: 1,
                name: "months",
                cellClass: "month"
            });
        }
        init(options, onConstruction = true) {
            if (onConstruction) {
                this.grid = this.element;
                this.element.classList.add("months", "datepicker-grid");
                this.grid.appendChild(parseHTML(createTagRepeat("span", 12, {
                    "data-month": ix => ix
                })));
                this.first = 0;
                this.last = 11;
            }
            super.init(options);
        }
        setOptions(options) {
            if (options.locale) this.monthNames = options.locale.monthsShort;
            if ("minDate" in options) if (options.minDate === void 0) this.minYear = this.minMonth = this.minDate = void 0; else {
                const minDateObj = new Date(options.minDate);
                this.minYear = minDateObj.getFullYear();
                this.minMonth = minDateObj.getMonth();
                this.minDate = minDateObj.setDate(1);
            }
            if ("maxDate" in options) if (options.maxDate === void 0) this.maxYear = this.maxMonth = this.maxDate = void 0; else {
                const maxDateObj = new Date(options.maxDate);
                this.maxYear = maxDateObj.getFullYear();
                this.maxMonth = maxDateObj.getMonth();
                this.maxDate = dateValue(this.maxYear, this.maxMonth + 1, 0);
            }
            if (options.checkDisabled) this.checkDisabled = this.isMinView || options.datesDisabled === null ? options.checkDisabled : () => false;
            if ("beforeShowMonth" in options) this.beforeShow = typeof options.beforeShowMonth === "function" ? options.beforeShowMonth : void 0;
        }
        updateFocus() {
            const viewDate = new Date(this.picker.viewDate);
            this.year = viewDate.getFullYear();
            this.focused = viewDate.getMonth();
        }
        updateSelection() {
            const {dates, rangepicker} = this.picker.datepicker;
            this.selected = dates.reduce(((selected, timeValue) => {
                const date = new Date(timeValue);
                const year = date.getFullYear();
                const month = date.getMonth();
                if (selected[year] === void 0) selected[year] = [ month ]; else pushUnique(selected[year], month);
                return selected;
            }), {});
            if (rangepicker && rangepicker.dates) this.range = rangepicker.dates.map((timeValue => {
                const date = new Date(timeValue);
                return isNaN(date) ? void 0 : [ date.getFullYear(), date.getMonth() ];
            }));
        }
        render() {
            this.prepareForRender(this.year, this.year <= this.minYear, this.year >= this.maxYear);
            const selected = this.selected[this.year] || [];
            const yrOutOfRange = this.year < this.minYear || this.year > this.maxYear;
            const isMinYear = this.year === this.minYear;
            const isMaxYear = this.year === this.maxYear;
            const range = computeMonthRange(this.range, this.year);
            Array.from(this.grid.children).forEach(((el, index) => {
                const date = regularizeDate(new Date(this.year, index, 1), 1, this.isRangeEnd);
                this.renderCell(el, this.monthNames[index], index, date, {
                    selected,
                    range
                }, yrOutOfRange || isMinYear && index < this.minMonth || isMaxYear && index > this.maxMonth);
            }));
        }
        refresh() {
            const selected = this.selected[this.year] || [];
            const range = computeMonthRange(this.range, this.year) || [];
            Array.from(this.grid.children).forEach(((el, index) => {
                this.refreshCell(el, index, selected, range);
            }));
        }
        refreshFocus() {
            this.changeFocusedCell(this.focused);
        }
    }
    function toTitleCase(word) {
        return [ ...word ].reduce(((str, ch, ix) => str += ix ? ch : ch.toUpperCase()), "");
    }
    class YearsView extends View {
        constructor(picker, config) {
            super(picker, config);
        }
        init(options, onConstruction = true) {
            if (onConstruction) {
                this.navStep = this.step * 10;
                this.beforeShowOption = `beforeShow${toTitleCase(this.cellClass)}`;
                this.grid = this.element;
                this.element.classList.add(this.name, "datepicker-grid");
                this.grid.appendChild(parseHTML(createTagRepeat("span", 12)));
            }
            super.init(options);
        }
        setOptions(options) {
            if ("minDate" in options) if (options.minDate === void 0) this.minYear = this.minDate = void 0; else {
                this.minYear = startOfYearPeriod(options.minDate, this.step);
                this.minDate = dateValue(this.minYear, 0, 1);
            }
            if ("maxDate" in options) if (options.maxDate === void 0) this.maxYear = this.maxDate = void 0; else {
                this.maxYear = startOfYearPeriod(options.maxDate, this.step);
                this.maxDate = dateValue(this.maxYear, 11, 31);
            }
            if (options.checkDisabled) this.checkDisabled = this.isMinView || options.datesDisabled === null ? options.checkDisabled : () => false;
            if (this.beforeShowOption in options) {
                const beforeShow = options[this.beforeShowOption];
                this.beforeShow = typeof beforeShow === "function" ? beforeShow : void 0;
            }
        }
        updateFocus() {
            const viewDate = new Date(this.picker.viewDate);
            const first = startOfYearPeriod(viewDate, this.navStep);
            const last = first + 9 * this.step;
            this.first = first;
            this.last = last;
            this.start = first - this.step;
            this.focused = startOfYearPeriod(viewDate, this.step);
        }
        updateSelection() {
            const {dates, rangepicker} = this.picker.datepicker;
            this.selected = dates.reduce(((years, timeValue) => pushUnique(years, startOfYearPeriod(timeValue, this.step))), []);
            if (rangepicker && rangepicker.dates) this.range = rangepicker.dates.map((timeValue => {
                if (timeValue !== void 0) return startOfYearPeriod(timeValue, this.step);
            }));
        }
        render() {
            this.prepareForRender(`${this.first}-${this.last}`, this.first <= this.minYear, this.last >= this.maxYear);
            Array.from(this.grid.children).forEach(((el, index) => {
                const current = this.start + index * this.step;
                const date = regularizeDate(new Date(current, 0, 1), 2, this.isRangeEnd);
                el.dataset.year = current;
                this.renderCell(el, current, current, date, this, current < this.minYear || current > this.maxYear);
            }));
        }
        refresh() {
            const range = this.range || [];
            Array.from(this.grid.children).forEach((el => {
                this.refreshCell(el, Number(el.textContent), this.selected, range);
            }));
        }
        refreshFocus() {
            this.changeFocusedCell(Math.round((this.focused - this.start) / this.step));
        }
    }
    function triggerDatepickerEvent(datepicker, type) {
        const options = {
            bubbles: true,
            cancelable: true,
            detail: {
                date: datepicker.getDate(),
                viewDate: new Date(datepicker.picker.viewDate),
                viewId: datepicker.picker.currentView.id,
                datepicker
            }
        };
        datepicker.element.dispatchEvent(new CustomEvent(type, options));
    }
    function goToPrevOrNext(datepicker, direction) {
        const {config, picker} = datepicker;
        const {currentView, viewDate} = picker;
        let newViewDate;
        switch (currentView.id) {
          case 0:
            newViewDate = addMonths(viewDate, direction);
            break;

          case 1:
            newViewDate = addYears(viewDate, direction);
            break;

          default:
            newViewDate = addYears(viewDate, direction * currentView.navStep);
        }
        newViewDate = limitToRange(newViewDate, config.minDate, config.maxDate);
        picker.changeFocus(newViewDate).render();
    }
    function switchView(datepicker) {
        const viewId = datepicker.picker.currentView.id;
        if (viewId === datepicker.config.maxView) return;
        datepicker.picker.changeView(viewId + 1).render();
    }
    function clearSelection(datepicker) {
        datepicker.setDate({
            clear: true
        });
    }
    function goToOrSelectToday(datepicker) {
        const currentDate = today();
        if (datepicker.config.todayButtonMode === 1) datepicker.setDate(currentDate, {
            forceRefresh: true,
            viewDate: currentDate
        }); else datepicker.setFocusedDate(currentDate, true);
    }
    function unfocus(datepicker) {
        const onBlur = () => {
            if (datepicker.config.updateOnBlur) datepicker.update({
                revert: true
            }); else datepicker.refresh("input");
            datepicker.hide();
        };
        const element = datepicker.element;
        if (isActiveElement(element)) element.addEventListener("blur", onBlur, {
            once: true
        }); else onBlur();
    }
    function goToSelectedMonthOrYear(datepicker, selection) {
        const picker = datepicker.picker;
        const viewDate = new Date(picker.viewDate);
        const viewId = picker.currentView.id;
        const newDate = viewId === 1 ? addMonths(viewDate, selection - viewDate.getMonth()) : addYears(viewDate, selection - viewDate.getFullYear());
        picker.changeFocus(newDate).changeView(viewId - 1).render();
    }
    function onClickViewSwitch(datepicker) {
        switchView(datepicker);
    }
    function onClickPrevButton(datepicker) {
        goToPrevOrNext(datepicker, -1);
    }
    function onClickNextButton(datepicker) {
        goToPrevOrNext(datepicker, 1);
    }
    function onClickView(datepicker, ev) {
        const target = findElementInEventPath(ev, ".datepicker-cell");
        if (!target || target.classList.contains("disabled")) return;
        const {id, isMinView} = datepicker.picker.currentView;
        const data = target.dataset;
        if (isMinView) datepicker.setDate(Number(data.date)); else if (id === 1) goToSelectedMonthOrYear(datepicker, Number(data.month)); else goToSelectedMonthOrYear(datepicker, Number(data.year));
    }
    function onMousedownPicker(ev) {
        ev.preventDefault();
    }
    const orientClasses = [ "left", "top", "right", "bottom" ].reduce(((obj, key) => {
        obj[key] = `datepicker-orient-${key}`;
        return obj;
    }), {});
    const toPx = num => num ? `${num}px` : num;
    function processPickerOptions(picker, options) {
        if ("title" in options) if (options.title) {
            picker.controls.title.textContent = options.title;
            showElement(picker.controls.title);
        } else {
            picker.controls.title.textContent = "";
            hideElement(picker.controls.title);
        }
        if (options.prevArrow) {
            const prevButton = picker.controls.prevButton;
            emptyChildNodes(prevButton);
            options.prevArrow.forEach((node => {
                prevButton.appendChild(node.cloneNode(true));
            }));
        }
        if (options.nextArrow) {
            const nextButton = picker.controls.nextButton;
            emptyChildNodes(nextButton);
            options.nextArrow.forEach((node => {
                nextButton.appendChild(node.cloneNode(true));
            }));
        }
        if (options.locale) {
            picker.controls.todayButton.textContent = options.locale.today;
            picker.controls.clearButton.textContent = options.locale.clear;
        }
        if ("todayButton" in options) if (options.todayButton) showElement(picker.controls.todayButton); else hideElement(picker.controls.todayButton);
        if ("minDate" in options || "maxDate" in options) {
            const {minDate, maxDate} = picker.datepicker.config;
            picker.controls.todayButton.disabled = !isInRange(today(), minDate, maxDate);
        }
        if ("clearButton" in options) if (options.clearButton) showElement(picker.controls.clearButton); else hideElement(picker.controls.clearButton);
    }
    function computeResetViewDate(datepicker) {
        const {dates, config, rangeSideIndex} = datepicker;
        const viewDate = dates.length > 0 ? lastItemOf(dates) : regularizeDate(config.defaultViewDate, config.pickLevel, rangeSideIndex);
        return limitToRange(viewDate, config.minDate, config.maxDate);
    }
    function setViewDate(picker, newDate) {
        if (!("_oldViewDate" in picker) && newDate !== picker.viewDate) picker._oldViewDate = picker.viewDate;
        picker.viewDate = newDate;
        const {id, year, first, last} = picker.currentView;
        const viewYear = new Date(newDate).getFullYear();
        switch (id) {
          case 0:
            return newDate < first || newDate > last;

          case 1:
            return viewYear !== year;

          default:
            return viewYear < first || viewYear > last;
        }
    }
    function getTextDirection(el) {
        return window.getComputedStyle(el).direction;
    }
    function findScrollParents(el) {
        const parent = getParent(el);
        if (parent === document.body || !parent) return;
        return window.getComputedStyle(parent).overflow !== "visible" ? parent : findScrollParents(parent);
    }
    class Picker {
        constructor(datepicker) {
            const {config, inputField} = this.datepicker = datepicker;
            const template = pickerTemplate.replace(/%buttonClass%/g, config.buttonClass);
            const element = this.element = parseHTML(template).firstChild;
            const [header, main, footer] = element.firstChild.children;
            const title = header.firstElementChild;
            const [prevButton, viewSwitch, nextButton] = header.lastElementChild.children;
            const [todayButton, clearButton] = footer.firstChild.children;
            const controls = {
                title,
                prevButton,
                viewSwitch,
                nextButton,
                todayButton,
                clearButton
            };
            this.main = main;
            this.controls = controls;
            const elementClass = inputField ? "dropdown" : "inline";
            element.classList.add(`datepicker-${elementClass}`);
            processPickerOptions(this, config);
            this.viewDate = computeResetViewDate(datepicker);
            event_registerListeners(datepicker, [ [ element, "mousedown", onMousedownPicker ], [ main, "click", onClickView.bind(null, datepicker) ], [ controls.viewSwitch, "click", onClickViewSwitch.bind(null, datepicker) ], [ controls.prevButton, "click", onClickPrevButton.bind(null, datepicker) ], [ controls.nextButton, "click", onClickNextButton.bind(null, datepicker) ], [ controls.todayButton, "click", goToOrSelectToday.bind(null, datepicker) ], [ controls.clearButton, "click", clearSelection.bind(null, datepicker) ] ]);
            this.views = [ new DaysView(this), new MonthsView(this), new YearsView(this, {
                id: 2,
                name: "years",
                cellClass: "year",
                step: 1
            }), new YearsView(this, {
                id: 3,
                name: "decades",
                cellClass: "decade",
                step: 10
            }) ];
            this.currentView = this.views[config.startView];
            this.currentView.render();
            this.main.appendChild(this.currentView.element);
            if (config.container) config.container.appendChild(this.element); else inputField.after(this.element);
        }
        setOptions(options) {
            processPickerOptions(this, options);
            this.views.forEach((view => {
                view.init(options, false);
            }));
            this.currentView.render();
        }
        detach() {
            this.element.remove();
        }
        show() {
            if (this.active) return;
            const {datepicker, element} = this;
            const inputField = datepicker.inputField;
            if (inputField) {
                const inputDirection = getTextDirection(inputField);
                if (inputDirection !== getTextDirection(getParent(element))) element.dir = inputDirection; else if (element.dir) element.removeAttribute("dir");
                this.place();
                element.classList.add("active");
                if (datepicker.config.disableTouchKeyboard) inputField.blur();
            } else element.classList.add("active");
            this.active = true;
            triggerDatepickerEvent(datepicker, "show");
        }
        hide() {
            if (!this.active) return;
            this.datepicker.exitEditMode();
            this.element.classList.remove("active");
            this.active = false;
            triggerDatepickerEvent(this.datepicker, "hide");
        }
        place() {
            const {classList, style} = this.element;
            style.display = "block";
            const {width: calendarWidth, height: calendarHeight} = this.element.getBoundingClientRect();
            const offsetParent = this.element.offsetParent;
            style.display = "";
            const {config, inputField} = this.datepicker;
            const {left: inputLeft, top: inputTop, right: inputRight, bottom: inputBottom, width: inputWidth, height: inputHeight} = inputField.getBoundingClientRect();
            let {x: orientX, y: orientY} = config.orientation;
            let left = inputLeft;
            let top = inputTop;
            if (offsetParent === document.body || !offsetParent) {
                left += window.scrollX;
                top += window.scrollY;
            } else {
                const offsetParentRect = offsetParent.getBoundingClientRect();
                left -= offsetParentRect.left - offsetParent.scrollLeft;
                top -= offsetParentRect.top - offsetParent.scrollTop;
            }
            const scrollParent = findScrollParents(inputField);
            let scrollAreaLeft = 0;
            let scrollAreaTop = 0;
            let {clientWidth: scrollAreaRight, clientHeight: scrollAreaBottom} = document.documentElement;
            if (scrollParent) {
                const scrollParentRect = scrollParent.getBoundingClientRect();
                if (scrollParentRect.top > 0) scrollAreaTop = scrollParentRect.top;
                if (scrollParentRect.left > 0) scrollAreaLeft = scrollParentRect.left;
                if (scrollParentRect.right < scrollAreaRight) scrollAreaRight = scrollParentRect.right;
                if (scrollParentRect.bottom < scrollAreaBottom) scrollAreaBottom = scrollParentRect.bottom;
            }
            let adjustment = 0;
            if (orientX === "auto") if (inputLeft < scrollAreaLeft) {
                orientX = "left";
                adjustment = scrollAreaLeft - inputLeft;
            } else if (inputLeft + calendarWidth > scrollAreaRight) {
                orientX = "right";
                if (scrollAreaRight < inputRight) adjustment = scrollAreaRight - inputRight;
            } else if (getTextDirection(inputField) === "rtl") orientX = inputRight - calendarWidth < scrollAreaLeft ? "left" : "right"; else orientX = "left";
            if (orientX === "right") left += inputWidth - calendarWidth;
            left += adjustment;
            if (orientY === "auto") if (inputTop - calendarHeight > scrollAreaTop) orientY = inputBottom + calendarHeight > scrollAreaBottom ? "top" : "bottom"; else orientY = "bottom";
            if (orientY === "top") top -= calendarHeight; else top += inputHeight;
            classList.remove(...Object.values(orientClasses));
            classList.add(orientClasses[orientX], orientClasses[orientY]);
            style.left = toPx(left);
            style.top = toPx(top);
        }
        setViewSwitchLabel(labelText) {
            this.controls.viewSwitch.textContent = labelText;
        }
        setPrevButtonDisabled(disabled) {
            this.controls.prevButton.disabled = disabled;
        }
        setNextButtonDisabled(disabled) {
            this.controls.nextButton.disabled = disabled;
        }
        changeView(viewId) {
            const currentView = this.currentView;
            if (viewId !== currentView.id) {
                if (!this._oldView) this._oldView = currentView;
                this.currentView = this.views[viewId];
                this._renderMethod = "render";
            }
            return this;
        }
        changeFocus(newViewDate) {
            this._renderMethod = setViewDate(this, newViewDate) ? "render" : "refreshFocus";
            this.views.forEach((view => {
                view.updateFocus();
            }));
            return this;
        }
        update(viewDate = void 0) {
            const newViewDate = viewDate === void 0 ? computeResetViewDate(this.datepicker) : viewDate;
            this._renderMethod = setViewDate(this, newViewDate) ? "render" : "refresh";
            this.views.forEach((view => {
                view.updateFocus();
                view.updateSelection();
            }));
            return this;
        }
        render(quickRender = true) {
            const {currentView, datepicker, _oldView: oldView} = this;
            const oldViewDate = new Date(this._oldViewDate);
            const renderMethod = quickRender && this._renderMethod || "render";
            delete this._oldView;
            delete this._oldViewDate;
            delete this._renderMethod;
            currentView[renderMethod]();
            if (oldView) {
                this.main.replaceChild(currentView.element, oldView.element);
                triggerDatepickerEvent(datepicker, "changeView");
            }
            if (!isNaN(oldViewDate)) {
                const newViewDate = new Date(this.viewDate);
                if (newViewDate.getFullYear() !== oldViewDate.getFullYear()) triggerDatepickerEvent(datepicker, "changeYear");
                if (newViewDate.getMonth() !== oldViewDate.getMonth()) triggerDatepickerEvent(datepicker, "changeMonth");
            }
        }
    }
    function findNextAvailableOne(date, addFn, increase, testFn, min, max) {
        if (!isInRange(date, min, max)) return;
        if (testFn(date)) {
            const newDate = addFn(date, increase);
            return findNextAvailableOne(newDate, addFn, increase, testFn, min, max);
        }
        return date;
    }
    function moveByArrowKey(datepicker, direction, vertical) {
        const picker = datepicker.picker;
        const currentView = picker.currentView;
        const step = currentView.step || 1;
        let viewDate = picker.viewDate;
        let addFn;
        switch (currentView.id) {
          case 0:
            viewDate = addDays(viewDate, vertical ? direction * 7 : direction);
            addFn = addDays;
            break;

          case 1:
            viewDate = addMonths(viewDate, vertical ? direction * 4 : direction);
            addFn = addMonths;
            break;

          default:
            viewDate = addYears(viewDate, direction * (vertical ? 4 : 1) * step);
            addFn = addYears;
        }
        viewDate = findNextAvailableOne(viewDate, addFn, direction < 0 ? -step : step, (date => currentView.disabled.includes(date)), currentView.minDate, currentView.maxDate);
        if (viewDate !== void 0) picker.changeFocus(viewDate).render();
    }
    function onKeydown(datepicker, ev) {
        const {config, picker, editMode} = datepicker;
        const active = picker.active;
        const {key, altKey, shiftKey} = ev;
        const ctrlOrMetaKey = ev.ctrlKey || ev.metaKey;
        const cancelEvent = () => {
            ev.preventDefault();
            ev.stopPropagation();
        };
        if (key === "Tab") {
            unfocus(datepicker);
            return;
        }
        if (key === "Enter") {
            if (!active) datepicker.update(); else if (editMode) datepicker.exitEditMode({
                update: true,
                autohide: config.autohide
            }); else {
                const currentView = picker.currentView;
                if (currentView.isMinView) datepicker.setDate(picker.viewDate); else {
                    picker.changeView(currentView.id - 1).render();
                    cancelEvent();
                }
            }
            return;
        }
        const shortcutKeys = config.shortcutKeys;
        const keyInfo = {
            key,
            ctrlOrMetaKey,
            altKey,
            shiftKey
        };
        const shortcut = Object.keys(shortcutKeys).find((item => {
            const keyDef = shortcutKeys[item];
            return !Object.keys(keyDef).find((prop => keyDef[prop] !== keyInfo[prop]));
        }));
        if (shortcut) {
            let action;
            if (shortcut === "toggle") action = shortcut; else if (editMode) {
                if (shortcut === "exitEditMode") action = shortcut;
            } else if (active) {
                if (shortcut === "hide") action = shortcut; else if (shortcut === "prevButton") action = [ goToPrevOrNext, [ datepicker, -1 ] ]; else if (shortcut === "nextButton") action = [ goToPrevOrNext, [ datepicker, 1 ] ]; else if (shortcut === "viewSwitch") action = [ switchView, [ datepicker ] ]; else if (config.clearButton && shortcut === "clearButton") action = [ clearSelection, [ datepicker ] ]; else if (config.todayButton && shortcut === "todayButton") action = [ goToOrSelectToday, [ datepicker ] ];
            } else if (shortcut === "show") action = shortcut;
            if (action) {
                if (Array.isArray(action)) action[0].apply(null, action[1]); else datepicker[action]();
                cancelEvent();
                return;
            }
        }
        if (!active || editMode) return;
        const handleArrowKeyPress = (direction, vertical) => {
            if (shiftKey || ctrlOrMetaKey || altKey) datepicker.enterEditMode(); else {
                moveByArrowKey(datepicker, direction, vertical);
                ev.preventDefault();
            }
        };
        if (key === "ArrowLeft") handleArrowKeyPress(-1, false); else if (key === "ArrowRight") handleArrowKeyPress(1, false); else if (key === "ArrowUp") handleArrowKeyPress(-1, true); else if (key === "ArrowDown") handleArrowKeyPress(1, true); else if (key === "Backspace" || key === "Delete" || key && key.length === 1 && !ctrlOrMetaKey) datepicker.enterEditMode();
    }
    function onFocus(datepicker) {
        if (datepicker.config.showOnFocus && !datepicker._showing) datepicker.show();
    }
    function onMousedown(datepicker, ev) {
        const el = ev.target;
        if (datepicker.picker.active || datepicker.config.showOnClick) {
            el._active = isActiveElement(el);
            el._clicking = setTimeout((() => {
                delete el._active;
                delete el._clicking;
            }), 2e3);
        }
    }
    function onClickInput(datepicker, ev) {
        const el = ev.target;
        if (!el._clicking) return;
        clearTimeout(el._clicking);
        delete el._clicking;
        if (el._active) datepicker.enterEditMode();
        delete el._active;
        if (datepicker.config.showOnClick) datepicker.show();
    }
    function onPaste(datepicker, ev) {
        if (ev.clipboardData.types.includes("text/plain")) datepicker.enterEditMode();
    }
    function onClickOutside(datepicker, ev) {
        const {element, picker} = datepicker;
        if (!picker.active && !isActiveElement(element)) return;
        const pickerElem = picker.element;
        if (findElementInEventPath(ev, (el => el === element || el === pickerElem))) return;
        unfocus(datepicker);
    }
    function stringifyDates(dates, config) {
        return dates.map((dt => date_format_formatDate(dt, config.format, config.locale))).join(config.dateDelimiter);
    }
    function processInputDates(datepicker, inputDates, clear = false) {
        if (inputDates.length === 0) return clear ? [] : void 0;
        const {config, dates: origDates, rangeSideIndex} = datepicker;
        const {pickLevel, maxNumberOfDates} = config;
        let newDates = inputDates.reduce(((dates, dt) => {
            let date = parseDate(dt, config.format, config.locale);
            if (date === void 0) return dates;
            date = regularizeDate(date, pickLevel, rangeSideIndex);
            if (isInRange(date, config.minDate, config.maxDate) && !dates.includes(date) && !config.checkDisabled(date, pickLevel) && (pickLevel > 0 || !config.daysOfWeekDisabled.includes(new Date(date).getDay()))) dates.push(date);
            return dates;
        }), []);
        if (newDates.length === 0) return;
        if (config.multidate && !clear) newDates = newDates.reduce(((dates, date) => {
            if (!origDates.includes(date)) dates.push(date);
            return dates;
        }), origDates.filter((date => !newDates.includes(date))));
        return maxNumberOfDates && newDates.length > maxNumberOfDates ? newDates.slice(maxNumberOfDates * -1) : newDates;
    }
    function refreshUI(datepicker, mode = 3, quickRender = true, viewDate = void 0) {
        const {config, picker, inputField} = datepicker;
        if (mode & 2) {
            const newView = picker.active ? config.pickLevel : config.startView;
            picker.update(viewDate).changeView(newView).render(quickRender);
        }
        if (mode & 1 && inputField) inputField.value = stringifyDates(datepicker.dates, config);
    }
    function setDate(datepicker, inputDates, options) {
        const config = datepicker.config;
        let {clear, render, autohide, revert, forceRefresh, viewDate} = options;
        if (render === void 0) render = true;
        if (!render) autohide = forceRefresh = false; else if (autohide === void 0) autohide = config.autohide;
        viewDate = parseDate(viewDate, config.format, config.locale);
        const newDates = processInputDates(datepicker, inputDates, clear);
        if (!newDates && !revert) return;
        if (newDates && newDates.toString() !== datepicker.dates.toString()) {
            datepicker.dates = newDates;
            refreshUI(datepicker, render ? 3 : 1, true, viewDate);
            triggerDatepickerEvent(datepicker, "changeDate");
        } else refreshUI(datepicker, forceRefresh ? 3 : 1, true, viewDate);
        if (autohide) datepicker.hide();
    }
    function getOutputConverter(datepicker, format) {
        return format ? date => date_format_formatDate(date, format, datepicker.config.locale) : date => new Date(date);
    }
    class Datepicker_Datepicker {
        constructor(element, options = {}, rangepicker = void 0) {
            element.datepicker = this;
            this.element = element;
            this.dates = [];
            const config = this.config = Object.assign({
                buttonClass: options.buttonClass && String(options.buttonClass) || "button",
                container: null,
                defaultViewDate: today(),
                maxDate: void 0,
                minDate: void 0
            }, processOptions(defaultOptions, this));
            let inputField;
            if (element.tagName === "INPUT") {
                inputField = this.inputField = element;
                inputField.classList.add("datepicker-input");
                if (options.container) config.container = options.container instanceof HTMLElement ? options.container : document.querySelector(options.container);
            } else config.container = element;
            if (rangepicker) {
                const index = rangepicker.inputs.indexOf(inputField);
                const datepickers = rangepicker.datepickers;
                if (index < 0 || index > 1 || !Array.isArray(datepickers)) throw Error("Invalid rangepicker object.");
                datepickers[index] = this;
                this.rangepicker = rangepicker;
                this.rangeSideIndex = index;
            }
            this._options = options;
            Object.assign(config, processOptions(options, this));
            config.shortcutKeys = createShortcutKeyConfig(options.shortcutKeys || {});
            const initialDates = stringToArray(element.value || element.dataset.date, config.dateDelimiter);
            delete element.dataset.date;
            const inputDateValues = processInputDates(this, initialDates);
            if (inputDateValues && inputDateValues.length > 0) this.dates = inputDateValues;
            if (inputField) inputField.value = stringifyDates(this.dates, config);
            const picker = this.picker = new Picker(this);
            const keydownListener = [ element, "keydown", onKeydown.bind(null, this) ];
            if (inputField) event_registerListeners(this, [ keydownListener, [ inputField, "focus", onFocus.bind(null, this) ], [ inputField, "mousedown", onMousedown.bind(null, this) ], [ inputField, "click", onClickInput.bind(null, this) ], [ inputField, "paste", onPaste.bind(null, this) ], [ document, "mousedown", onClickOutside.bind(null, this) ], [ window, "resize", picker.place.bind(picker) ] ]); else {
                event_registerListeners(this, [ keydownListener ]);
                this.show();
            }
        }
        static formatDate(date, format, lang) {
            return date_format_formatDate(date, format, lang && base_locales[lang] || base_locales.en);
        }
        static parseDate(dateStr, format, lang) {
            return parseDate(dateStr, format, lang && base_locales[lang] || base_locales.en);
        }
        static get locales() {
            return base_locales;
        }
        get active() {
            return !!(this.picker && this.picker.active);
        }
        get pickerElement() {
            return this.picker ? this.picker.element : void 0;
        }
        setOptions(options) {
            const newOptions = processOptions(options, this);
            Object.assign(this._options, options);
            Object.assign(this.config, newOptions);
            this.picker.setOptions(newOptions);
            refreshUI(this, 3);
        }
        show() {
            if (this.inputField) {
                const {config, inputField} = this;
                if (inputField.disabled || inputField.readOnly && !config.enableOnReadonly) return;
                if (!isActiveElement(inputField) && !config.disableTouchKeyboard) {
                    this._showing = true;
                    inputField.focus();
                    delete this._showing;
                }
            }
            this.picker.show();
        }
        hide() {
            if (!this.inputField) return;
            this.picker.hide();
            this.picker.update().changeView(this.config.startView).render();
        }
        toggle() {
            if (!this.picker.active) this.show(); else if (this.inputField) this.picker.hide();
        }
        destroy() {
            this.hide();
            event_unregisterListeners(this);
            this.picker.detach();
            const element = this.element;
            element.classList.remove("datepicker-input");
            delete element.datepicker;
            return this;
        }
        getDate(format = void 0) {
            const callback = getOutputConverter(this, format);
            if (this.config.multidate) return this.dates.map(callback);
            if (this.dates.length > 0) return callback(this.dates[0]);
        }
        setDate(...args) {
            const dates = [ ...args ];
            const opts = {};
            const lastArg = lastItemOf(args);
            if (lastArg && typeof lastArg === "object" && !Array.isArray(lastArg) && !(lastArg instanceof Date)) Object.assign(opts, dates.pop());
            const inputDates = Array.isArray(dates[0]) ? dates[0] : dates;
            setDate(this, inputDates, opts);
        }
        update(options = void 0) {
            if (!this.inputField) return;
            const opts = Object.assign(options || {}, {
                clear: true,
                render: true,
                viewDate: void 0
            });
            const inputDates = stringToArray(this.inputField.value, this.config.dateDelimiter);
            setDate(this, inputDates, opts);
        }
        getFocusedDate(format = void 0) {
            return getOutputConverter(this, format)(this.picker.viewDate);
        }
        setFocusedDate(viewDate, resetView = false) {
            const {config, picker, active, rangeSideIndex} = this;
            const pickLevel = config.pickLevel;
            const newViewDate = parseDate(viewDate, config.format, config.locale);
            if (newViewDate === void 0) return;
            picker.changeFocus(regularizeDate(newViewDate, pickLevel, rangeSideIndex));
            if (active && resetView) picker.changeView(pickLevel);
            picker.render();
        }
        refresh(target = void 0, forceRender = false) {
            if (target && typeof target !== "string") {
                forceRender = target;
                target = void 0;
            }
            let mode;
            if (target === "picker") mode = 2; else if (target === "input") mode = 1; else mode = 3;
            refreshUI(this, mode, !forceRender);
        }
        enterEditMode() {
            const inputField = this.inputField;
            if (!inputField || inputField.readOnly || !this.picker.active || this.editMode) return;
            this.editMode = true;
            inputField.classList.add("in-edit");
        }
        exitEditMode(options = void 0) {
            if (!this.inputField || !this.editMode) return;
            const opts = Object.assign({
                update: false
            }, options);
            delete this.editMode;
            this.inputField.classList.remove("in-edit");
            if (opts.update) this.update(opts);
        }
    }
    const startElem = document.querySelectorAll(".start-date");
    if (startElem) for (let i = 0; i < startElem.length; i++) {
        new Datepicker_Datepicker(startElem[i], {
            autohide: true,
            format: "dd.mm.yyyy"
        });
    }
    const endElem = document.querySelectorAll(".end-date");
    if (endElem) for (let i = 0; i < endElem.length; i++) {
        new Datepicker_Datepicker(endElem[i], {
            autohide: true,
            format: "dd.mm.yyyy"
        });
    }
    function DynamicAdapt(type) {
        this.type = type;
    }
    DynamicAdapt.prototype.init = function() {
        const _this = this;
        this.оbjects = [];
        this.daClassname = "_dynamic_adapt_";
        this.nodes = document.querySelectorAll("[data-da]");
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            const data = node.dataset.da.trim();
            const dataArray = data.split(",");
            const оbject = {};
            оbject.element = node;
            оbject.parent = node.parentNode;
            оbject.destination = document.querySelector(dataArray[0].trim());
            оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
            оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
            оbject.index = this.indexInParent(оbject.parent, оbject.element);
            this.оbjects.push(оbject);
        }
        this.arraySort(this.оbjects);
        this.mediaQueries = Array.prototype.map.call(this.оbjects, (function(item) {
            return "(" + this.type + "-width: " + item.breakpoint + "px)," + item.breakpoint;
        }), this);
        this.mediaQueries = Array.prototype.filter.call(this.mediaQueries, (function(item, index, self) {
            return Array.prototype.indexOf.call(self, item) === index;
        }));
        for (let i = 0; i < this.mediaQueries.length; i++) {
            const media = this.mediaQueries[i];
            const mediaSplit = String.prototype.split.call(media, ",");
            const matchMedia = window.matchMedia(mediaSplit[0]);
            const mediaBreakpoint = mediaSplit[1];
            const оbjectsFilter = Array.prototype.filter.call(this.оbjects, (function(item) {
                return item.breakpoint === mediaBreakpoint;
            }));
            matchMedia.addListener((function() {
                _this.mediaHandler(matchMedia, оbjectsFilter);
            }));
            this.mediaHandler(matchMedia, оbjectsFilter);
        }
    };
    DynamicAdapt.prototype.mediaHandler = function(matchMedia, оbjects) {
        if (matchMedia.matches) for (let i = 0; i < оbjects.length; i++) {
            const оbject = оbjects[i];
            оbject.index = this.indexInParent(оbject.parent, оbject.element);
            this.moveTo(оbject.place, оbject.element, оbject.destination);
        } else for (let i = оbjects.length - 1; i >= 0; i--) {
            const оbject = оbjects[i];
            if (оbject.element.classList.contains(this.daClassname)) this.moveBack(оbject.parent, оbject.element, оbject.index);
        }
    };
    DynamicAdapt.prototype.moveTo = function(place, element, destination) {
        element.classList.add(this.daClassname);
        if (place === "last" || place >= destination.children.length) {
            destination.insertAdjacentElement("beforeend", element);
            return;
        }
        if (place === "first") {
            destination.insertAdjacentElement("afterbegin", element);
            return;
        }
        destination.children[place].insertAdjacentElement("beforebegin", element);
    };
    DynamicAdapt.prototype.moveBack = function(parent, element, index) {
        element.classList.remove(this.daClassname);
        if (parent.children[index] !== void 0) parent.children[index].insertAdjacentElement("beforebegin", element); else parent.insertAdjacentElement("beforeend", element);
    };
    DynamicAdapt.prototype.indexInParent = function(parent, element) {
        const array = Array.prototype.slice.call(parent.children);
        return Array.prototype.indexOf.call(array, element);
    };
    DynamicAdapt.prototype.arraySort = function(arr) {
        if (this.type === "min") Array.prototype.sort.call(arr, (function(a, b) {
            if (a.breakpoint === b.breakpoint) {
                if (a.place === b.place) return 0;
                if (a.place === "first" || b.place === "last") return -1;
                if (a.place === "last" || b.place === "first") return 1;
                return a.place - b.place;
            }
            return a.breakpoint - b.breakpoint;
        })); else {
            Array.prototype.sort.call(arr, (function(a, b) {
                if (a.breakpoint === b.breakpoint) {
                    if (a.place === b.place) return 0;
                    if (a.place === "first" || b.place === "last") return 1;
                    if (a.place === "last" || b.place === "first") return -1;
                    return b.place - a.place;
                }
                return b.breakpoint - a.breakpoint;
            }));
            return;
        }
    };
    const da = new DynamicAdapt("max");
    da.init();
    (function() {
        function choosing() {
            const choosingInstructors = document.querySelectorAll(".choosing-an-instructors__item");
            const choosingTime = document.querySelectorAll(".choosing-time__item");
            if (choosingInstructors) document.addEventListener("click", (e => {
                const target = e.target.closest(".choosing-an-instructors__item");
                if (target) {
                    for (const elem of choosingInstructors) elem.classList.remove("_active");
                    target.classList.add("_active");
                }
            }));
            if (choosingTime) document.addEventListener("click", (e => {
                const target = e.target.closest(".choosing-time__item");
                if (target) {
                    for (const elem of choosingTime) elem.classList.remove("_active");
                    target.classList.add("_active");
                }
            }));
        }
        choosing();
    })();
    isWebp();
    menuInit();
})();