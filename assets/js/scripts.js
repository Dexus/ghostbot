jQuery(function($) {

  /* ============================================================ */
  /* Syntax Highlighting */
  /* ============================================================ */
  hljs.initHighlightingOnLoad();

  /* ============================================================ */
  /* Responsive Videos */
  /* ============================================================ */

  $(".post-content").fitVids();

  /* ============================================================ */
  /* Scroll To Top */
  /* ============================================================ */

  $('.js-jump-top').on('click', function(e) {
    e.preventDefault();

    $('html, body').animate({
      'scrollTop': 0
    });
  });

  /* ============================================================ */
  /* Ajax Loading */
  /* ============================================================ */

  var History = window.History;
  var loading = false;
  var showIndex = false;
  var $ajaxContainer = $('#ajax-container');
  var $postIndex = $('#post-index');
  var $topNav = $('#top-nav');
  var $pageVisited = $('#page-visited');
  var seq = 0;

  // Check if history is enabled for the browser
  if (!History.enabled) {
    return false;
  }

  History.Adapter.bind(window, 'statechange', function(e) {
    var State = History.getState();

    // Get the requested url and replace the current content
    // with the loaded content
    $.get(State.url, function(result) {
      var $html = $(result);
      var $newContent = $('#ajax-container', $html).contents();
      var $newTopNav = $('#top-nav', $html).contents();

      // Set the title to the requested urls document title
      document.title = $html.filter('title').text();
        
      if (seq == State.data.seq) {
        $('html, body').animate({
          'scrollTop': 0
        });
      } else {
        // should keep original postition when pressing back button
        if (State.data.seq)
          seq = State.data.seq;
        else 
          seq = 0;
      }

      $ajaxContainer.add($topNav).fadeOut(500, function() {
        
        // Re run fitvid.js
        $newContent.fitVids();
        $newContent.find('pre code').each(function(i, block) {
          hljs.highlightBlock(block);
        });

        $topNav.html($newTopNav);
        $ajaxContainer.html($newContent);
        $ajaxContainer.add($topNav).fadeIn(500);

        NProgress.done();

        loading = false;
        showIndex = false;
      });
    }).fail(function() {
      // Request fail
      NProgress.done();
      location.reload();
    });
  });

  $('body').on('click', '.js-ajax-link, .pagination a, .post-tags a, .post-header a', function(e) {
    e.preventDefault();

    if (loading === false) {
      var currentState = History.getState();
      var url = $(this).attr('href');
      var title = $(this).attr('title') || null;

      //if url starts with http:// and currentState.url starts with
      // https://, replace the protocol in url
      if (url.indexOf("http://", 0) === 0) {
        var urlNoProt = url.replace(/.*?:\/\//g, "");
        var curProt = currentState.url.split("/")[0];
        url = curProt + "//" + urlNoProt;
      }

      // If the requested url is not the current states url push
      // the new state and make the ajax call.
      if (url !== currentState.url.replace(/\/$/, "")) {
        loading = true;

        // Check if we need to show the post index after we've
        // loaded the new content
        if ($(this).hasClass('js-show-index') || $(this).parent('.pagination').length > 0) {
          showIndex = true;
        }

        NProgress.start();

        History.pushState({seq: ++seq}, title, url);
        $pageVisited.val('1');
      }
    }
  });

});
