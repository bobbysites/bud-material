/**
 * This jQuery plugin displays pagination links inside the selected elements.
 *
 * This plugin needs at least jQuery 1.4.2
 *
 * @author Gabriel Birke (birke *at* d-scribe *dot* de)
 * @version 2.2
 * @param {int} maxentries Number of entries to paginate
 * @param {Object} opts Several options (see README for documentation)
 * @return {Object} jQuery Object
 */
(function($){
	/**
	 * @class Class for calculating pagination values
	 */
	$.PaginationCalculator = function(maxentries, opts) {
		this.maxentries = maxentries;
		this.opts = opts;
	};

	$.extend($.PaginationCalculator.prototype, {
		/**
		 * Calculate the maximum number of pages
		 * @method
		 * @returns {Number}
		 */
		numPages:function() {
			return Math.ceil(this.maxentries/this.opts.items_per_page);
		},
		/**
		 * Calculate start and end point of pagination links depending on
		 * current_page and num_display_entries.
		 * @returns {Array}
		 */
		getInterval:function(current_page)  {
			var ne_half = Math.floor(this.opts.num_display_entries/2);
			var np = this.numPages();
			var upper_limit = np - this.opts.num_display_entries;
			var start = current_page > ne_half ? Math.max( Math.min(current_page - ne_half, upper_limit), 0 ) : 0;
			var end = current_page > ne_half?Math.min(current_page+ne_half + (this.opts.num_display_entries % 2), np):Math.min(this.opts.num_display_entries, np);
			return {start:start, end:end};
		}
	});

	// Initialize jQuery object container for pagination renderers
	$.PaginationRenderers = {};

	/**
	 * @class Default renderer for rendering pagination links
	 */
	$.PaginationRenderers.defaultRenderer = function(maxentries, opts) {
		this.maxentries = maxentries;
		this.opts = opts;
		this.pc = new $.PaginationCalculator(maxentries, opts);
	};
	$.extend($.PaginationRenderers.defaultRenderer.prototype, {
		/**
		 * Helper function for generating a single link (or a span tag if it's the current page)
		 * @param {Number} page_id The page id for the new item
		 * @param {Number} current_page
		 * @param {Object} appendopts Options for the new item: text and classes
		 * @returns {jQuery} jQuery object containing the link
		 */
		createLink:function(page_id, current_page, appendopts){
			var lnk, np = this.pc.numPages();
			page_id = page_id<0?0:(page_id<np?page_id:np-1); // Normalize page id to sane value
			appendopts = $.extend({text:page_id+1, classes:""}, appendopts||{});

			if(page_id == current_page){
				if (appendopts.classes && (appendopts.classes == 'pag_left' || appendopts.classes == 'pag_right')) {
					lnk = $("<span>" + appendopts.text + "</span>");
				} else {
					lnk = $("<strong>" + appendopts.text + "</strong>");
				}
			}
			else
			{
				lnk = $("<a>" + appendopts.text + "</a>").attr('href', this.opts.link_to.replace(/__id__/,page_id));
			}


			lnk.data('page_id', page_id);


			if (appendopts.classes) {
				lnk.addClass(appendopts.classes);
			}

			return lnk;
		},
		// Generate a range of numeric links
		appendRange:function(container, current_page, start, end, opts) {
			var i;
			for(i=start; i<end; i++) {
				this.createLink(i, current_page, opts).appendTo(container);
			}
		},
		getLinks:function(current_page, eventHandler) {
			var begin, end,
				interval = this.pc.getInterval(current_page),
				np = this.pc.numPages(),
				fragment = $("<div class=\"fm paginator\"></div>");

			// Generate "Previous"-Link
			if(this.opts.prev_text && (current_page > 0 || this.opts.prev_show_always)){
				fragment.append(this.createLink(current_page-1, current_page, {text:this.opts.prev_text, classes:"pag_left"}));
			}
			// Generate starting points
			if (interval.start > 0 && this.opts.num_edge_entries > 0)
			{
				end = Math.min(this.opts.num_edge_entries, interval.start);
				this.appendRange(fragment, current_page, 0, end, {classes:'sp'});
				if(this.opts.num_edge_entries < interval.start && this.opts.ellipse_text)
				{
					$("<span>"+this.opts.ellipse_text+"</span>").appendTo(fragment);
				}
			}
			// Generate interval links
			this.appendRange(fragment, current_page, interval.start, interval.end);
			// Generate ending points
			if (interval.end < np && this.opts.num_edge_entries > 0)
			{
				if(np-this.opts.num_edge_entries > interval.end && this.opts.ellipse_text)
				{
					$("<span>"+this.opts.ellipse_text+"</span>").appendTo(fragment);
				}
				begin = Math.max(np-this.opts.num_edge_entries, interval.end);
				this.appendRange(fragment, current_page, begin, np, {classes:'ep'});

			}
			// Generate "Next"-Link
			if(this.opts.next_text && (current_page < np-1 || this.opts.next_show_always)){
				fragment.append(this.createLink(current_page+1, current_page, {text:this.opts.next_text, classes:"pag_right"}));
			}
			$('a', fragment).click(eventHandler);
			return fragment;
		}
	});

	$.fn.pagination = function(maxentries, opts){

		opts = $.extend({
			items_per_page: 10,
			num_display_entries: 6,
			current_page: 0,
			num_edge_entries: 1,
			link_to: "#",
			prev_text: " ",
			next_text: " ",
			ellipse_text: "...",
			prev_show_always: false,
			next_show_always: false,
			renderer: "defaultRenderer",
			show_if_single_page: false,
			load_first_page: false,
			callback:function(){ return false; }
		},opts||{});

		var containers = this,
			renderer, links, current_page;

		function paginationClickHandler(evt){
			var new_current_page = $(evt.target).data('page_id'),
				continuePropagation = selectPage(new_current_page);

			if (!continuePropagation) {
				evt.stopPropagation();
			}

			return continuePropagation;
		}

		function selectPage(new_current_page) {
			containers.data('current_page', new_current_page);
			links = renderer.getLinks(new_current_page, paginationClickHandler);
			containers.empty();

			var box = $('<table/>').attr('align', 'center').append('<tr><td align="center"></td></tr>');
			box.find('td').append(links);

			var nav = $('<nav/>', {'class': 'fm paginator'});
			nav.append(box);

			containers.html(nav);

			return opts.callback(new_current_page, containers);
		}

		current_page = parseInt(opts.current_page);
		containers.data('current_page', current_page);

		maxentries = (!maxentries || maxentries < 0)?1:maxentries;
		opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0)?1:opts.items_per_page;

		if(!$.PaginationRenderers[opts.renderer])
		{
			throw new ReferenceError("Pagination renderer '" + opts.renderer + "' was not found in jQuery.PaginationRenderers object.");
		}
		renderer = new $.PaginationRenderers[opts.renderer](maxentries, opts);

		var pc = new $.PaginationCalculator(maxentries, opts);
		var np = pc.numPages();

		containers.off('setPage').on('setPage', {numPages:np}, function(evt, page_id) {
			if(page_id >= 0 && page_id < evt.data.numPages) {
				selectPage(page_id); return false;
			}
		});

		containers.off('prevPage').on('prevPage', function(evt){
			var current_page = $(this).data('current_page');
			if (current_page > 0) {
				selectPage(current_page - 1);
			}
			return false;
		});

		containers.off('nextPage').on('nextPage', {numPages:np}, function(evt){
			var current_page = $(this).data('current_page');
			if(current_page < evt.data.numPages - 1) {
				selectPage(current_page + 1);
			}
			return false;
		});

		containers.off('currentPage').on('currentPage', function(){
			var current_page = $(this).data('current_page');
			selectPage(current_page);
			return false;
		});

		links = renderer.getLinks(current_page, paginationClickHandler);
		containers.empty();

		if (np > 1 || opts.show_if_single_page) {
			var box = $('<table/>').attr('align', 'center').append('<tr><td align="center"></td></tr>');
			box.find('td').append(links);
			
			var nav = $('<nav/>', {'class': 'fm paginator'});
			nav.append(box);

			containers.html(nav);
		}

		if(opts.load_first_page) {
			opts.callback(current_page, containers);
		}
	};

})(jQuery);