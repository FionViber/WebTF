/* Travel Frog: static files and an in-browser game engine. */
var getQuery = function (key) { return new URLSearchParams(location.search).get(key) || ''; };
(function () {
    'use strict';
    function failed(message) {
        console.error('[launcher]', message);
        var box = document.createElement('div');
        box.setAttribute('role', 'alert');
        box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff;color:#222;padding:40px;font:16px/1.6 sans-serif';
        var title = document.createElement('h1'); title.textContent = 'Unable to load the game';
        var text = document.createElement('p'); text.textContent = message;
        var button = document.createElement('button'); button.textContent = 'Retry';
        button.onclick = function () { location.reload(); };
        box.append(title, text, button); document.body.appendChild(box);
    }
    function script(src) {
        return new Promise(function (resolve, reject) {
            var tag = document.createElement('script'); tag.async = false; tag.src = src;
            tag.onload = function () { tag.remove(); resolve(); };
            tag.onerror = function () { tag.remove(); reject(new Error('Missing game script: ' + src)); };
            document.body.appendChild(tag);
        });
    }
    function manifest() {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'manifest.json', true); xhr.timeout = 30000;
            xhr.onerror = xhr.ontimeout = function () { reject(new Error('Could not load manifest.json.')); };
            xhr.onload = function () {
                if (xhr.status < 200 || xhr.status >= 300) { reject(new Error('manifest.json returned HTTP ' + xhr.status)); return; }
                try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('manifest.json is not valid JSON.')); }
            };
            xhr.send();
        });
    }
    async function start() {
        if (location.protocol === 'file:') throw new Error('Use Start-Preview.cmd for a local preview, or upload the complete site folder to a static web host.');
        if (!window.FrogEngine) throw new Error('The local game engine is missing.');
        var m = await manifest();
        if (!Array.isArray(m.initial) || !Array.isArray(m.game)) throw new Error('The game manifest is incomplete.');
        window.resUrl = m.res; window.thmUrl = m.thm;
        window.manifestVersion = m.version; window.manifestBuild = m.build;
        window.appVersion = m.appVersion; window.appStatus = m.appStatus;
        window.frogCode = m.code; window.frogArgs = m.args;
        window.launchInfo = 'static_local';
        for (var name of m.initial.concat(m.game)) await script(name);
        egret.runEgret({renderMode:'webgl',audioType:0,calculateCanvasScaleFactor:function (context) {
            var backing = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || 1;
            return (window.devicePixelRatio || 1) / backing;
        }});
    }
    start().catch(function (error) { failed(error.message); });
}());
