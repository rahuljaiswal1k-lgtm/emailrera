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
  | { source: 'nl-canvas'; type: 'height'; height: number }
  | { source: 'nl-canvas'; type: 'edit'; id: string; path: string; value: string }
  | { source: 'nl-canvas'; type: 'format'; id: string; key: string; value: string; path?: string };

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

    /* --- inline text editing --- */
    [data-nl-edit] { outline: none; }
    [data-nl-edit]:hover { box-shadow: inset 0 0 0 1px rgba(29,31,31,.18); border-radius: 3px; cursor: text; }
    [data-nl-edit][contenteditable="true"] {
      box-shadow: inset 0 0 0 2px #FFDA4B; border-radius: 3px; background: rgba(255,218,75,.10);
    }
    /* Bullet + numbered lists produced by the toolbar. Table-based email
       HTML strips the default UA styling of <ul>/<ol> and I don't want to
       fight the reset globally, so lists inside editable text get sensible
       inline defaults here. */
    [data-nl-edit] ul, [data-nl-edit] ol { margin: 4px 0 4px 22px; padding: 0; }
    [data-nl-edit] ul { list-style: disc; }
    [data-nl-edit] ol { list-style: decimal; }
    [data-nl-edit] li { margin: 2px 0; }

    #nl-fmt {
      position: fixed; z-index: 90; display: none; gap: 2px; align-items: center;
      background: #1D1F1F; border-radius: 8px; padding: 4px; box-shadow: 0 6px 20px rgba(0,0,0,.28);
    }
    #nl-fmt.open { display: flex; }
    #nl-fmt button, #nl-fmt select {
      height: 26px; border: 0; background: transparent; color: #fff; border-radius: 5px;
      font: 700 12px/1 Arial, sans-serif; cursor: pointer; padding: 0 7px;
    }
    #nl-fmt button:hover, #nl-fmt select:hover { background: rgba(255,255,255,.16); }
    #nl-fmt select { background: #2A2C2C; font-weight: 400; max-width: 118px; }
    #nl-fmt .sep { width: 1px; height: 16px; background: rgba(255,255,255,.22); margin: 0 3px; }
    #nl-fmt input[type=color] { width: 26px; height: 22px; border: 0; background: none; padding: 0; cursor: pointer; }
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

    // --- inline text editing ----------------------------------------------
    var FONTS = [
      ['', 'Default font'],
      ['Arial,Helvetica,sans-serif', 'Arial'],
      ['Georgia,serif', 'Georgia'],
      ['\\'Times New Roman\\',Times,serif', 'Times New Roman'],
      ['Verdana,Geneva,sans-serif', 'Verdana'],
      ['Tahoma,Geneva,sans-serif', 'Tahoma'],
      ['\\'Trebuchet MS\\',sans-serif', 'Trebuchet MS'],
      ['\\'Courier New\\',monospace', 'Courier New']
    ];
    var editing = null, bar = null;

    function buildBar() {
      bar = document.createElement('div');
      bar.id = 'nl-fmt';
      var fontOpts = FONTS.map(function (f) { return '<option value="' + f[0] + '">' + f[1] + '</option>'; }).join('');
      bar.innerHTML =
        '<select data-fmt="font" title="Font family">' + fontOpts + '</select>' +
        '<select data-fmt="size" title="Font size">' +
          '<option value="">Size</option><option value="0.85">Small</option><option value="1">Normal</option>' +
          '<option value="1.2">Large</option><option value="1.5">X-Large</option></select>' +
        '<span class="sep"></span>' +
        '<button data-cmd="bold" title="Bold"><b>B</b></button>' +
        '<button data-cmd="italic" title="Italic"><i>I</i></button>' +
        '<button data-cmd="underline" title="Underline"><u>U</u></button>' +
        '<span class="sep"></span>' +
        '<button data-cmd="mark" title="Highlight with the chosen colour">&#9646;</button>' +
        '<input type="color" data-fmt="hilite" title="Highlight colour" value="#FFDA4B">' +
        '<button data-cmd="unmark" title="Remove highlight">&#215;</button>' +
        '<span class="sep"></span>' +
        '<button data-cmd="insertUnorderedList" title="Bullet list">&bull; &bull;</button>' +
        '<button data-cmd="insertOrderedList" title="Numbered list">1.</button>' +
        '<span class="sep"></span>' +
        '<button data-align="left" title="Align left">&#8676;</button>' +
        '<button data-align="center" title="Align center">&#8596;</button>' +
        '<button data-align="right" title="Align right">&#8677;</button>' +
        '<button data-align="justify" title="Justify">&#8801;</button>' +
        '<span class="sep"></span>' +
        '<input type="color" data-fmt="colour" title="Text colour" value="#1D1F1F">';
      document.body.appendChild(bar);

      bar.addEventListener('mousedown', function (e) {
        // Only stop button clicks from blurring the editable text. Selects and
        // colour inputs need real focus to open their native picker.
        if (e.target.closest && e.target.closest('button')) e.preventDefault();
      });

      bar.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('button') : null;
        if (!b || !editing) return;
        var cmd = b.getAttribute('data-cmd');
        var align = b.getAttribute('data-align');
        if (cmd === 'mark') {
          var picker = bar.querySelector('input[data-fmt="hilite"]');
          var colour = (picker && picker.value) || '#FFDA4B';
          document.execCommand('hiliteColor', false, colour);
        } else if (cmd === 'unmark') {
          removeHighlight(editing);
        } else if (cmd) {
          document.execCommand(cmd, false, null);
        } else if (align) {
          var host = editing.closest('[' + ATTR + ']');
          if (!host) return;
          // Scope alignment to the current field (title / subtitle / items.2 …)
          // so aligning the heading right doesn't drag the paragraph and
          // bullets with it.
          var path = editing.getAttribute('data-nl-edit') || undefined;
          post({ type: 'format', id: id(host), key: 'align', value: align, path: path });
          return;
        }
        commit();
      });

      bar.addEventListener('change', function (e) {
        var sel = e.target;
        var host = editing && editing.closest('[' + ATTR + ']');
        if (!host) return;
        // Scope the change to the specific field being edited (e.g. "title",
        // "subtitle", "items.2") so per-element styling doesn't leak across
        // the whole section.
        var path = editing.getAttribute('data-nl-edit') || undefined;
        var kind = sel.getAttribute('data-fmt');
        if (kind === 'font') post({ type: 'format', id: id(host), key: 'fontFamily', value: sel.value, path: path });
        else if (kind === 'size') post({ type: 'format', id: id(host), key: 'fontScale', value: sel.value, path: path });
        else if (kind === 'colour') post({ type: 'format', id: id(host), key: 'textColor', value: sel.value, path: path });
        else if (kind === 'hilite') {
          // Picking a new highlight colour applies it to the current selection
          // right away (no need to click the highlight button afterwards).
          document.execCommand('hiliteColor', false, sel.value);
          commit();
        }
      });
    }

    function placeBar(el) {
      var r = el.getBoundingClientRect();
      bar.classList.add('open');
      var top = r.top - bar.offsetHeight - 8;
      if (top < 4) top = r.bottom + 8;
      bar.style.top = top + 'px';
      bar.style.left = Math.max(6, Math.min(r.left, window.innerWidth - bar.offsetWidth - 6)) + 'px';
    }

    // Normalise <span> nodes execCommand leaves behind (mainly hiliteColor)
    // into whitelisted <mark> tags carrying the chosen background colour so
    // sanitizeRich keeps them and the colour survives to the export.
    function normaliseSpans(el) {
      var spans = el.querySelectorAll('span[style*="background-color"], span[style*="background"]');
      for (var i = 0; i < spans.length; i++) {
        var sp = spans[i];
        var colour = sp.style && (sp.style.backgroundColor || '');
        var mark = document.createElement('mark');
        if (colour) mark.setAttribute('style', 'background-color:' + colour);
        while (sp.firstChild) mark.appendChild(sp.firstChild);
        sp.parentNode.replaceChild(mark, sp);
      }
    }

    // Remove <mark> wrappers overlapping the current selection (or the whole
    // editing element when nothing is selected). This is what the ×-highlight
    // toolbar button does.
    function removeHighlight(root) {
      var sel = window.getSelection && window.getSelection();
      var range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
      var marks = root.querySelectorAll('mark');
      for (var i = 0; i < marks.length; i++) {
        var m = marks[i];
        if (range && !range.collapsed) {
          // Skip <mark>s that don't intersect the selection.
          var mr = document.createRange();
          mr.selectNode(m);
          var intersects =
            range.compareBoundaryPoints(Range.END_TO_START, mr) < 0 &&
            range.compareBoundaryPoints(Range.START_TO_END, mr) > 0;
          if (!intersects) continue;
        }
        var parent = m.parentNode;
        while (m.firstChild) parent.insertBefore(m.firstChild, m);
        parent.removeChild(m);
      }
    }

    function commit() {
      if (!editing) return;
      var host = editing.closest('[' + ATTR + ']');
      if (!host) return;
      normaliseSpans(editing);
      post({
        type: 'edit',
        id: id(host),
        path: editing.getAttribute('data-nl-edit'),
        value: editing.innerHTML
      });
    }

    function stopEditing() {
      if (!editing) return;
      commit();
      editing.removeAttribute('contenteditable');
      editing = null;
      if (bar) bar.classList.remove('open');
    }

    function startEditing(el) {
      if (editing === el) return;
      stopEditing();
      editing = el;
      el.setAttribute('contenteditable', 'true');
      el.focus();
      if (!bar) buildBar();
      placeBar(el);
    }

    document.addEventListener('click', function (e) {
      var f = e.target.closest ? e.target.closest('[data-nl-edit]') : null;
      if (f) { e.stopPropagation(); startEditing(f); }
      else if (!(e.target.closest && e.target.closest('#nl-fmt')) && e.target !== document.documentElement) stopEditing();
    });

    document.addEventListener('keydown', function (e) {
      if (!editing) return;
      if (e.key === 'Escape') { e.preventDefault(); stopEditing(); }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); stopEditing(); }
    });
    document.addEventListener('scroll', function () { if (editing) placeBar(editing); }, true);

    // --- selection pushed in from the editor -------------------------------
    // Applied as a class change rather than a re-render, so selecting a section
    // never reloads the frame and never interrupts an inline edit.
    function applySelected(sel) {
      sections().forEach(function (s) {
        s.classList.toggle('nl-selected', !!sel && id(s) === sel);
      });
    }
    window.addEventListener('message', function (e) {
      var m = e.data;
      if (!m || m.source !== 'nl-editor') return;
      if (m.type === 'setSelected') applySelected(m.id);
    });

    // --- init + height reporting ------------------------------------------
    function init() {
      sections().forEach(decorate);
      applySelected(document.documentElement.getAttribute('data-nl-selected'));
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
