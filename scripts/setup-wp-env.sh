#!/bin/sh

set -eu

run_wp() {
	npx wp-env run cli -- wp "$@"
}

if ! run_wp plugin is-active polylang >/dev/null; then
	run_wp plugin activate polylang >/dev/null
fi

page_ids=$(run_wp eval 'echo implode(" ", get_posts(array(
	"post_type" => "page",
	"post_status" => array("publish", "future", "draft", "pending", "private", "trash"),
	"title" => "Find My Representative",
	"orderby" => "ID",
	"order" => "ASC",
	"fields" => "ids",
	"posts_per_page" => -1,
)));')

set -- $page_ids

if [ "$#" -eq 0 ]; then
	page_id=$(run_wp post create \
		--post_type=page \
		--post_name=find-my-representative \
		--post_title='Find My Representative' \
		--post_content='<!-- wp:find-my-rep/contact-block /-->' \
		--post_status=publish \
		--porcelain)
else
	page_id=$1
	shift

	run_wp post update "$page_id" \
		--post_title='Find My Representative' \
		--post_content='<!-- wp:find-my-rep/contact-block /-->' \
		--post_status=publish >/dev/null

	if [ "$#" -gt 0 ]; then
		run_wp post delete "$@" --force >/dev/null
	fi
fi

run_wp option update page_on_front "$page_id" >/dev/null
run_wp option update show_on_front page >/dev/null
run_wp rewrite structure '/%postname%/' --hard >/dev/null

run_wp eval '
$languages = pll_languages_list();

if (!in_array("en", $languages, true)) {
	$result = PLL()->model->languages->add(array(
		"name" => "English",
		"slug" => "en",
		"locale" => "en_GB",
		"rtl" => false,
		"term_group" => 0,
	));

	if (is_wp_error($result)) {
		WP_CLI::error($result);
	}
}

if (!in_array("cy", $languages, true)) {
	$result = PLL()->model->languages->add(array(
		"name" => "Cymraeg",
		"slug" => "cy",
		"locale" => "cy_GB",
		"rtl" => false,
		"term_group" => 1,
	));

	if (is_wp_error($result)) {
		WP_CLI::error($result);
	}
}

$welsh_language = PLL()->model->get_language("cy");

if (!$welsh_language) {
	WP_CLI::error("The Welsh language was not found.");
}

if ("cy_GB" !== $welsh_language->locale) {
	$result = PLL()->model->languages->update(array(
		"lang_id" => $welsh_language->term_id,
		"locale" => "cy_GB",
	));

	if (is_wp_error($result)) {
		WP_CLI::error($result);
	}
}

if ("en" !== pll_default_language()) {
	$result = PLL()->model->languages->update_default("en");

	if ($result->has_errors()) {
		WP_CLI::error($result);
	}
}

$english_page = get_page_by_path("find-my-representative", OBJECT, "page");

if (!$english_page) {
	WP_CLI::error("The English Find My Representative page was not found.");
}

pll_set_post_language($english_page->ID, "en");

$welsh_page_ids = get_posts(array(
	"post_type" => "page",
	"post_status" => array("publish", "future", "draft", "pending", "private", "trash"),
	"title" => "Dod o Hyd i Fy Nghynrychiolydd",
	"orderby" => "ID",
	"order" => "ASC",
	"fields" => "ids",
	"posts_per_page" => -1,
));

if (empty($welsh_page_ids)) {
	$welsh_page_id = wp_insert_post(array(
		"post_type" => "page",
		"post_name" => "dod-o-hyd-i-fy-nghynrychiolydd",
		"post_title" => "Dod o Hyd i Fy Nghynrychiolydd",
		"post_content" => "<!-- wp:find-my-rep/contact-block /-->",
		"post_status" => "publish",
	), true);

	if (is_wp_error($welsh_page_id)) {
		WP_CLI::error($welsh_page_id);
	}
} else {
	$welsh_page_id = array_shift($welsh_page_ids);
	wp_update_post(array(
		"ID" => $welsh_page_id,
		"post_title" => "Dod o Hyd i Fy Nghynrychiolydd",
		"post_content" => "<!-- wp:find-my-rep/contact-block /-->",
		"post_status" => "publish",
	));

	foreach ($welsh_page_ids as $duplicate_page_id) {
		wp_delete_post($duplicate_page_id, true);
	}
}

pll_set_post_language($welsh_page_id, "cy");
pll_save_post_translations(array(
	"en" => $english_page->ID,
	"cy" => $welsh_page_id,
));
' >/dev/null

run_wp rewrite flush --hard >/dev/null