(function ($) {
  "use strict";

  var $modalLead = $("#modal-lead");
  var $modalContacts = $("#modal-contacts");
  var $form = $("#lead-form");
  var $status = $("#lead-status");
  var $phone = $("#lead-phone");
  var modelsSwiper = null;
  var lastFocused = null;
  var $header = $(".header");
  var $burger = $(".header__burger");
  var $navBackdrop = $(".header__nav-backdrop");
  var savedScrollY = 0;
  var phonePrefix = "+7 (";

  function formatRuPhone(value) {
    var digits = String(value || "").replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    if (digits.charAt(0) === "8") {
      digits = "7" + digits.slice(1);
    } else if (digits.charAt(0) !== "7") {
      digits = "7" + digits;
    }

    digits = digits.slice(0, 11);
    var national = digits.slice(1);
    var formatted = "+7";

    if (!national.length) {
      return formatted;
    }

    formatted += " (" + national.slice(0, 3);

    if (national.length < 3) {
      return formatted;
    }

    formatted += ") " + national.slice(3, 6);

    if (national.length < 6) {
      return formatted;
    }

    formatted += "-" + national.slice(6, 8);

    if (national.length < 8) {
      return formatted;
    }

    formatted += "-" + national.slice(8, 10);
    return formatted;
  }

  function getPhoneDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function setPhoneCaretToEnd() {
    var input = $phone[0];

    if (!input || typeof input.setSelectionRange !== "function") {
      return;
    }

    var len = input.value.length;
    input.setSelectionRange(len, len);
  }

  function applyPhoneMask(value) {
    var formatted = formatRuPhone(value);
    $phone.val(formatted);
    setPhoneCaretToEnd();
    return formatted;
  }

  function initPhoneMask() {
    $phone.on("focus", function () {
      if (!getPhoneDigits($phone.val()).length) {
        $phone.val(phonePrefix);
        setPhoneCaretToEnd();
      }
    });

    $phone.on("blur", function () {
      if (getPhoneDigits($phone.val()).length <= 1) {
        $phone.val("");
      }
    });

    $phone.on("input", function () {
      applyPhoneMask($phone.val());
    });

    $phone.on("keydown", function (e) {
      if (e.key !== "Backspace") {
        return;
      }

      if ($phone.val() === phonePrefix) {
        e.preventDefault();
        $phone.val("");
      }
    });

    $phone.on("paste", function () {
      window.setTimeout(function () {
        applyPhoneMask($phone.val());
      }, 0);
    });
  }

  function openModal($modal) {
    lastFocused = document.activeElement;
    $modal.addClass("is-open").attr("aria-hidden", "false");
    $("body").addClass("modal-open");
    window.setTimeout(function () {
      if ($modal.is($modalLead)) {
        if (!getPhoneDigits($phone.val()).length) {
          $phone.val(phonePrefix);
        }
        $phone.trigger("focus");
        setPhoneCaretToEnd();
        return;
      }
      var $focusTarget = $modal.find("a, button").filter(":visible").first();
      if ($focusTarget.length) {
        $focusTarget.trigger("focus");
      }
    }, 0);
  }

  function closeModal($modal) {
    $modal.removeClass("is-open").attr("aria-hidden", "true");
    if (!$modalLead.hasClass("is-open") && !$modalContacts.hasClass("is-open")) {
      $("body").removeClass("modal-open");
    }
    if ($modal.is($modalLead)) {
      $status.text("").removeClass("is-error is-success");
      $phone.removeClass("is-invalid");
    }
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  }

  function closeAllModals() {
    closeModal($modalLead);
    closeModal($modalContacts);
    $("body").removeClass("modal-open");
  }

  $(document).on("click", "[data-modal-open]", function (e) {
    e.preventDefault();
    openModal($modalLead);
  });

  $(document).on("click", "[data-contacts-open]", function (e) {
    e.preventDefault();
    if (window.innerWidth < 1200) {
      closeNav();
    }
    openModal($modalContacts);
  });

  $(document).on("click", "[data-modal-close]", function () {
    var $openModal = $(".modal.is-open");
    if ($openModal.length) {
      closeModal($openModal);
    }
  });

  function closeNav() {
    $header.removeClass("is-nav-open");
    $burger.attr("aria-expanded", "false");
    $("body").removeClass("nav-open");
    $navBackdrop.attr("aria-hidden", "true");
  }

  function openNav() {
    $header.addClass("is-nav-open");
    $burger.attr("aria-expanded", "true");
    $("body").addClass("nav-open");
    $navBackdrop.attr("aria-hidden", "false");
  }

  function initBurger() {
    $burger.on("click", function () {
      if ($header.hasClass("is-nav-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    $(document).on("click", "[data-nav-close]", function () {
      closeNav();
    });

    $(".header__nav a").on("click", function () {
      if (window.innerWidth < 1200) {
        closeNav();
      }
    });
  }

  $(document).on("keydown", function (e) {
    if (e.key !== "Escape") {
      return;
    }
    if ($modalLead.hasClass("is-open") || $modalContacts.hasClass("is-open")) {
      closeAllModals();
      return;
    }
    if ($header.hasClass("is-nav-open")) {
      closeNav();
    }
  });

  function initColorSwatches() {
    $(document).on("click", ".card__swatch[data-car-image]", function () {
      var $swatch = $(this);
      var $card = $swatch.closest(".card");
      var $photo = $card.find(".card__photo").first();
      var src = $swatch.attr("data-car-image");

      if (!src || !$photo.length) {
        return;
      }

      $swatch
        .closest(".card__swatches")
        .find(".card__swatch")
        .removeClass("card__swatch--active");
      $swatch.addClass("card__swatch--active");
      $photo.attr("src", src);
    });
  }

  function lockScrollPosition() {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
  }

  function restoreScrollPosition() {
    window.scrollTo(0, savedScrollY);
  }

  function initSwiper() {
    if (modelsSwiper) {
      modelsSwiper.destroy(true, true);
      modelsSwiper = null;
    }

    if (window.innerWidth < 1200) {
      modelsSwiper = new Swiper(".models-swiper", {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: false,
        rewind: true,
        speed: 450,
        resistanceRatio: 0.65,
        touchReleaseOnEdges: true,
        preventInteractionOnTransition: true,
        watchOverflow: true,
        pagination: {
          el: ".models-swiper__pagination",
          clickable: true,
        },
        on: {
          touchStart: lockScrollPosition,
          slideChangeTransitionStart: lockScrollPosition,
          slideChangeTransitionEnd: restoreScrollPosition,
          transitionEnd: restoreScrollPosition,
        },
      });
    }
  }

  function onResize() {
    if (window.innerWidth >= 1200) {
      closeNav();
    }
    initSwiper();
  }

  $form.on("submit", function (e) {
    e.preventDefault();
    var digits = getPhoneDigits($phone.val());

    if (digits.length !== 11 || digits.charAt(0) !== "7") {
      $phone.addClass("is-invalid");
      $status.addClass("is-error").removeClass("is-success").text("Введите корректный номер телефона.");
      $phone.trigger("focus");
      return;
    }

    $phone.removeClass("is-invalid");
    $status.removeClass("is-error").addClass("is-success").text("Отправляем…");

    window.setTimeout(function () {
      $status.removeClass("is-error").addClass("is-success").text("Спасибо! Мы свяжемся с вами в ближайшее время.");
      $form[0].reset();
      window.setTimeout(function () {
        closeModal($modalLead);
      }, 400);
    }, 600);
  });

  initColorSwatches();
  initPhoneMask();
  initBurger();
  initSwiper();
  window.addEventListener("resize", onResize);
})(jQuery);
