var catalog_base_url,
	filters,

	filter_timer,
	min_price = 0, current_min_price = 0,
	max_price = 0, current_max_price = 0,

	$catalog_filters,
	$filter_prices,
	$price_slider;

function filtration() {
	filters = [];

	if (min_price != current_min_price) {
		filters.push('min_price-' + current_min_price);
	}

	if (max_price != current_max_price) {
		filters.push('max_price-' + current_max_price);
	}

	if ($catalog_filters.length > 0) {
		$catalog_filters.find('.fil_group').map(function () {
			var values = [];

			if ($(this).find('.slider').length > 0) {
				var min = parseFloat($(this).find('.slider').data('min')),
					current_min = parseFloat($(this).find('.slider').data('current-min')),
					max = parseFloat($(this).find('.slider').data('max')),
					current_max = parseFloat($(this).find('.slider').data('current-max')),
					urls = $(this).find('.slider').data('urls');

				if (min !== current_min || max !== current_max) {
					$.each(urls, function (k, v) {
						k = parseFloat(k);

						if (k >= current_min && k <= current_max) {
							values.push(v);
						}
					});
				}
			} else {
				if ($(this).find('.active').length > 0) {
					$(this).find('.active').each(function () { values.push($(this).data('url')); });
				}
			}

			if (values.length > 0) {
				filters.push($(this).data('filter-url') + '-' + values.join('-'));
			}
		});
	}

	window.location.href = catalog_base_url + ((filters.length > 0) ? 'f/' + filters.join('/') + '/' : '');
}

$(function () {
	$catalog_filters = $('#catalog_filters');
	$filter_prices = $('#filter_prices');
	$price_slider = $('#price_slider');

	catalog_base_url = $catalog_filters.data('base-url');

	min_price = $filter_prices.data('min-price');
	max_price = $filter_prices.data('max-price');
	current_min_price = $filter_prices.data('current-min-price');
	current_max_price = $filter_prices.data('current-max-price');

	function set_slider() {
		if ($price_slider.hasClass('init')) {
			$('#price_with').html(min_price + ' <i>' + get_lang('грн') + '</i>');
			$('#price_to').html(max_price + ' <i>' + get_lang('грн') + '</i>');

			$price_slider[0].noUiSlider.set(min_price, max_price);
		} else {
			$('#price_with').html(current_min_price + ' <i>' + get_lang('грн') + '</i>');
			$('#price_to').html(current_max_price + ' <i>' + get_lang('грн') + '</i>');

			if (min_price === max_price) {
				$filter_prices.hide();
			} else {
				$filter_prices.show();

				$price_slider.addClass('init').html('');

				noUiSlider.create($price_slider[0], {
					range: {
						min: min_price,
						max: max_price
					},
					start: [current_min_price, current_max_price],
					serialization: {
						to: ['', ''],
						resolution: 1
					}
				});

				$price_slider[0].noUiSlider
					.on('slide', function () {
						var values = $price_slider[0].noUiSlider.get();

						current_min_price = values[0];
						current_max_price = values[1];

						$('#price_with').html(current_min_price + ' <i>' + get_lang('грн') + '</i>');
						$('#price_to').html(current_max_price + ' <i>' + get_lang('грн') + '</i>');
					});
			}
		}
	}

	set_slider();

	$('.raty').raty({
		readOnly: true,
		path: 'js/raty/images',
		score: function() { return $(this).attr('data-score'); },
		number: function() { return $(this).attr('data-number'); }
	});

	$('#catalog_sort').dropdown({
		arrow: '<b></b>',
		onChange: function (obj) {
			setcookie('catalog_sort', obj.data('value'), 86400, '/');
			filtration();
		}
	});

	$('#catalog_per_page').dropdown({
		arrow: '<b></b>',
		onChange: function (obj) {
			setcookie('catalog_per_page', obj.data('value'), 86400, '/');
			filtration();
		}
	});

	$catalog_filters.find('.slider').map(function () {
		var $slider = $(this),
			data = $slider.data('json'),

			current_data = $slider.data('current'),

			range = {},
			points = [0],
			urls = {},
			min = '',
			max = '',
			current_min = '',
			current_max = '';

		$.each(data, function (i, v) {
			urls[v.name] = parseFloat(v.url);
			v.name = parseFloat(v.name);

			if (min === '' || v.name < min) {
				min = v.name;
			}

			if (v.name > max) {
				max = v.name;
			}

			points.push(parseFloat(v.name));
		});

		range['min'] = 0;
		range['max'] = max;

		$.each(points, function (i, v) {
			range[(v * 100 / range['max']).toString() + '%'] = v;
		});

		if (Object.keys(current_data).length > 0) {
			current_data = Object.keys( current_data ).map(function ( key ) { return current_data[key]; });

			current_min = Math.min.apply( null, current_data );
			current_max = Math.max.apply( null, current_data );
		} else {
			current_min = min;
			current_max = max;
		}

		$slider.data('min', min);
		$slider.data('current-min', current_min);
		$slider.data('max', max);
		$slider.data('current-max', current_max);
		$slider.data('urls', urls);

		$slider.data('current-min', current_min);
		$slider.closest('.fs_place').find('.fs_place_with').html(current_min);

		$slider.data('current-max', current_max);
		$slider.closest('.fs_place').find('.fs_place_to').html(current_max);

		noUiSlider.create($slider[0], {
			range: range,
			snap: true,
			start: [current_min, current_max],
			format: wNumb({
				decimals: 0
			})
		});

		$slider[0].noUiSlider
			.on('change', function (values, handle) {
				if (values[handle] < min) {
					current_min = min;
					$slider.data('current-min', min);
					$slider[0].noUiSlider.set(min);
					$slider.closest('.fs_place').find('.fs_place_with').html(min);
				} else if (values[handle] > max) {
					current_max = max;
					$slider.data('current-max', max);
					$slider[0].noUiSlider.set(max);
					$slider.closest('.fs_place').find('.fs_place_to').html(max);
				}

				$catalog_filters.find('.submit_filters').addClass('hidden');
				$slider.closest('.fil_group').find('.submit_filters').removeClass('hidden');
			});

		$slider[0].noUiSlider
			.on('slide', function () {
				var values = $slider[0].noUiSlider.get();

				if (values[0] >= min && values[1] <= max) {
					current_min = values[0];
					current_max = values[1];

					$slider.data('current-min', current_min);
					$slider.closest('.fs_place').find('.fs_place_with').html(current_min);

					$slider.data('current-max', current_max);
					$slider.closest('.fs_place').find('.fs_place_to').html(current_max);

					$catalog_filters.find('.submit_filters').addClass('hidden');
					$slider.closest('.fil_group').find('.submit_filters').removeClass('hidden');
				}
			});
	});

	$catalog_filters.add($filter_prices).on('click', '.submit_filters', function (e) {
		e.preventDefault();

		filtration();
	});

	$catalog_filters.on('click', 'li',  function (e) {
		e.preventDefault();

		if ($(this).hasClass('show_more')) {
			$(this).toggleClass('open');

			if ($(this).hasClass('open')) {
				$(this).text($(this).data('less'));
				$(this).closest('div').find('ul').find('li').removeClass('hidden');
			} else {
				$(this).closest('div').find('ul').find('li:gt(5)').not('.show_more').addClass('hidden');
				$(this).text($(this).data('more'));
				$(document).scrollTop($(this).closest('div').offset()['top']);
			}
		} else {
			if (!$(this).hasClass('no_active')) {
				$(this).toggleClass('active');
				filtration();
			}
		}
	});

	$('#selected_filters_list').on('click', '.deactivate-filter', function (e) {
		e.preventDefault();

		if ($(this).data('filter') === 'price') {
			$(this).closest('div').remove();

			current_min_price = min_price;
			current_max_price = max_price;

			set_slider();
		} else if ($(this).data('filter') === 'slider') {
			var $slider = $('#filter_slider_' + $(this).data('filter-id'));
			$(this).closest('div').remove();

			$slider.data('current-min', $slider.data('min'));
			$slider.closest('.fs_place').find('.fs_place_with').html($slider.data('min'));

			$slider.data('current-max', $slider.data('max'));
			$slider.closest('.fs_place').find('.fs_place_to').html($slider.data('max'));

			$slider[0].noUiSlider.set($slider.data('min'), $slider.data('max'));
		} else {
			$('#fv_' + $(this).data('value')).removeClass('active');

			if ($(this).closest('div').find('p').length === 1) {
				$(this).closest('div').remove();
			} else {
				$(this).closest('p').remove();
			}
		}

		filtration();
	});
});