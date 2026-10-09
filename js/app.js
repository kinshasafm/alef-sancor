(function () {
  'use strict';

  const stage = document.getElementById('stage');
  const stageImg = document.getElementById('stage-img');
  const markersEl = document.getElementById('markers');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalVideo = document.getElementById('modal-video');
  const modalClose = document.getElementById('modal-close');

  let videos = [];
  const markers = [];

  // El poster se deriva del archivo: videos/nombre.mp4 -> img/posters/nombre.jpg
  function posterFor(archivo) {
    const base = archivo.split('/').pop().replace(/\.[^.]+$/, '');
    return 'img/posters/' + base + '.jpg';
  }

  function placeMarker(btn, v) {
    btn.style.left = v.x + '%';
    btn.style.top = v.y + '%';
    btn.classList.toggle('tip-below', v.y < 12);
    btn.classList.toggle('tip-left', v.x > 85);
    btn.classList.toggle('tip-right', v.x < 15);
  }

  function renderMarkers() {
    markersEl.textContent = '';
    videos.forEach((v) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'marker';
      btn.dataset.title = v.titulo;
      btn.setAttribute('aria-label', v.titulo);

      const logo = document.createElement('img');
      logo.src = 'img/marker-sancor.png';
      logo.alt = '';
      logo.draggable = false;
      btn.appendChild(logo);

      placeMarker(btn, v);
      btn.addEventListener('click', () => {
        // El editor marca las marcas recién arrastradas para no abrir el video
        if (btn.dataset.dragged === '1') { btn.dataset.dragged = ''; return; }
        openVideo(v);
      });
      markersEl.appendChild(btn);
      markers.push({ btn, v });
    });
  }

  // ---------- Modal ----------
  function openVideo(v) {
    modalTitle.textContent = v.titulo;
    modalVideo.poster = posterFor(v.archivo);
    modalVideo.src = v.archivo;
    modal.showModal();
    const p = modalVideo.play();
    if (p && p.catch) p.catch(() => {});
  }

  modalClose.addEventListener('click', () => modal.close());

  // Clic fuera de la caja (sobre el backdrop) cierra
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });

  // Escape lo maneja <dialog> de forma nativa; en todos los casos se pausa y se libera el video
  modal.addEventListener('close', () => {
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
  });

  // ---------- Modo edición ----------
  // Solo en la máquina local: los archivos de editor/ no se publican (.gitignore)
  function maybeLoadEditor() {
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    if (!local || new URLSearchParams(location.search).get('edit') !== '1') return;

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'editor/edit.css';
    document.head.appendChild(css);

    const js = document.createElement('script');
    js.src = 'editor/edit.js';
    js.onload = () => window.initEditor({ videos, markers, stage, stageImg, markersEl, placeMarker });
    document.body.appendChild(js);
  }

  // ---------- Inicio ----------
  fetch('data/videos.json', { cache: 'no-cache' })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((data) => {
      videos = data;
      renderMarkers();
      maybeLoadEditor();
    })
    .catch((err) => {
      console.error('Error cargando data/videos.json', err);
      document.getElementById('load-error').hidden = false;
    });
})();
