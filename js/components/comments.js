$(function () {
	function set_rate() {
		$('.raty_active').raty({
			targetScore : '#comment_stars',
			path: 'js/raty/images',
			score: function() { return $(this).attr('data-score'); },
			number: function() { return $(this).attr('data-number'); }
		});

		$('.raty').raty({
			readOnly: true,
			path: 'js/raty/images',
			score: function() { return $(this).attr('data-score'); },
			number: function() { return $(this).attr('data-number'); }
		});
	}

	set_rate();

	var $form = $('#comment_form'),
		$comments = $('#comments_list');

	$form
		.on('click', '.attach_photo span', function () {
			$(this).closest('.attach_photo').find('input').toggleClass('hidden');
		})
		.on('click', '.attach_video span', function () {
			$(this).closest('.attach_video').find('input').toggleClass('hidden');
		})
		.on('keyup paste blur', 'textarea, input', function () {
			$(this).removeClass('error');
		})
		.on('click', '.send_comment', function (e) {
			e.preventDefault();
			$form.append('<input type="hidden" name="plus" value="1">');
			$form.trigger('submit');
		})
		.ajaxForm({
			dataType: 'json',
			beforeSubmit: function () {
				var comment = $.trim($form.find('[name="comment"]').val());

				if (comment === '') {
					$form.find('[name="comment"]').addClass('error');
					return false;
				} else if ($form.find('[name="name"]').length > 0 && $.trim($form.find('[name="name"]').val()) === '') {
					$form.find('[name="name"]').addClass('error');
					return false;
				} else {
					var msg_4 = 'Sending...';

					if (LANG == 'ua') msg_4 = 'Відправка...';
					if (LANG == 'ru') msg_4 = 'Отправка...';

					$form.find('.send_comment').find('span').text(msg_4);
				}

				return true;
			},
			success: function (response) {
				if (response.hasOwnProperty('success')) {
					if ($comments.hasClass('dc_all--empty')) {
						$comments.removeClass('dc_all--empty').html(response.comment);
					} else {
						$comments.append(response.comment);
					}

					set_rate();

					$form.find('[name="name"]').val('');
					$form.find('[name="comment"]').val('');
					$form.find('[name="photo"]').val('');
					$form.find('[name="stars"]').val(0);
					$form.find('[name="video"]').val(0);

					$form.find('.attach_photo').addClass('hidden');
					$form.find('.attach_video').addClass('hidden');

					var msg_5 = 'Add a review';
					if (LANG == 'ua') msg_5 = 'додати відгук';
					if (LANG == 'ru') msg_5 = 'добавить отзыв';
					$form.find('.send_comment').find('span').text(msg_5);
				}
			}
		});

	$comments
		.on('click', '.set_rate', function (e) {
			e.preventDefault();

			var $self = $(this);

			$.post(
				full_url('comments/rate'),
				{
					comment_id: $self.closest('.dc_bottom').data('comment-id'),
					type: $self.data('type')
				},
				function (response) {
					if (response.success) {
						$self.closest('.dc_bottom').find('.rate_plus').text(response.plus);
						$self.closest('.dc_bottom').find('.rate_minus').text(response.minus);
					}
				},
				'json'
			);
		});
});