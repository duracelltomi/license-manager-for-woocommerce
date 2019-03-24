/**
 * Simulates the jQuery $.ajax() function.
 * 
 * @param {Object} option
 * 
 * @return {Void}
 */
function lmfwcAjax(option)
{
    if (typeof(option.url) == 'undefined') {
        try {
            option.url = location.href;
        } catch(e) {
            var ajaxLocation;
            ajaxLocation = document.createElement('a');
            ajaxLocation.href = '';
            option.url = ajaxLocation.href;
        }
    }
    if (typeof(option.type) == 'undefined') {
        option.type = 'GET';
    }
    if (typeof(option.data) == 'undefined') {
        option.data = null;
    } else {
        var data = '';
        for (x in option.data) {
            if (data != '') {
                data += '&';
            }
            data += encodeURIComponent(x)+'='+encodeURIComponent(option.data[x]);
        };
        option.data = data;
    }
    if (typeof(option.statusCode) == 'undefined') {
        option.statusCode = {};
    }
    if (typeof(option.beforeSend) == 'undefined') {
        option.beforeSend = function () {};
    }
    if (typeof(option.success) == 'undefined') {
        option.success = function () {};
    }
    if (typeof(option.error) == 'undefined') {
        option.error = function () {};
    }
    if (typeof(option.complete) == 'undefined') {
        option.complete = function () {};
    }
    typeof(option.statusCode['404']);

    var xhr = null;

    if (window.XMLHttpRequest || window.ActiveXObject) {
        if (window.ActiveXObject) { try { xhr = new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) { xhr = new ActiveXObject('Microsoft.XMLHTTP'); } }
        else { xhr = new XMLHttpRequest(); }
    } else { alert('Your browser does not support XMLHTTPRequest object...'); return null; }

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 1) {
            option.beforeSend();
        }
        if (xhr.readyState == 4) {
            option.complete(xhr, xhr.status);
            if (xhr.status == 200 || xhr.status == 0) {
                option.success(xhr.responseText);
            } else {
                option.error(xhr.status);
                if (typeof(option.statusCode[xhr.status]) != 'undefined') {
                    option.statusCode[xhr.status]();
                }
            }
        }
    };

    if (option.type == 'POST') {
        xhr.open(option.type, option.url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(option.data);
    } else {
        xhr.open(option.type, option.url+option.data, true);
        xhr.send(null);
    }
}

document.addEventListener('DOMContentLoaded', function(event) {

    var licenseTable = {
        btnHideLicense: document.querySelectorAll('.lmfwc-license-key-hide'),
        btnShowLicense: document.querySelectorAll('.lmfwc-license-key-show'),
        btnCopyToClipboard: document.querySelectorAll('code.lmfwc-placeholder'),
        txtCopiedToClipboard: document.querySelector('.lmfwc-txt-copied-to-clipboard'),
        bindEventListeners: function() {
            var that = this;

            if (this.btnHideLicense) {
                for (var i = 0; i < this.btnHideLicense.length; i++) {
                    this.btnHideLicense[i].addEventListener('click', function() {
                        that.hideLicenseKey(this);
                    });
                }
            }

            if (this.btnShowLicense) {
                for (var i = 0; i < this.btnShowLicense.length; i++) {
                    this.btnShowLicense[i].addEventListener('click', function() {
                        that.showLicenseKey(this);
                    });
                }
            }

            if (this.btnCopyToClipboard) {
                for (var i = 0; i < this.btnCopyToClipboard.length; i++) {
                    this.btnCopyToClipboard[i].addEventListener('click', function(e) {
                        that.copyToClipboard(this, e);
                    });
                }
            }
        },
        hideLicenseKey: function(el) {
            var code = el.parentNode.parentNode.previousSibling.previousSibling;

            code.innerText = '';
            code.classList.add('empty');
        },
        showLicenseKey: function(el) {
            var licenseKeyId = parseInt(el.dataset.id);
            var spinner      = el.parentNode.parentNode.previousSibling;
            var code         = spinner.previousSibling;

            spinner.style.opacity = 1;

            lmfwcAjax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'lmfwc_show_license_key',
                    show: license.show,
                    id: licenseKeyId
                },
                success: function(response) {
                    code.classList.remove('empty');
                    code.innerText = JSON.parse(response);
                },
                error: function(response) {
                    console.log(response);
                },
                complete: function() {
                    spinner.style.opacity = 0;
                }
            });
        },
        copyToClipboard: function(el, e) {
            // Copy to cliboard
            var str = el.innerText.toString();

            if (!str) return;

            const textArea = document.createElement('textarea');
            textArea.value = str;
            textArea.setAttribute('readonly', '');
            textArea.style.position = 'absolute';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            const selected =
                document.getSelection().rangeCount > 0
                    ? document.getSelection().getRangeAt(0)
                    : false;
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            if (selected) {
                document.getSelection().removeAllRanges();
                document.getSelection().addRange(selected);
            }

            // Display info
            var copied = document.createElement('div');
            copied.classList.add('lmfwc-clipboard');
            copied.style.position = 'absolute';
            copied.style.left = e.clientX.toString() + 'px';
            copied.style.top = (window.pageYOffset + e.clientY).toString() + 'px';
            copied.innerText = document.querySelector('.lmfwc-txt-copied-to-clipboard').innerText.toString();
            document.body.appendChild(copied);

            //copied.style.opacity = 0;
            setTimeout(function() {
                copied.style.opacity = '0';
            }, 700);
            setTimeout(function() {
                document.body.removeChild(copied);
            }, 1500);
        },
        init: function() {
            this.bindEventListeners();
        }
    }

    var orderLicenses = {
        btnShow: document.querySelector('.lmfwc-license-keys-show-all'),
        btnHide: document.querySelector('.lmfwc-license-keys-hide-all'),
        getLicenseKeyIds: function() {
            var licenseKeyIds = [];
            var codeList      = this.btnShow.parentNode.previousSibling.children;

            for(var i = 0, length = codeList.length; i < length; i++){
                licenseKeyIds.push(parseInt(codeList[i].children[0].dataset.id));
            }

            return licenseKeyIds;
        },
        bindShow: function() {
            if (!this.btnShow) return;

            var spinner = this.btnShow.nextSibling.nextSibling;
            var licenseKeyIds = this.getLicenseKeyIds();

            this.btnShow.addEventListener('click', function() {
                spinner.style.opacity = 1;

                lmfwcAjax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'lmfwc_show_all_license_keys',
                        show_all: license.show_all,
                        ids: JSON.stringify(licenseKeyIds)
                    },
                    success: function(response) {
                        var licenseKeys = JSON.parse(response);

                        for (var id in licenseKeys) {
                            var licenseKey = document.querySelector('.lmfwc-placeholder[data-id="' + id +'"]');
                            licenseKey.classList.remove('empty');
                            licenseKey.innerText = licenseKeys[id];
                        }
                    },
                    error: function(response) {
                        console.log(response);
                    },
                    complete: function() {
                        spinner.style.opacity = 0;
                    }
                });
            });
        },
        bindHide: function() {
            if (!this.btnHide) return;

            var licenseKeyIds = this.getLicenseKeyIds();

            this.btnHide.addEventListener('click', function() {
                for (var id in licenseKeyIds) {
                    var licenseKey = document.querySelector('.lmfwc-placeholder[data-id="' + licenseKeyIds[id] +'"]');
                    licenseKey.classList.add('empty');
                    licenseKey.innerText = '';
                }
            });
        },
        init: function() {
            this.bindShow();
            this.bindHide();
        }
    }

    licenseTable.init();
    orderLicenses.init();
});