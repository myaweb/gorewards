document.addEventListener('DOMContentLoaded', function () {

  // ── MOBILE NAV TOGGLE ──────────────────────────────────────────────────
  var toggle = document.querySelector('.nav-toggle')
  var nav    = document.querySelector('.nav-links')
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open')
      toggle.setAttribute('aria-expanded', open)
    })
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open')
        toggle.setAttribute('aria-expanded', 'false')
      }
    })
  }

  // ── READING PROGRESS BAR ───────────────────────────────────────────────
  var bar = document.getElementById('progress-bar')
  if (bar) {
    function updateProgress() {
      var h   = document.documentElement
      var pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100
      bar.style.width = Math.min(pct, 100) + '%'
    }
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
  }

  // ── AUTO TABLE OF CONTENTS ─────────────────────────────────────────────
  var article = document.querySelector('.article-body')
  var tocList  = document.getElementById('toc')
  var tocWidget = document.getElementById('toc-widget')
  if (article && tocList) {
    var headings = article.querySelectorAll('h2, h3')
    if (headings.length > 2) {
      headings.forEach(function (h, i) {
        if (!h.id) h.id = 'heading-' + i
        var li = document.createElement('li')
        var a  = document.createElement('a')
        a.href      = '#' + h.id
        a.className = 'toc-link' + (h.tagName === 'H3' ? ' toc-h3' : '')
        a.textContent = h.textContent
        li.appendChild(a)
        tocList.appendChild(li)
      })
      if (tocWidget) tocWidget.style.display = 'block'

      // Active state on scroll
      var tocLinks = tocList.querySelectorAll('.toc-link')
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute('id')
            tocLinks.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id)
            })
          }
        })
      }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 })
      headings.forEach(function (h) { observer.observe(h) })
    }
  }

  // ── SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'))
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  })

})

// ── SHARE FUNCTIONS ────────────────────────────────────────────────────
function shareX() {
  var text = encodeURIComponent(document.title)
  var url  = encodeURIComponent(window.location.href)
  window.open('https://twitter.com/intent/tweet?text=' + text + '&url=' + url, '_blank', 'width=550,height=420')
}

function shareFacebook() {
  var url = encodeURIComponent(window.location.href)
  window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank', 'width=580,height=400')
}

function copyLink() {
  var btn   = document.getElementById('copy-btn')
  var label = document.getElementById('copy-label')
  navigator.clipboard.writeText(window.location.href).then(function () {
    if (btn)   btn.classList.add('copied')
    if (label) label.textContent = 'Copied!'
    setTimeout(function () {
      if (btn)   btn.classList.remove('copied')
      if (label) label.textContent = 'Copy Link'
    }, 2000)
  }).catch(function () {
    var ta = document.createElement('textarea')
    ta.value = window.location.href
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}
