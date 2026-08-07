// ============================================================================
// In-canvas editing layer
// ----------------------------------------------------------------------------
// The preview is an <iframe srcDoc>, so it cannot share React state with the
// editor. This module supplies the CSS and the script that get injected into
// that iframe ONLY in preview mode, giving the canvas:
//
//   • hover outline + section name chip
//   • click to select (syncs the sidebar and Properties panel)
//   • a floating toolbar per section: drag, move up, move down, duplicate, delete
//   • pointer-based drag-and-drop reordering with a drop indicator
//
// Everything talks to the parent through postMessage. None of it is emitted
// when generating the export, so the delivered HTML stays clean, table-based
// and email-safe.
// ============================================================================

/** Messages the injected script posts to the editor. */
export type CanvasMessage =
  | { source: 'nl-canvas'; type: 'select'; id: string }
  | { source: 'nl-canvas'; type: 'move'; id: string; dir: -1 | 1 }
  | { source: 'nl-canvas'; type: 'duplicate'; id: string }
  | { source: 'nl-canvas'; type: 'delete'; id: string }
  | { source: 'nl-canvas'; type: 'reorder'; id: string; beforeId: string | null }
  | { source: 'nl-canvas'; type: 'height'; height: number };

export const CANVAS_ATTR = 'data-nl-section';

export function canvasStyles(): string {
  return `
  <style id="nl-editor-styles">
    .nl-sec { position: relative; }
    .nl-sec::after {
      content: ''; position: absolute; inset: -2px; pointer-events: none;
      border: 2px solid transparent; border-radius: 6px; transition: border-color .12s ease;
    }
    .nl-sec:hover::after { border-color: rgba(29,31,31,.28); }
    .nl-sec.nl-selected::after { border-color: #1D1F1F; }
    .nl-sec.nl-dragging { opacity: .4; }

    .nl-chip {
      position: absolute; top: -11px; left: 8px; z-index: 40;
      background: #1D1F1F; color: #fff; font: 700 10px/1 Arial, sans-serif;
      letter-spacing: .6px; text-transform: uppercase;
      padding: 5px 8px; border-radius: 5px; white-space: nowrap;
      opacity: 0; transition: opacity .12s ease; pointer-events: none;
    }
    .nl-sec:hover > .nl-chip, .nl-sec.nl-selected > .nl-chip { opacity: 1; }

    .nl-tools {
      position: absolute; top: -13px; right: 8px; z-index: 41;
      display: flex; gap: 2px; background: #1D1F1F; border-radius: 6px;
      padding: 3px; opacity: 0; transition: opacity .12s ease;
    }
    .nl-sec:hover > .nl-tools, .nl-sec.nl-selected > .nl-tools { opacity: 1; }
    .nl-tools button {
      width: 22px; height: 22px; border: 0; background: transparent; color: #fff;
      border-radius: 4px; cursor: pointer; padding: 0;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .nl-tools button:hover { background: rgba(255,255,255,.18); }
    .nl-tools button[data-act="delete"]:hover { background: #E14B4B; }
    .nl-tools button[data-act="drag"] { cursor: grab; }
    .nl-tools button[data-act="drag"]:active { cursor: grabbing; }
    .nl-tools svg { width: 13px; height: 13px; display: block; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

    .nl-drop {
      height: 3px; background: #FFDA4B; border-radius: 3px; margin: 3px 0;
      box-shadow: 0 0 0 1px #1D1F1F;
    }
    body.nl-drag-active, body.nl-drag-active * { user-select: none !important; }
  </style>`;
}

/**
 * The injected controller. Written as a plain string so it runs inside the
 * iframe without any bundling, and kept dependency-free.
 */
export function canvasScript(): string {
  return `
  <script id="nl-editor-script">
  (function () {
    var ATTR = '${CANVAS_ATTR}';
    function post(msg) { msg.source = 'nl-canvas'; parent.postMessage(msg, '*'); }
    function sections() { return Array.prototype.slice.call(document.querySelectorAll('[' + ATTR + ']')); }

    var ICONS = {
      drag: '<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>',
      up: '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
      down: '<svg viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
      dup: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
      del: '<svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>'
    };

    function decorate(el) {
      if (el.querySelector(':scope > .nl-tools')) return;
      el.classList.add('nl-sec');

      var chip = document.createElement('div');
      chip.className = 'nl-chip';
      chip.textContent = el.getAttribute('data-nl-label') || 'Section';
      el.appendChild(chip);

      var tools = document.createElement('div');
      tools.className = 'nl-tools';
      tools.innerHTML =
        '<button data-act="drag" title="Drag to reorder">' + ICONS.drag + '</button>' +
        '<button data-act="up" title="Move up">' + ICONS.up + '</button>' +
        '<button data-act="down" title="Move down">' + ICONS.down + '</button>' +
        '<button data-act="duplicate" title="Duplicate">' + ICONS.dup + '</button>' +
        '<button data-act="delete" title="Delete">' + ICONS.del + '</button>';
      el.appendChild(tools);
    }

    function id(el) { return el.getAttribute(ATTR); }

    // --- selection ---------------------------------------------------------
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.nl-tools button') : null;
      var host = e.target.closest ? e.target.closest('[' + ATTR + ']') : null;
      if (btn && host) {
        e.preventDefault(); e.stopPropagation();
        var act = btn.getAttribute('data-act');
        if (act === 'up') post({ type: 'move', id: id(host), dir: -1 });
        else if (act === 'down') post({ type: 'move', id: id(host), dir: 1 });
        else if (act === 'duplicate') post({ type: 'duplicate', id: id(host) });
        else if (act === 'delete') post({ type: 'delete', id: id(host) });
        return;
      }
      if (host) {
        // Links inside the newsletter must not navigate the preview.
        var link = e.target.closest ? e.target.closest('a') : null;
        if (link) e.preventDefault();
        post({ type: 'select', id: id(host) });
      }
    }, true);

    // --- pointer drag to reorder ------------------------------------------
    var dragging = null, indicator = null, beforeId = null;

    function clearIndicator() {
      if (indicator && indicator.parentNode) indicator.parentNode.removeChild(indicator);
      indicator = null;
    }

    document.addEventListener('pointerdown', function (e) {
      var handle = e.target.closest ? e.target.closest('.nl-tools button[data-act="drag"]') : null;
      if (!handle) return;
      var host = handle.closest('[' + ATTR + ']');
      if (!host) return;
      e.preventDefault();
      dragging = host;
      beforeId = null;
      host.classList.add('nl-dragging');
      document.body.classList.add('nl-drag-active');
      indicator = document.createElement('div');
      indicator.className = 'nl-drop';
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
    });

    document.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var list = sections().filter(function (s) { return s !== dragging; });
      var target = null, placeBefore = true;
      for (var i = 0; i < list.length; i++) {
        var r = list[i].getBoundingClientRect();
        if (e.clientY < r.top + r.height / 2) { target = list[i]; placeBefore = true; break; }
        target = list[i]; placeBefore = false;
      }
      if (!target) { clearIndicator(); beforeId = null; return; }
      if (placeBefore) {
        target.parentNode.insertBefore(indicator, target);
        beforeId = id(target);
      } else {
        target.parentNode.insertBefore(indicator, target.nextSibling);
        var idx = list.indexOf(target);
        beforeId = idx + 1 < list.length ? id(list[idx + 1]) : null;
      }
    });

    function endDrag() {
      if (!dragging) return;
      var movedId = id(dragging);
      dragging.classList.remove('nl-dragging');
      document.body.classList.remove('nl-drag-active');
      clearIndicator();
      var target = beforeId;
      dragging = null; beforeId = null;
      post({ type: 'reorder', id: movedId, beforeId: target });
    }
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);

    // --- init + height reporting ------------------------------------------
    function init() {
      sections().forEach(decorate);
      var sel = document.documentElement.getAttribute('data-nl-selected');
      sections().forEach(function (s) {
        s.classList.toggle('nl-selected', !!sel && id(s) === sel);
      });
      post({ type: 'height', height: document.documentElement.scrollHeight });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    window.addEventListener('load', function () {
      post({ type: 'height', height: document.documentElement.scrollHeight });
    });
  })();
  </script>`;
}
