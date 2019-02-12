<?php
	ini_set("zlib.output_compression", 0);
	// error_reporting(E_ALL);
	// ini_set("display_errors", 1);
	header("Content-Type: text/html");
?>
<noscript id="deferred-stylesheets">
	<link rel="stylesheet" href="/pomf.css" importance="high">
</noscript>
<style>
	body {
		background-attachment: fixed;
		background-color: rgb(45, 45, 45); /* hsl(0, 0, 18%) */
		/*background-image: linear-gradient(rgb(60, 60, 60), #000);*/
	}
	main, main + footer { transition: transform 0.5s cubic-bezier(0, 0, 0.8, 1.2); }
	main { transform: translateY(-500%); }
	main + footer { transform: translateY(500%); }
	#smutty-bg {
		align-items: center;
		display: flex;
		bottom: 0;
		flex-direction: column;
		position: fixed;
		right: 0;
		transition: transform 0.5s cubic-bezier(0, 0, 0.5, 1.2);
		transform: translateX(500%);
	}
	#smutty-bg figcaption { font-size: xx-small; }
	#smutty-bg figcaption a[target="_blank"]::after {
		background-position: center;
		background-size: 8px 8px;
		height: 8px;
		width: 8px;
	}
</style>
<?php
	if (isset($_SERVER["HTTP_SAVE_DATA"]) && strtolower($_SERVER["HTTP_SAVE_DATA"]) === "on")
		exit;
	require_once "includes/grill.inc.php";
	$grills = getGrill(["small", "medium", "large"], true);
	$artistMetadata = array_map(function(string $artistName): string { return "<link itemprop=\"author\" href=\"" . DERPIBOORU_URL . "/tags/artist-colon-{$artistName}\" rel=\"author\">"; }, $grills["artists"]);
	$mimeTypeAttribute = empty($grills["mime"]) ? "" : " type=\"{$grills["mime"]}\"";
?>
<figure id="smutty-bg" itemscope itemtype="https://schema.org/ImageObject" role="presentation">
	<img alt="" importance="high" role="presentation" sizes="(min-width: 1340px) 30vw, 100vw" src="<?= $grills[0] ?>" srcset="<?= $grills[2] ?> 1280w, <?= $grills[1] ?> 800w, <?= $grills[0] ?> 320w"<?= $mimeTypeAttribute ?>>
	<?= implode("\n", $artistMetadata) ?>
	<link itemprop="contentUrl" href="<?= $grills[0] ?>"<?= $mimeTypeAttribute ?>>
	<link itemprop="contentUrl" href="<?= $grills[1] ?>"<?= $mimeTypeAttribute ?>>
	<link itemprop="contentUrl" href="<?= $grills[2] ?>"<?= $mimeTypeAttribute ?>>
	<meta itemprop="encodingFormat" content="<?= $grills["mime"] ?>">
	<figcaption><a href="<?= $grills["url"] ?>" itemprop="discussionUrl image mainEntityOfPage sameAs url" rel="external noopener" target="_blank">[Image Source]</a></figcaption>
</figure>