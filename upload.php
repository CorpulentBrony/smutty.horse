<?php
	session_start();

	/**
	 * Handles POST uploads, generates filenames, moves files around and commits
	 * uploaded metadata to database.
	 */

	require_once "classes/Response.class.php";
	require_once "classes/UploadException.class.php";
	require_once "classes/UploadedFile.class.php";
	require_once "includes/database.inc.php";

	/**
	 * Generates a random name for the file, retrying until we get an unused one.
	 *
	 * @param UploadedFile $file
	 *
	 * @return string
	 */
	function generateName($file)
	{
		global $doubledots;
		$ext = pathinfo($file->name, PATHINFO_EXTENSION);

		// Check if extension is a double-dot extension and, if true, override $ext
		$revname = strrev($file->name);
		foreach ($doubledots as $ddot) {
			if (stripos($revname, $ddot) === 0) {
				$ext = strrev($ddot);
			}
		}
		if (!isset($ext) || $ext === "")
			$ext = getMimeTypes()[$file->mime] ?? "";

		// get uniqid(), convert from hex to base 26, then take each digit and add 10 to it and convert to base 36, leading to all digits being from a-z
		$name = implode("", array_map(function(string $digit): string { return gmp_strval(gmp_add(gmp_init($digit, 26), 10), 36); }, str_split(gmp_strval(gmp_init(uniqid(), 16), 26))));

		if (isset($ext) && $ext !== "")
				$name .= ".{$ext}";
		return $name;
	}
	function getMimeTypes(): array {
		return apcu_entry("pomf_mimetypes", function(): array {
			$mimeTypes = explode(";", explode("}", explode("{", file_get_contents("/usr/local/nginx/mime.types"))[1])[0]);
			return array_reduce($mimeTypes, function(array $result, string $mimeType): array {
				$mimeType = trim($mimeType);

				if (empty($mimeType) || substr($mimeType, 0, 1) === "#")
					return $result;
				$mimeType = preg_replace("/\s+/", " ", $mimeType);
				list($type, $extension) = explode(" ", $mimeType);
				$result[$type] = $extension;
				return $result;
			}, []);
		});
	}
	function getFileByHashAndSize(string $hash, int $size) {
		global $db;
		$q = $db->prepare("SELECT filename, COUNT(*) AS count FROM files WHERE hash = (:hash) AND size = (:size) group by filename;");
		$q->bindValue(":hash", $hash, \PDO::PARAM_STR);
		$q->bindValue(":size", $size, \PDO::PARAM_INT);
		$q->execute();
		return $q->fetch();
	}
	/**
	 * Handles the uploading and db entry for a file.
	 *
	 * @param UploadedFile $file
	 *
	 * @return array
	 */
	function uploadFile($file, bool $checkIfUploaded = true)
	{
		global $db;
		global $FILTER_MODE;
		global $FILTER_MIME;

		// Handle file errors
		if ($file->error)
			throw new UploadException($file->error);

		// Check if mime type is blocked
		if (!empty($FILTER_MIME)) {
			if ($FILTER_MODE == true) { //whitelist mode
				if (!in_array($file->mime, $FILTER_MIME)) {
					throw new UploadException(UPLOAD_ERR_EXTENSION);
				}
			} else { //blacklist mode
				if (in_array($file->mime, $FILTER_MIME)) {
					throw new UploadException(UPLOAD_ERR_EXTENSION);
				}
			}
		}


		// Check if a file with the same hash and size (a file which is the same)
		// does already exist in the database; if it does, return the proper link
		// and data. PHP deletes the temporary file just uploaded automatically.
		$result = getFileByHashAndSize($file->getSha1(), $file->size);
		if ($result["count"] > 0) {
			return array(
				"hash" => $file->getSha1(),
				"name" => $file->name,
				"url" => POMF_URL.rawurlencode($result["filename"]),
				"size" => $file->size,
			);
		}

		// Generate a name for the file
		$newname = generateName($file);

		// Store the file"s full file path in memory
		$uploadFile = POMF_FILES_ROOT . $newname;

		// Attempt to move it to the static directory
		if ($checkIfUploaded) {
			if (!move_uploaded_file($file->tempfile, $uploadFile))
				throw new Exception(
					"Failed to move file to destination",
					500
				); // HTTP status code "500 Internal Server Error"
		}
		else
			if (!rename($file->tempfile, $uploadFile))
				throw new Exception("Failed to move file to destination", 500);

		// Need to change permissions for the new file to make it world readable
		if (!chmod($uploadFile, 0644)) {
			throw new Exception(
				"Failed to change file permissions",
				500
			); // HTTP status code "500 Internal Server Error"
		}

		// Add it to the database
		if (empty($_SESSION["id"])) {
			// Query if user is NOT logged in
			$q = $db->prepare("INSERT INTO files (hash, originalname, filename, size, date, " .
						"expire, delid) VALUES (:hash, :orig, :name, :size, :date, " .
							":exp, :del)");
		} else {
			// Query if user is logged in (insert user id together with other data)
			$q = $db->prepare("INSERT INTO files (hash, originalname, filename, size, date, " .
						"expire, delid, user) VALUES (:hash, :orig, :name, :size, :date, " .
							":exp, :del, :user)");
			$q->bindValue(":user", $_SESSION["id"], PDO::PARAM_INT);
		}

		// Common parameters binding
		$q->bindValue(":hash", $file->getSha1(), PDO::PARAM_STR);
		$q->bindValue(":orig", strip_tags($file->name), PDO::PARAM_STR);
		$q->bindValue(":name", $newname, PDO::PARAM_STR);
		$q->bindValue(":size", $file->size, PDO::PARAM_INT);
		$q->bindValue(":date", date("Y-m-d"), PDO::PARAM_STR);
		$q->bindValue(":exp", null, PDO::PARAM_STR);
		$q->bindValue(":del", sha1($file->tempfile), PDO::PARAM_STR);
		$q->execute();

		return array(
			"hash" => $file->getSha1(),
			"name" => $file->name,
			"url" => POMF_URL.rawurlencode($newname),
			"size" => $file->size,
		);
	}

	/**
	 * Reorder files array by file.
	 *
	 * @param  $_FILES
	 *
	 * @return array
	 */
	function diverseArray($files)
	{
		$result = array();

		foreach ($files as $key1 => $value1) {
			foreach ($value1 as $key2 => $value2) {
				$result[$key2][$key1] = $value2;
			}
		}

		return $result;
	}

	/**
	 * Reorganize the $_FILES array into something saner.
	 *
	 * @param  $_FILES
	 *
	 * @return array
	 */
	function refiles($files) {
		$result = array();
		$files = diverseArray($files);

		foreach ($files as $file)
			$result[] = new UploadedFile($file);
		return $result;
	}

	$type = isset($_GET["output"]) ? $_GET["output"] : "json";
	$response = new Response($type);

	if (isset($_FILES["files"])) {
		$uploads = refiles($_FILES["files"]);

		try {
			foreach ($uploads as $upload) {
				$res[] = uploadFile($upload);
			}
			$response->send($res);
		} catch (Exception $e) { $response->error($e->getCode(), $e->getMessage()); }
	} else if (isset($_GET["url"]) || isset($_GET["title"]) || isset($_GET["text"])) {
		$response = new Response("html");

		try {
			function getUrl($text): string {
				if (is_null($text))
					return "";
				preg_match("/https?:\/\/\S+\.\S+/i", $text, $matches);
				return $matches[0];
			}
			list("text" => $text, "title" => $title, "url" => $url) = $_GET;

			foreach ([$url, $text, $title] as $search) {
				$potentialUrl = getUrl($search);

				if (!empty($potentialUrl)) {
					$url = $potentialUrl;
					break;
				}
			}
			$temp = tempnam(sys_get_temp_dir(), "");
			unlink($temp);
			copy($url, $temp);
			$response->send([uploadFile(new UploadedFile(["name" => basename(parse_url($url, \PHP_URL_PATH)), "type" => mime_content_type($temp), "size" => filesize($temp), "tmp_name" => $temp, "error" => ""]), false)]);
		} catch (Exception $e) { $response->error($e->getCode(), $e->getMessage()); }
	}
	else if (isset($_GET["hash"])) {
		try {
			$result = getFileByHashAndSize($_GET["hash"], intval($_GET["size"]));

			if ($result["count"] > 0)
				$response->send([["hash" => $_GET["hash"], "name" => $_GET["name"], "url" => POMF_URL . rawurlencode($result["filename"]), "size" => $_GET["size"]]]);
			else
				$response->error(404, "File has not been uploaded yet.");
		} catch (Exception $e) { $response->error($e->getCode(), $e->getMessage()); }
	}
	else
		$response->error(400, "No input file(s)");
?>