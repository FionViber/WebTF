/* A single active writer protects the browser-local Travel Frog save. */
(function () {
    'use strict';
    var key = 'frog.offline.active-session';
    var id = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Date.now() + '-' + Math.random();
    var available = false, retired = false;
    try { localStorage.setItem(key, id); available = localStorage.getItem(key) === id; } catch (_) {}
    function show() {
        if (document.getElementById('frog-session-notice')) return;
        if (!document.body) { document.addEventListener('DOMContentLoaded', show, {once:true}); return; }
        var box = document.createElement('div'); box.id = 'frog-session-notice'; box.setAttribute('role', 'alert');
        box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#fff;color:#222;padding:40px;font:18px/1.7 sans-serif';
        var text = document.createElement('p'); text.textContent = '存档已在另一个页面打开。此页面已停止保存，请重新载入后继续游戏。';
        var button = document.createElement('button'); button.textContent = '重新载入'; button.onclick = function () { location.reload(); };
        box.append(text, button); document.body.appendChild(box);
    }
    function canWrite() {
        if (retired) return false;
        if (!available) return true; // Let the engine report storage failures itself.
        try { if (localStorage.getItem(key) === id) return true; } catch (_) { return false; }
        retired = true; show(); return false;
    }
    window.FrogSaveSession = {canWrite:canWrite};
    window.addEventListener('storage', function (event) { if (event.key === key) canWrite(); });
}());
