$(function () {
	$('#option_dropdown').dropdown({
		arrow: '<b></b>',
		onChange: function (obj) {
			if (obj.attr('href') !== '#') {
				window.location.href = obj.attr('href');
			}
		}
	});
});

$(function () {
	var $tabs = $('#product_tabs');

	$tabs.on('click', 'a', function (e) {
		e.preventDefault();

		if (!$(this).hasClass('active')) {
			$(this)
				.closest('ul').find('.active').removeClass('active')
				.end().end()
				.addClass('active');

			if ($(this).data('target') == '') {
				$('.product_tab').removeClass('hidden');
				$('#product_delivery').addClass('hidden');
			} else {
				$('.product_tab').addClass('hidden');
				$('#' + $(this).data('target')).removeClass('hidden');
			}
		}
	});

	$('#delivery_details').on('click', function (e) {
		e.preventDefault();

		$tabs.find('.active').removeClass('active');
		$('[data-target="product_delivery"]').addClass('active');

		$('.product_tab').addClass('hidden');
		$('#product_delivery').removeClass('hidden');
		$(document).scrollTop($tabs.offset()['top']);
	});
});

$(function () {
	var $images_slider = $('.small_photos');

	if ($images_slider.length > 0) {
		$images_slider.slick({
			infinite: true,
			slidesToShow: 5,
			slidesToScroll: 1,
			vertical: $images_slider.hasClass('vertical')
		});
	}
});

$(function () {
	jQuery.fn.photo_gallery = function (options) {
		return this.each(function () {
			var settings = $.extend({
					group: '',
					price: 0,
					product_id: 0
				}, options),
				$this = $(this),
				$zoom,
				urls = [];

			$('body').append('<div id="zoom_window_' + settings.group + '" class="zoom_window"><a href="#" class="sf_close"></a><div class="zoom_top"></div><div class="fm for_zoom"><div class="fm zoom_place"></div></div><div class="zoom_price"><div class="zp_centre"></div></div>');
			$zoom = $('#zoom_window_' + settings.group);

			if (!$zoom.hasClass('init')) {
				$zoom.addClass('init');

				$zoom.on('click', '.sf_close', function (e) {
					e.preventDefault();

					$black.hide();
					$zoom.hide();
				});

				var thumbs = '',
					images = '',
					url = '';

				$this.find('.gallery-item').map(function () {
					url = $(this).attr('href');

					if ($.inArray(url, urls) === -1) {
						thumbs += '<a href="#"><span><img src="' + $(this).find('img').attr('src') + '" alt=""></span></a>';
						images += '<div><img src="' + $(this).attr('href') + '" alt=""></div>';

						urls.push(url);
					}
				});

				$zoom.find('.zoom_top').html(thumbs);
				$zoom.find('.zoom_place').html(images);

				$zoom.find('.zoom_top')
					.slick({
						slidesToShow: 5,
						slidesToScroll: 1,
						asNavFor: $zoom.find('.zoom_place'),
						dots: false,
						centerMode: false,
						focusOnSelect: true
					})
					.on('click', 'a', function (e) {
						e.preventDefault();
					});

				$zoom.find('.zoom_place').slick({
					slidesToShow: 1,
					slidesToScroll: 1,
					arrows: true,
					asNavFor: $zoom.find('.zoom_top')
				});
			}

			$this.find('.gallery-item').on('click', function (e) {
				e.preventDefault();

				var url = $(this).attr('href'),
					index = 0;

				urls.find(function (_url, key) {
					if (url === _url) {
						index = key;
					}

					return false;
				});

				$('.cart_window').hide();

				$black.show();
				$zoom.css('top', $(document).scrollTop() + 20).show();

				$zoom.find('.zoom_top').slick('refresh');
				$zoom.find('.zoom_top').slick('slickGoTo', index, false);

				$zoom.find('.zoom_place').slick('refresh');
				$zoom.find('.zoom_place').slick('slickGoTo', index, false);
			});
		});
	};
});

// Купити в 1 клік

$(function () {
	$('.click_pay_form_open').on('click', function (e) {
		e.preventDefault();
		$(this).closest('.click_pay_form_box').find('.click_pay_form').removeClass('hidden');
	});

	$('.click_pay_form_close').on('click', function (e) {
		e.preventDefault();
		$(this).closest('.click_pay_form').addClass('hidden');
	});

	$('.click_pay_send').on('click', function (e) {
		e.preventDefault();

		var $box = $(this).closest('.click_pay_form_box'),
			$name = $box.find('.click_pay_name'),
			$phone = $box.find('.click_pay_phone'),
			uri = $(this).data('uri'),
			send_message, success_message;

		$name.add($phone).on('keyup paste blur', function () { $(this).removeClass('error'); });

		if (!ruleRegex.test($name.val())) {
			$name.addClass('error');
			return false;
		}

		if (!ruleRegex.test($phone.val())) {
			$phone.addClass('error');
			return false;
		}

		var request = {
				product_id: $box.data('product-id'),
				name: $name.val(),
				phone: $phone.val()
			},
			msg_1 = '',
			msg_2 = '';

		if (LANG == 'ua') msg_1 = 'Відправка';
		if (LANG == 'ru') msg_1 = 'Отправка';
		if (LANG == 'en') msg_1 = 'Sending';

		if (LANG == 'ua') msg_2 = 'Повідомлення надіслано.<br><br>Наш менеджер сконтактується з Вами.';
		if (LANG == 'ru') msg_2 = 'Сообщение отправлено.<br><br>Наш менеджер свяжется с Вами.';
		if (LANG == 'en') msg_2 = 'Message sent.<br><br>Our manager will contact you.';

		send_message = '<div class="fm sending">' + msg_1 + '</div>';
		success_message = msg_2;

		$box.find('.click_pay_form').html('<p class="loader">' + send_message + '</p>');

		$.post(
			full_url('cart/click_pay'),
			request,
			function (response) {
				if (response.success) {
					if (uri !== undefined) {
						var f_uri = window.location.href.split('#')[0];
						window.location.href = f_uri + '#' + uri;
						window.location.reload(true);
					} else {
						$box.html('<p class="success">' + success_message + '</p>');
						setTimeout(function () { $box.remove(); }, 2000);
					}
				}
			},
			'json'
		);

		return true;
	});
});

/*$(function () {
	var $slider = $('.catalog_slider'),
		length = $slider.find('.one_good').length,
		width = $slider.find('.one_good').eq(1).outerWidth(true),
		index = 0;

	if (length > 4) {
		$slider.find('.catalog_slider_inner').css('width', length * width);

		$slider.find('.prev').on('click', function (e) {
			e.preventDefault();

			index--;

			if (index == 0) $(this).addClass('hidden');
			$slider.find('.next').removeClass('hidden');

			$slider.find('.catalog_slider_inner').stop().animate({'left': -Math.abs(index * width)}, 200);
		});

		$slider.find('.next').on('click', function (e) {
			e.preventDefault();

			index++;

			if (index + 3 == length - 1) $(this).addClass('hidden');
			$slider.find('.prev').removeClass('hidden');
			$slider.find('.catalog_slider_inner').stop().animate({'left': -Math.abs(index * width)}, 200);
		});
	} else {
		$slider.find('.next').addClass('hidden');
	}
});*/

$(function () {
	var $timer = $('.goods_timer');

	if ($timer.length > 0) {
		$timer
			.countdown($timer.data('date'))
			.on('update.countdown', function (e) {
				$timer.find('.ctd').text((e.offset.totalDays.toString().length !== 2 ? '0' : '') + e.offset.totalDays);
				$timer.find('.cth').text((e.offset.hours.toString().length !== 2 ? '0' : '') + e.offset.hours);
				$timer.find('.ctm').text((e.offset.minutes.toString().length !== 2 ? '0' : '') + e.offset.minutes);
				$timer.find('.cts').text((e.offset.seconds.toString().length !== 2 ? '0' : '') + e.offset.seconds);
			});
	}
});

/*
$(function () {
	var $slider = $('.sect_sales'),
		length = $slider.find('.sale_item').length,
		width = $slider.find('.sale_item').eq(1).outerWidth(true),
		index = 0;

	if (length > 5) {
		$slider.find('.slider_width').css('width', length * width);

		$slider.find('.prev').on('click', function (e) {
			e.preventDefault();

			index--;

			if (index == 0) $(this).addClass('hidden');
			$slider.find('.next').removeClass('hidden');

			$slider.find('.slider_width').stop().animate({'left': -Math.abs(index * width)}, 200);
		});

		$slider.find('.next').removeClass('hidden').on('click', function (e) {
			e.preventDefault();

			index++;

			if (index + 4 == length - 1) $(this).addClass('hidden');
			$slider.find('.prev').removeClass('hidden');
			$slider.find('.slider_width').stop().animate({'left': -Math.abs(index * width)}, 200);
		});
	} else {
		$slider.find('.next').addClass('hidden');
	}
});*/
