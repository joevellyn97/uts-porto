(function () {
  var CONFIG = { name: "Amel", role: "College Student" };
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* nama dan jabatan */
  $$("[data-name]").forEach(function (el) {
    el.textContent = CONFIG.name;
  });
  $$("[data-role]").forEach(function (el) {
    el.textContent = CONFIG.role;
  });

  /* intro cuma sekali per sesi */
  if ($("#loader")) {
    try {
      sessionStorage.setItem("berkas-intro", "1");
    } catch (e) {}
  }

  /* jam */
  var clock = $("#clock");
  function tick() {
    try {
      clock.textContent = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {}
  }
  tick();
  setInterval(tick, 20000);

  /* tema terang / gelap */
  var root = document.documentElement;
  $("#theme").addEventListener("click", function () {
    var dark =
      root.getAttribute("data-theme") === "dark" ||
      (!root.getAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    var next = dark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("berkas-theme", next);
    } catch (e) {}
  });

  /* sidebar about.html (bisa dibuka langsung lewat about.html#skills) */
  var sideBtns = $$(".side-btn");
  var panes = $$(".pane");
  function showPane(id) {
    if (
      !panes.some(function (p) {
        return p.dataset.pane === id;
      })
    )
      id = panes[0].dataset.pane;
    sideBtns.forEach(function (b) {
      b.setAttribute("aria-current", b.dataset.pane === id ? "true" : "false");
    });
    panes.forEach(function (p) {
      p.hidden = p.dataset.pane !== id;
    });
  }
  if (panes.length) {
    sideBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        showPane(b.dataset.pane);
        try {
          history.replaceState(null, "", "#" + b.dataset.pane);
        } catch (e) {}
      });
    });
    showPane((location.hash || "").replace("#", ""));
  }

  /* tombol salin (kontak) */
  $$(".copy").forEach(function (btn) {
    var label = btn.textContent;
    var src = document.getElementById(btn.dataset.target);
    function done() {
      btn.textContent = "Tersalin";
      setTimeout(function () {
        btn.textContent = label;
      }, 1400);
    }
    function fallback() {
      try {
        var r = document.createRange();
        r.selectNodeContents(src);
        var s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
        btn.textContent = "Tekan salin";
        setTimeout(function () {
          btn.textContent = label;
        }, 1800);
      } catch (e) {}
    }
    btn.addEventListener("click", function () {
      try {
        navigator.clipboard.writeText(src.textContent).then(done, fallback);
      } catch (e) {
        fallback();
      }
    });
  });

  /* pemutar musik dari file mp3 */
  var tracks = [
    { n: "My Sweetie", src: "audio/my_sweetie.mp3" },
    { n: "Love Options", src: "audio/love_options.mp3" },
    { n: "Standing Next to You", src: "audio/standing_next_to_you.mp3" },
  ];
  var ti = 0,
    step = 0,
    playing = false;
  try {
    var saved = parseInt(sessionStorage.getItem("berkas-track"), 10);
    if (saved >= 0 && saved < tracks.length) ti = saved;
  } catch (e) {}

  var deck = $("#deck"),
    nameEl = $("#track-name"),
    playBtn = $("#play");
  var dotsEl = $("#dots"),
    DOTS = 22;
  var audio = new Audio();
  audio.preload = "none";
  audio.src = tracks[ti].src;
  nameEl.textContent = tracks[ti].n;
  for (var d = 0; d < DOTS; d++)
    dotsEl.appendChild(document.createElement("i"));
  var dotNodes = $$("i", dotsEl);

  function paintDots() {
    dotNodes.forEach(function (n, i) {
      n.className = i === step % DOTS ? "on" : "";
    });
  }
  function playAudio() {
    var p = audio.play();
    if (p && p.catch)
      p.catch(function () {
        setPlaying(false);
      });
  }
  function setPlaying(on) {
    playing = on;
    deck.classList.toggle("playing", on);
    playBtn.setAttribute("aria-pressed", on ? "true" : "false");
    playBtn.setAttribute("aria-label", on ? "Jeda musik" : "Putar musik");
    $("#ico-play").hidden = on;
    $("#ico-pause").hidden = !on;
    if (on) playAudio();
    else audio.pause();
  }
  function go(delta) {
    ti = (ti + delta + tracks.length) % tracks.length;
    step = 0;
    nameEl.textContent = tracks[ti].n;
    paintDots();
    audio.src = tracks[ti].src;
    try {
      sessionStorage.setItem("berkas-track", String(ti));
    } catch (e) {}
    if (playing) playAudio();
  }

  /* titik progress mengikuti posisi lagu, lagu berikutnya jalan otomatis */
  audio.addEventListener("timeupdate", function () {
    if (audio.duration) {
      step = Math.floor((audio.currentTime / audio.duration) * DOTS);
      paintDots();
    }
  });
  audio.addEventListener("ended", function () {
    go(1);
  });

  playBtn.addEventListener("click", function () {
    setPlaying(!playing);
  });
  $("#prev").addEventListener("click", function () {
    go(-1);
  });
  $("#next").addEventListener("click", function () {
    go(1);
  });
  paintDots();
})();
