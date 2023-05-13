<?php
	ini_set("zlib.output_compression", 0);

	const DERPIBOORU_URL = "https://twibooru.org";
	const DERPIBOORU_CDN = "https://cdn.twibooru.org/img/";
	const GALLERIES_PATH = "/galleries.json?user=Twifag&include_images=true";
	const GALLERY_ID = 38;
	const TTL = 600;

	function getGrill($sizes, bool $includeSource = false) {
		if (!is_array($sizes))
			return getGrill([$sizes])[0];
		$galleryListUrl = DERPIBOORU_URL . GALLERIES_PATH;
		$gallery = apcu_entry("pomf_grill_gallery", function() use($galleryListUrl): array {
			$galleries = json_decode(file_get_contents($galleryListUrl), true);
			return $galleries[array_search(GALLERY_ID, array_column($galleries, "id"))];
		}, TTL);
		// var_dump($gallery);
		$imageId = strval($gallery["post_ids"][array_rand($gallery["post_ids"])]);
		$image = apcu_entry("pomf_grill_{$imageId}", function() use($imageId): array {
			return json_decode(file_get_contents(DERPIBOORU_URL . "/${imageId}.json"), true);
		});
		$result = array_map(function(string $size) use ($image): string {
			// $imageUrl = str_replace(DERPIBOORU_CDN, "", $image["representations"][$size]);
			// return "/img/grill/{$imageUrl}";
			return $image["representations"][$size];
		}, $sizes);

		if ($includeSource) {
			$result["artists"] = array_reduce(explode(", ", $image["tags"]), function(array $artists, string $tag): array {
				if (substr($tag, 0, 7) === "artist:")
					$artists[] = substr($tag, 7);
				return $artists;
			}, []);
			$result["mime"] = $image["mime_type"];
			$result["url"] = DERPIBOORU_URL . "/${imageId}";
		}
		return $result;
	}
?>