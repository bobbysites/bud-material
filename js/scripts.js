var LANG, DEF_LANG, _LANG = {}, BASE_URL, $black, limit_dealer = 0, limit_wholesale = 0, price_type = false,
	emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,6}$/i,
	ruleRegex = /^(.+)$/;

function get_lang(key) {
	return _LANG[key] !== undefined ? _LANG[key] : key + ' TRANSLATE!';
}

jQuery.fn.placeholder = function (label) {
	return this.each(function () {

		if ($.trim($(this).val()) === '') {
			$(this).val(label);
		} else {
			$(this).attr('title', label);
		}

		$(this)
			.on('click focus', function () {
				if ($.trim($(this).val()) === label) {
					$(this).val('').attr('title', label);
				}
			})
			.on('keyup', function () {
				$(this).removeClass('error');
			})
			.on('blur', function () {
				if ($.trim($(this).val()) === '') {
					$(this).val(label).removeAttr('title');
				} else {
					$(this).attr('title', label);
					$(this).removeClass('error');
				}
			});
	});
};

jQuery.fn.dropdown = function (options) {

	var settings = $.extend({
		arrow: '',
		prevent: true,
		onChange: ''
	}, options);

	return this.each(function () {
		var $this = $(this);

		if ($this.find('.selected').length > 0) $this.find('span:eq(0)').html($this.find('.selected').text() + settings.arrow).end().find('input').val($this.find('.selected a').data('value')).end().find('.selected').closest('li').hide();

		$this.on('click', 'span:eq(0)', function (e) {
			e.preventDefault();
			if (!$(this).closest('.dropdown').hasClass('dropdown-open')) {
				$.when($('.dropdown').each(function () { $(this).removeClass('dropdown-open').find('ul:eq(0)').slideUp(); })).then(function () {$this.addClass('dropdown-open').find('ul:eq(0)').slideDown();});
			} else {
				$this.removeClass('dropdown-open').find('ul:eq(0)').slideUp();
			}
		});

		$this.find('ul').eq(0).on('click', 'a', function (e) {
			e.preventDefault();

			if (!$(this).hasClass('disabled')) {
				if (settings.prevent === false) {
					window.location.href = $(this).attr('href');
				} else {
					$(this).closest('ul').find('.selected').removeClass('selected').show().end().end().closest('li').addClass('selected').hide();
					$this.find('span:eq(0)').html($(this).text() + settings.arrow).end().find('input').val($(this).data('value'));

					$this.removeClass('dropdown-open').find('ul:eq(0)').slideUp();
					if ($.isFunction(settings.onChange)) settings.onChange($(this));
				}
			}
		});
	});
};

jQuery.fn.filter_dropdown = function (options) {

	var settings = $.extend({
		onChange: ''
	}, options);

	return this.each(function () {
		var $this = $(this);

		if ($this.hasClass('dropdown-open')) {
			$this.addClass('dropdown-open').find('ul').eq(0).stop().slideDown();
		}

		$this.find('span').eq(0).on('click', function (e) {
			e.preventDefault();

			if ($this.hasClass('dropdown-open')) {
				$this.removeClass('dropdown-open').find('ul').eq(0).stop().slideUp();
			} else {
				$this.addClass('dropdown-open').find('ul').eq(0).stop().slideDown();
			}
		});

		$this.find('ul').eq(0).on('click', 'a', function (e) {
			e.preventDefault();

			if (!$(this).hasClass('filter-disabled')) {
				$(this).hasClass('filter-selected') ? $(this).removeClass('filter-selected') : $(this).addClass('filter-selected');
				if ($.isFunction(settings.onChange)) settings.onChange($(this));
			}
		});
	});
};

function setcookie(name, value, expires, path, domain, secure) {
	expires instanceof Date ? expires = expires.toGMTString() : typeof(expires) === 'number' && (expires = (new Date(+(new Date) + expires * 1e3)).toGMTString());
	var r = [name + "=" + value], s, i;
	for(i in s = {expires: expires, path: path, domain: domain}) s[i] && r.push(i + "=" + s[i]);
	return secure && r.push("secure"), document.cookie = r.join(";"), true;
}

function full_url(uri) {
	return window.location.protocol + '//' + window.location.hostname + (LANG === DEF_LANG ? '' : '/' + LANG) + '/' + (uri !== '' ? uri + '/' : '');
}

function base_url(uri) {
	return window.location.protocol + '//' + window.location.hostname + '/' + uri;
}

function roundPlus(x, n) {
	if (isNaN(x) || isNaN(n)) return false;
	var m = Math.pow(10,n);
	return Math.round(x*m)/m;
}

function mini_cart(data) {
	var cart_content = '';

	if (data[0] > 0) {
		var last_products = '';

		for (var i = 0; i < data[2].length; i++) {
			last_products += '<div class="fm mw_one"><div class="fm mw_photo"><div><a href="' + data[2][i]['url'] + '">' + (data[2][i]['image'] != '' ? '<img src="' + data[2][i]['image'] + '" alt="">' : '') + '</a></div></div><div class="fm mw_name"><div><a href="' + data[2][i]['url'] + '">' + data[2][i]['title'] + (data[2][i]['option'] !== '' ? '<br>' + data[2][i]['option'] : '') + '</a></div><div class="fm mw_price">' + data[2][i]['price'] + ' ' + get_lang('грн') + '</div></div></div>';
		}

		cart_content = '<div class="mc_window"><div class="fm sf_title">' + get_lang('Ваші останні товари') + '</div><div class="fm mw_all">' + last_products + '</div><div class="fm mw_total">' + get_lang('Сума') + ': <b>' + data[1] + ' ' + get_lang('грн') + '</b></div><div class="long_div"><a href="#" class="fm common_but show_cart_form"><b></b><span>' + get_lang('Дивитись кошик') + '</span></a></div></div><a href="#" class="fm mc_with_items show_cart_form"><span>' + data[0] + '</span></a>';
	} else {
		cart_content = '<span class="mc_empty"></span>';
	}

	$('#mini_cart').html(cart_content);
}

$(function () {
	$('.catalog_slider_inner').slick({
		slidesToShow: 4,
		slidesToScroll: 2,
		responsive: [
			{
				breakpoint: 1000,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 640,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}
		]
	});

	$('.slider_width').slick({
		slidesToShow: 6,
		slidesToScroll: 2,
		responsive: [
			{
				breakpoint: 1200,
				settings: {
					slidesToShow: 5,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 1000,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 640,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}
		]
	});

	$('.ring').animate({opacity: 0}, 500, function () {
		$(this).remove();
	});

	//--------------------------------------------------------------------------------------------------------------------------------------

	$('.print_icon').on('click', function () {
		window.open(full_url('printing/index') + '?module=' + $(this).data('module') + '&id=' + $(this).data('id'), '', 'width=800,height=600,scrollbars=yes,status=no,resizable=yes,screenx=0,screeny=0');
	});

	//--------------------------------------------------------------------------------------------------------------------------------------

	$(document).on('click', function (e) {
		if ($(e.target).hasClass('dropdown') || $(e.target).closest('.dropdown').length > 0) return false;
		$('.dropdown').map(function () {
			if ($(this).find('.dropdown_wrapper').length > 0) {
				$(this).removeClass('dropdown-open').find('.dropdown_wrapper').eq(0).stop().slideUp();
			} else {
				$(this).removeClass('dropdown-open').find('ul').eq(0).stop().slideUp();
			}
		});
		return true;
	});

	//--------------------------------------------------------------------------------------------------------------------------------------

	var $page_up = $('.page_up');

	$(window).on('scroll', function () {
		if ($(document).scrollTop() > 0) {
			$page_up.removeClass('hidden');
		} else {
			$page_up.addClass('hidden');
		}
	});

	$page_up.on('click', function (e) {
		e.preventDefault();

		$('html, body').animate({ scrollTop: 0});
	});

	//--------------------------------------------------------------------------------------------------------------------------------------

	$black = $('<div/>', {class: 'black'}).fadeTo(20, 0.75).hide();
	$('body').append($black);

	$black.on('click', function () {
		$('#cart').add('.zoom_window').add($black).hide();
	});

	//--------------------------------------------------------------------------------------------------------------------------------------

	$('#search_form')
		.on('submit', function (e) {
			var query = $.trim($(this).find('[type="text"]').val());

			if (query === '' && query === get_lang('Пошук')) {
				e.preventDefault();
			}
		})
		.find('[type="text"]').placeholder(get_lang('Пошук'))
		.end()
		.find('a').on('click', function (e) {
			e.preventDefault();
			$(this).closest('form').trigger('submit');
		});

	//--------------------------------------------------------------------------------------------------------------------------------------

	var m_timeout,
		left_shift,
		m_time = 300,
		$main_menu = $('.for_main_menu');

	if ($main_menu.find('ul').length > 0) {
		$main_menu.find('.for_evry_drop').each(function () {

			$(this).show();

			var cols = $(this).find('.one_col').length,
				cols_map = [],
				height = 0,
				max_height = 0,
				width = 0,
				one_level = true;

			$(this).find('.one_col').each(function (i) {

				height = $(this).outerHeight();
				if (height > max_height) max_height = height;

				cols_map.push($(this).index());

				if ((i % 5 === 4 || (i + 1) === cols) && cols_map.length > 0) {
					for (var n = 0, total = cols_map.length; n < total; n++) {
						$(this).closest('.for_evry_drop').find('.one_col').eq(cols_map[n]).css('height', max_height);
					}

					$(this).closest('.for_evry_drop').find('.one_col').eq(cols_map[0]).css({'clear': 'both', 'margin-left': 0});

					max_height = 0;
					cols_map = [];
				}

				if ($(this).find('li').length > 1) one_level = false;
			});

			if (one_level) {
				//$(this).css('padding-left', '35px');

				$(this).find('a').css('width', '100%').css('height', 'auto');
				$(this).find('.one_col').css('clear', 'both').css('margin', 0).css('height', 'auto');

				//$(this).css('left', 0).css('width', 'auto').addClass('for_evry_simple_drop');
				//$(this).css('left', 0).addClass('for_evry_simple_drop');
			} else {
				// left_shift = parseFloat($(this).closest('ul').offset()['left']) - parseFloat($(this).closest('li').offset()['left']);
				// if (left_shift !== 0) $(this).css('left', -Math.abs(left_shift) + 'px');
			}

			$(this).hide();
		});

		$main_menu.find('.for_evry_simple_drop').map(function () {
			var mp = $main_menu.find('ul').eq(0).offset()['left'] + $main_menu.find('ul').eq(0).outerWidth(true)
				pw = $(this).outerWidth(true),
				pp = $(this).closest('li').position()['left'];

			if (pw + pp > mp) {
				pp = pp - (mp - pw + pp);
			}

			$(this).css('margin-left', pp + 'px');
		});

		$main_menu
			.on('mouseenter', function () { m_time = 0; })
			.on('mouseleave', function () { m_time = 300; })
			.find('ul').eq(0).children()
				.on('mouseenter', function () {
					clearTimeout(m_timeout);
					//$main_menu.find('.nra').removeClass('active');

					var $li = $(this);

					if ($li.find('.for_evry_drop').length > 0) {
						$.when(
							$('.for_evry_drop').hide()
						).then(function () {
							m_timeout = setTimeout(function () {
								if ($li.find('.for_evry_drop').length > 0) {
									$li
										.find('.for_evry_drop').show()
										.end()
										.find('a').eq(0).addClass('active');
								}
							}, m_time);
						});
					} else {
						$li.find('a').eq(0).addClass('active');
					}
				}).on('mouseleave', function () {
					clearTimeout(m_timeout);

					var $li = $(this);

					if (!$li.find('a').eq(0).hasClass('nra')) {
						$li.find('a').eq(0).removeClass('active');
						$main_menu.find('.nra').addClass('active');
					}

					$li.find('.for_evry_drop').hide();
				});

		var $mob_menu = $('<div/>', {'class': 'cd-dropdown-wrapper'});
		$mob_menu.append($('<a/>', {'href': '#', 'class': 'cd-dropdown-trigger'}));


		var $mob_menu_nav = $('<nav/>', {'class': 'cd-dropdown'});
		$mob_menu_nav.append($('<a/>', {'href': '#0', 'class': 'cd-close'}));

		var $mob_ul = $('<ul/>', {'class': 'cd-dropdown-content'});

		$main_menu.find('ul').eq(0).children().map(function () {
			var $c_a = $(this).find('a').eq(0),
				$mob_li = $('<li/>');

			$mob_li.append($('<a/>', {'href': $c_a.attr('href'), 'class': $c_a.hasClass('active') ? 'active' : ''}).text($c_a.text()));

			if ($(this).find('.for_evry_drop').length > 0) {
				var $mob_li_ul = $('<ul/>', {'class': 'cd-secondary-dropdown is-hidden'});
				$mob_li_ul.append($('<li/>', {'class': 'go-back'}).append($('<a/>', {'href': '#0'}).text($c_a.text())));

				$(this).find('.ul_one').map(function () {
					var $c__a = $(this).find('a').eq(0),
						$mob_li_ul_li = $('<li/>');

					$mob_li_ul_li.append($('<a/>', {'href': $c__a.attr('href'), 'class': $c__a.hasClass('active') ? 'active' : ''}).text($c__a.text()));

					if ($(this).find('ul').length > 0) {
						var $mob_li_ul_li_ul = $('<ul/>', {'class': 'is-hidden'});
						$mob_li_ul_li_ul.append($('<li/>', {'class': 'go-back'}).append($('<a/>', {'href': '#0'}).text($c__a.text())));

						$(this).find('ul').children().map(function () {
							var $c___a = $(this).find('a').eq(0);
							$mob_li_ul_li_ul.append($('<li/>')).append($('<a/>', {'href': $c___a.attr('href'), 'class': $c___a.hasClass('active') ? 'active' : ''}).text($c___a.text()));
						});

						$mob_li_ul_li.addClass('has-children').append($mob_li_ul_li_ul);
					}

					$mob_li_ul.append($mob_li_ul_li);
				});

				$mob_li.addClass('has-children').append($mob_li_ul);
			}

			$mob_ul.append($mob_li);
		});

		$mob_menu_nav.append($mob_ul);
		$mob_menu.append($mob_menu_nav);

		$mob_menu.insertAfter($main_menu);

		$mob_menu = null;
		$mob_menu_nav = null;
		$mob_ul = null;
	}

	//--------------------------------------------------------------------------------------------------------------------------------------

	if ($('.for_banner').length > 0) {
		$.ajax(
			'/js/components/banner.js',
			{
				dataType: 'script',
				cache: true
			}
		);
	}

	//--------------------------------------------------------------------------------------------------------------------------------------

//	if ($('.brands_place').length > 0) {
//		$.ajax(
//			'/js/components/brands.js',
//			{
//				dataType: 'script',
//				cache: true
//			}
//		);
//	}

	//--------------------------------------------------------------------------------------------------------------------------------------

	var _uri = window.location.href.split('#');

	if (_uri.length > 1) {
		var $an_link = $('[data-uri="' + _uri[1] + '"]');

		if ($an_link.length > 0) {
			var an_type = $an_link.data('box'), an_text = $an_link.data('text');

			$an_link.closest('.' + an_type).removeClass('hidden');
			$('html, body').animate({ scrollTop: $an_link.closest('.' + an_type).offset()['top']});

			$an_link.closest('.form_content').html(an_text === '' ? get_lang('Надіслано') : an_text);
		}
	}

	//--------------------------------------------------------------------------------------------------------------------------------------

	$(document).on('click', '.sale_form_open', function (e) {
		e.preventDefault();
		$(this).closest('.sale_form_box').find('.sale_form').removeClass('hidden');
	});

	$(document).on('click', '.sale_form_close', function (e) {
		e.preventDefault();
		$(this).closest('.sale_form').addClass('hidden');
	});

	$(document).on('click', '.sale_send', function (e) {
		e.preventDefault();

		var $self = $(this),
			$box = $self.closest('.sale_form_box'),
			$name = $box.find('.sale_name'),
			$email = $box.find('.sale_email'),
			$phone = $box.find('.sale_phone'),
			def_label = $self.text(),
			uri = $self.data('uri');

		$name.add($phone).add($email).on('keyup paste blur', function () { $(this).removeClass('error'); });

		if (!ruleRegex.test($name.val())) {
			$name.addClass('error');
			return false;
		}

		if (!ruleRegex.test($phone.val())) {
			$phone.addClass('error');
			return false;
		}

		var request = {
			name: $name.val(),
			phone: $phone.val(),
			email: $email.length > 0 ? $email.val() : ''
		};

		$self.find('span').text(get_lang('Відправка'));

		$.post(
			full_url('feedback/sale'),
			request,
			function (response) {
				if (response.success) {
					if (uri !== undefined) {
						var f_uri = window.location.href.split('#')[0];
						window.location.href = f_uri + '#' + uri;
						window.location.reload(true);
					} else {
						$name.add($phone).add($email).val('');
						$self.find('span').text(get_lang('Надіслано'));

						setTimeout(function () {
							$self.find('span').text(def_label);
						}, 2000);
					}
				} else {
					$self.find('span').text(def_label);
				}
			},
			'json'
		);

		return true;
	});

	//--------------------------------------------------------------------------------------------------------------------------------------

	if (jQuery().raty) {
		$('.raty').raty({
			readOnly: true,
			path: 'js/raty/images',
			score: function() { return $(this).attr('data-score'); },
			number: function() { return $(this).attr('data-number'); }
		});
	}

	//--------------------------------------------------------------------------------------------------------------------------------------

	/*
	$('#mini_cart')
		.on('mouseenter', function () {
			$(this).find('.mc_window').show();
		})
		.on('mouseleave', function () {
			$(this).find('.mc_window').hide();
		});
	*/

	var $cart = $('#cart');

	$(document)
		.on('click', '.to_cart', function (e) {
			e.preventDefault();

			var $link = $(this),
				$clone = null;

			if ($link.closest('.one_good').length > 0) {
				$clone = $link.closest('.one_good');
			} else if ($link.closest('.main_photo').length > 0) {
				$clone = $link.closest('.details_box').find('.main_photo');
			}

			if ($clone !== null) {
				var $div = $('<div/>'),
					offset = $clone.offset(),
					cart_offset = $('#mini_cart').offset();

				$div
					.css({
						position: 'absolute',
						top: offset['top'],
						left: offset['left'],
						width: $clone.outerWidth(true),
						height: $clone.outerHeight(true),
						margin: 0
					})
					.html($clone.clone());

				$('body').append($div);

				$div.animate(
					{
						top: cart_offset['top'],
						left: cart_offset['left'],
						width: 52,
						height: 42
					},
					500,
					function () {
						$div.remove();
						$link.trigger('to_cart');
					}
				);
			} else {
				$link.trigger('to_cart');
			}
		})
		.on('to_cart', '.to_cart', function () {
			var $link = $(this);
			$link.text('...');

			$.post(
				full_url('cart/cart_put'),
				{
					product_id: $link.data('product-id'),
					option_id: $link.data('option-id')
				},
				function (response) {
					$(document).find('.to_cart').map(function () {
						if ($link.data('product-id') === $(this).data('product-id') && $link.data('option-id') === $(this).data('option-id')) {
							$(this)
								.html('<b></b><span>' + get_lang('В кошику') + '</span>')
								.removeClass('to_cart')
								.addClass('in_cart')
								.addClass('show_cart_form');
						}
					});

					$link.trigger('click');

					mini_cart(response);
				},
				'json'
			);
		})
		.on('click', '.show_cart_form', function (e) {
			e.preventDefault();

			$cart.css('top', $(document).scrollTop() + 20).text(get_lang('завантаження') + '...');
			$black.add($cart).show();

			$.post(
				full_url('cart/form'),
				function (response) {
					if (window.history.replaceState) {
						window.history.replaceState({}, null, window.location.href.replace('?cart-open', '') + '?cart-open');
					} else {
						window.history.pushState('', '', window.location.href.replace('?cart-open', '') + '?cart-open');
					}

						$('.zoom_window').hide();
					$cart.html(response.form).trigger('change_cart');

					$cart.find('.cart_delivery').dropdown({
						arrow: '<b class="drop_arrow"></b>',
						onChange: function ($obj) {
							$cart.find('.cart_delivery').removeClass('error');

							$cart.find('.cart_payment')
								.find('span').eq(0).html($cart.find('.cart_payment').data('placeholder') + '<b class="drop_arrow"></b>')
								.end().end()
								.find('li').removeClass('selected').addClass('hidden')
								.end()
								.find('[type="hidden"]').val('');

							$.each($obj.data('payments'), function (i, v) {
								$cart.find('.cart_payment').find('li.payment_' + v).removeClass('hidden').show();
							});

							$cart.find('[name="delivery_address"]').val('').removeClass('error');
							$cart.find('.cart_shops').removeClass('error');

							if ($obj.data('value') === 'shop') {
								$cart.find('[name="delivery_address"]').closest('.od_input').addClass('hidden');
								$cart.find('.cart_shops').closest('.od_dropdown').removeClass('hidden');
							} else {
								$cart.find('.cart_shops').closest('.od_dropdown').addClass('hidden');
								$cart.find('[name="delivery_address"]').closest('.od_input').removeClass('hidden');
							}
						}
					});

					$cart.find('.cart_payment').dropdown({
						arrow: '<b class="drop_arrow"></b>',
						onChange: function () {
							$cart.find('.cart_payment').removeClass('error');
						}
					});

					$cart.find('.cart_shops').dropdown({
						arrow: '<b class="drop_arrow"></b>',
						onChange: function ($obj) {
							$cart.find('.cart_shops').removeClass('error');
							$cart.find('[name="delivery_address"]').val($obj.data('value'));
						}
					});

					$cart.find('[name="phone"]').mask("+38 (999) 999-99-99");

					$cart.find('[name="name"]')
						.add($cart.find('[name="phone"]'))
						.on('keyup blur paste', function () {
							if ($.trim($(this).val()) !== '') {
								$(this).removeClass('error');
							}
						});

					$cart.find('.show_additional').off('click').on('click', function (e) {
						e.preventDefault();

						$(this).closest('.od_text').addClass('hidden');
						$cart.find('[name="additional"]').closest('.od_input').removeClass('hidden');
					});

					$cart.find('.privacy_policy').off('click').on('click', function (e) {
						e.preventDefault();

						$(this).toggleClass('active');
					});

					$cart.find('.cart_send').on('click', function (e) {
						e.preventDefault();

						if (!$(this).hasClass('disabled')) {
							$cart.find('.delivery_error').add($cart.find('.payment_error')).addClass('hidden');

							var $name = $cart.find('[name="name"]'),
								$surname = $cart.find('[name="surname"]'),
								$phone = $cart.find('[name="phone"]'),
								$email = $cart.find('[name="email"]'),
								$additional = $cart.find('[name="additional"]'),

								request = {
									name: $.trim($name.removeClass('error').val()),
									surname: $.trim($surname.removeClass('error').val()),
									phone: $.trim($phone.removeClass('error').val()),
									email: $.trim($email.removeClass('error').val()),
									additional: $.trim($additional.val()),
									payment: $cart.find('[name="payment"]').val(),
									delivery: $cart.find('[name="delivery"]').val(),
									delivery_address: $cart.find('[name="delivery_address"]').val()
								},
								order_error = false;

							if ($.trim(request.name) === '') {
								$name.addClass('error');
								order_error = true;
							}

							if ($.trim(request.phone) === '') {
								$phone.addClass('error');
								order_error = true;
							}

							if (request.delivery === '') {
								$cart.find('.cart_delivery').addClass('error');
								$cart.find('.delivery_error').removeClass('hidden');
								order_error = true;
							}

							if (request.delivery_address === '') {
								if (request.delivery === 'shop') {
									$cart.find('.cart_shops').addClass('error');
								} else {
									$cart.find('[name="delivery_address"]').addClass('error');
								}

								order_error = true;
							}

							if (request.payment === '') {
								$cart.find('.cart_payment').addClass('error');
								$cart.find('.payment_error').removeClass('hidden');
								order_error = true;
							}

							if (!order_error) {
								$(this).addClass('disabled').html('<span>' + $(this).data('label') + '...</span>');

								$.post(
									full_url('cart/send'),
									request,
									function (response) {
										if (response.success) {
											window.location.href = full_url('cart/success');
										}
									},
									'json'
								);
							}
						}
					});

					$cart.find('.show_cart_login_form').off('click').on('click', function (e) {
						e.preventDefault();
						$cart.find('.cart_login_form').toggleClass('hidden');
					});

					$cart.find('.cart_login_form_close').off('click').on('click', function (e) {
						e.preventDefault();
						$cart.find('.cart_login_form').toggleClass('hidden');
					});

					$('#login_form')
						.off('submit')
						.on('submit', function (e) {
							e.preventDefault();

							var $login_fields = {email: $('[name="login_email"]'), password: $('[name="login_password"]')},
								$login_send = $('.cart_login_send'),
								login_request = {email: $.trim($login_fields.email.val()), password: $.trim($login_fields.password.val())},
								login_error = false;

							if (!emailRegex.test(login_request.email)) {
								$login_fields.email.addClass('error');
								login_error = true;
							}

							if (!ruleRegex.test(login_request.password)) {
								$login_fields.password.addClass('error');
								login_error = true;
							}

							if (!login_error) {
								$login_send.html('<i></i><b></b><span>' + get_lang('Відправка запиту') + '...' + '</span>');

								$.post(
									full_url('profile/enter'),
									login_request,
									function (response) {
										if (response.success) {
											window.location.href = window.location.href + '?show_cart';
										} else {
											$login_fields.email.addClass('error');
											$login_fields.password.addClass('error');
											$login_send.html('<i></i><b></b><span>' + get_lang('Увійти') + '</span>');
										}
									},
									'json'
								);
							}
						})
						.on('keyup paste blur', 'input', function (e) {
							if ($.trim($(this).val() !== '')) {
								$(this).removeClass('error');
								if (e.keyCode === 13) {
									$(this).closest('form').trigger('submit');
								}
							}
						})
						.on('click', '.cart_login_send', function (e) {
							e.preventDefault();
							$(this).closest('form').trigger('submit');
						});
				},
				'json'
			);
		});

	$cart
		.on('change_cart', function () {
			var total_price = 0,
				discount = 0;

			$(this).find('.one_ct_good').map(function () {
				var sale = parseInt($(this).data('sale')),
					price = $(this).data('price'),
					prices = $(this).data('prices'),
					total = parseInt($(this).find('.ct_total').val());

				$.each(prices, function (_limit, _price) {
					if (total >= _limit) {
						price = _price;
					}
				});

				var row_price = roundPlus(total * price, 0);
				$(this).find('.cart_cost').find('.ct_sum').text(row_price + ' ' + get_lang('грн'));
				total_price += row_price;

				// if (sale > 0) {
				// 	discount += price_old - price;
				// }
			});

			$cart.find('.mw_total').find('b').eq(0).text(total_price);

			if (discount > 0) {
				$cart.find('.discount').find('span').eq(0).text(discount);
				$cart.find('.discount').closest('.mw_total').removeClass('hidden');
			} else {
				$cart.find('.discount').closest('.mw_total').addClass('hidden');
			}
		})
		.on('click', '.ct_plus', function (e) {
			e.preventDefault();

			var product_id = $(this).closest('.one_ct_good').data('product-id'),
				option_id = $(this).closest('.one_ct_good').data('option-id'),
				total = parseInt($(this).closest('.one_ct_good').find('.ct_total').val()) + 1;

			$.post(
				full_url('cart/cart_put'),
				{
					product_id: product_id,
					option_id: option_id,
					total: total
				},
				function (response) {
					mini_cart(response);
				},
				'json'
			);

			$(this).closest('.one_ct_good').find('.ct_total').val(total);
			$cart.trigger('change_cart');
		})
		.on('click', '.ct_minus', function (e) {
			e.preventDefault();

			var product_id = $(this).closest('.one_ct_good').data('product-id'),
				option_id = $(this).closest('.one_ct_good').data('option-id'),
				total = parseInt($(this).closest('.one_ct_good').find('.ct_total').val()) - 1;

			if (total >= 1) {
				$.post(
					full_url('cart/cart_put'),
					{
						product_id: product_id,
						option_id: option_id,
						total: total
					},
					function (response) {
						mini_cart(response);
					},
					'json'
				);

				$(this).closest('.one_ct_good').find('.ct_total').val(total);
				$cart.trigger('change_cart');
			}
		})
		.on('blur keyup paste', '.ct_total', function (e) {
			e.preventDefault();

			var product_id = $(this).closest('.one_ct_good').data('product-id'),
				option_id = $(this).closest('.one_ct_good').data('option-id'),
				total = parseInt($(this).val());

			if (total >= 1) {
				$.post(
					full_url('cart/cart_put'),
					{
						product_id: product_id,
						option_id: option_id,
						total: total
					},
					function (response) {
						mini_cart(response);
					},
					'json'
				);

				$(this).closest('.one_ct_good').find('.ct_total').val(total);
				$cart.trigger('change_cart');
			}
		})
		.on('click', '.ct_delete', function (e) {
			e.preventDefault();

			var product_id = $(this).closest('.one_ct_good').data('product-id'),
				option_id = $(this).closest('.one_ct_good').data('option-id');

			$(this).closest('.one_ct_good').remove();

			$.post(
				full_url('cart/delete_item'),
				{
					product_id: product_id,
					option_id: option_id
				},
				function (response) {

					if (response[0] == 0) {
						$cart.add($black).hide();
					}

					$('.in_cart').each(function () {
						if ($(this).data('product-id') == product_id && $(this).data('option-id') == option_id) {
							$(this).removeClass('in_cart').removeClass('show_cart_form').addClass('to_cart');
							$(this).html('<i></i><b></b><span>' + $(this).data('label') + '</span>');
						}
					});

					mini_cart(response);
				},
				'json'
			);

			$cart.trigger('change_cart');
		})
		.on('click', '.cart_close_link', function (e) {
			e.preventDefault();

			$cart.add($black).hide();
		});

	//--------------------------------------------------------------------------------------------------------------------------------------

	var $articles = $('.article_open'), read_more, read_less;

	if ($articles.length > 0) {

		if (LANG == 'ua') {
			read_more = 'Розгорнути';
			read_less = 'Згорнути';
		}

		if (LANG == 'ru') {
			read_more = 'Развернуть';
			read_less = 'Свернуть';
		}

		if (LANG == 'en') {
			read_more = 'Read more';
			read_less = 'Close';
		}

		$articles.map(function () {
			$(this).append(' <div class="long_div"><a href="#" class="fmr read_more">' + read_more + '</a></div>');
			$(this).next('.article_close').append(' <div class="long_div"><a href="#" class="fmr read_less">' + read_less + '</a></div>');

			$(this).find('.read_more').on('click', function (e) {
				e.preventDefault();

				$(this).closest('.article_open').next('.article_close').stop().slideDown();
				$(this).hide();
			});

			$(this).next('.article_close').find('.read_less').on('click', function (e) {
				e.preventDefault();

				$(this).closest('.article_close').stop().slideUp();
				$(this).closest('.article_close').prev('.article_open').find('.read_more').show();
			});
		});
	}

	//-------------------------------------------------------------------------------------------------------------------------------------------

	$('.sale_phone').add('#order_phone').add('.click_pay_phone').add('.ask_price_phone').mask("+38 (999) 999-99-99");
});

//-------------------------------------------------------------------------------------------------------------------------------------------------

$(function () {
	var s_timer;

	$(document).on('click', function (event) {
		if ($(event.target).hasClass('sq') || $(event.target).closest('.sq').length > 0) return false;
		$('.search_variants').removeClass('active').hide();
		return true;
	});

	$('#search_form').find('[type="text"]').prop('autocomplete', 'off');

	$('#search_form').on('keyup', '[type="text"]', function (e) {
		if (e.keyCode != 13 && e.keyCode != 37 && e.keyCode != 38 && e.keyCode != 39 && e.keyCode != 40) {
			clearTimeout(s_timer);

			var v = $.trim($(this).val());

			if (v.length >= 3) {
				$('.search_variants').removeClass('active').find('ul').hide().empty();

				s_timer = setTimeout(function () {
					$.post(
						full_url('search/autocomplete'),
						{
							query: v
						},
						function (response) {
							if (response.length > 0) {
								var slist = '';
								$.each(response, function (i, val) {
									slist += '<li><a href="' + val.url + '">' + (val.image !== '' ? '<img src="' + val.image + '" alt="">' : '') + '' + val.title + '</a></li>';
								});

								$('.search_variants').find('ul').html(slist).show();
								$('.search_variants').find('ul').append('<li><a href="/search/?query=' + v + '" class="all_results">' + (LANG === 'ua' ? 'всі результати' : 'все результаты') + '</a>');
								$('.search_variants').addClass('active').show();
							}
						},
						'json'
					);
				}, 200);
			}
		}
	});

	$(document).keydown(function(e){

		if (e.keyCode == 13) {
			if ($('.search_variants').hasClass('active') && $('.search_variants').find('li.active').length > 0) {
				e.preventDefault();
				window.location.href = $('.search_variants').find('li.active').find('a').attr('href');
			}
		}

		if (e.keyCode == 38) {

			var sv = $('.search_variants').find('li').length,
				si = $('.search_variants').find('li.active').length > 0 ? $('.search_variants').find('li.active').index() - 1 : sv - 1;

			if ($('.search_variants').hasClass('active')) {
				e.preventDefault();

				if (si >= 0) {
					$('.sq').blur();
					$('.search_variants').find('li').removeClass('active');
					$('.search_variants').find('li').eq(si).addClass('active');
				} else {
					$('.sq').focus();
					$('.search_variants').find('li').removeClass('active');
				}
			}
		}

		if (e.keyCode == 40) {

			var sv = $('.search_variants').find('li').length,
				si = $('.search_variants').find('li.active').length > 0 ? $('.search_variants').find('li.active').index() + 1 : 0;

			if ($('.search_variants').hasClass('active')) {
				e.preventDefault();

				if (si < sv) {
					$('.sq').blur();
					$('.search_variants').find('li').removeClass('active');
					$('.search_variants').find('li').eq(si).addClass('active');
				} else {
					$('.sq').focus();
					$('.search_variants').find('li').removeClass('active');
				}
			}
		}
	});
});

$(function () {
	if ($('#catalog_tabs').find('ul').length > 0) {
		$('#catalog_tabs').find('ul')
			.on('click', 'a', function (e) {
				e.preventDefault();

				$(this).closest('ul').find('a').map(function () {
					$(this).removeClass('active');
					$($(this).attr('href')).addClass('hidden');
				});

				$(this).addClass('active');
				$($(this).attr('href')).removeClass('hidden');

				if ($($(this).attr('href')).find('.one_good').length < 5) {
					$(this).closest('div').find('.show_all').attr('href', full_url('catalog/showcase/' + $(this).attr('href').replace('#catalog_', ''))).removeClass('hidden');
				} else {
					$(this).closest('div').find('.show_all').addClass('hidden');
				}
			})
			.find('a').eq(0).trigger('click');
	}
});

$(function () {
	// Уточнити ціну

	$(function () {
		$('.ask_price_form_open').on('click', function (e) {
			e.preventDefault();
			$(this).closest('.ask_price_form_box').find('.ask_price_form').removeClass('hidden');
		});

		$('.ask_price_form_close').on('click', function (e) {
			e.preventDefault();
			$(this).closest('.ask_price_form').addClass('hidden');
		});

		$('.ask_price_send').on('click', function (e) {
			e.preventDefault();

			var $box = $(this).closest('.ask_price_form_box'),
				$name = $box.find('.ask_price_name'),
				$phone = $box.find('.ask_price_phone'),
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

			$box.find('.ask_price_form').html('<p class="loader">' + send_message + '</p>');

			$.post(
				full_url('cart/ask_price'),
				request,
				function (response) {
					if (response.success) {
						$box.html('<p class="success">' + success_message + '</p>');
						setTimeout(function () { $box.remove(); }, 2000);
					}
				},
				'json'
			);

			return true;
		});
	});
});