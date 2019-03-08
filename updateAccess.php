#!/usr/local/bin/php
<?php
	ini_set("zlib.output_compression", 0);
	error_reporting(E_ALL);
	ini_set("display_errors", 1);

	require_once "includes/database.inc.php";
	require_once "vendor/autoload.php";

	const BUCKET = "logs.smutty.horse";
	const SQL = "update `files` set views = views + 1, lastview = case when coalesce(lastview, '1900-01-01') > :lastview then lastview else :lastview end where filename = :filename;";

	$files = [];
	$s3 = new \Aws\S3\S3Client(["region" => "us-east-1", "version" => "latest"]);
	$tempDir = sys_get_temp_dir();
	$s3->listObjectsV2Async(["Bucket" => BUCKET, "MaxKeys" => 100])
		->then(function($result) use (&$files, $s3, $tempDir): \GuzzleHttp\Promise\Promise {
			if (is_null($result["Contents"]))
				die;
			$files = array_map(function(array $object): string { return $object["Key"]; }, $result["Contents"]);
			$promises = array_map(function(string $fileName) use ($s3, $tempDir): \GuzzleHttp\Promise\Promise { return $s3->getObjectAsync(["Bucket" => BUCKET, "Key" => $fileName, "SaveAs" => "{$tempDir}/{$fileName}"]); }, $files);
			return \GuzzleHttp\Promise\all($promises);
		})
		->then(function() use ($db, &$files, $s3, $tempDir): \GuzzleHttp\Promise\Promise {
			$promises = [];

			foreach ($files as $baseName) {
				$fileName = "{$tempDir}/{$baseName}";

				if (($file = fopen("compress.zlib://{$fileName}", "r")) !== false) {
					while (fgetc($file) === "#")
						fgets($file);
					fseek($file, -1, \SEEK_CUR);
					$lines = [];

					while (($line = fgetcsv($file, 0, "\t")) !== false)
						$lines[] = [new \DateTime("{$line[0]}T{$line[1]}"), substr($line[7], 1)];
					fclose($file);

					foreach ($lines as $line) {
						$query = $db->prepare(SQL);
						$query->bindValue(":filename", $lines[0][1], \PDO::PARAM_STR);
						$query->bindValue(":lastview", $lines[0][0]->format("Y-m-d\TH:i:s"), \PDO::PARAM_STR);
						$query->execute();
					}
				}
				unlink($fileName);
				$promises[] = $s3->deleteObjectAsync(["Bucket" => BUCKET, "Key" => $baseName]);
			}
			return \GuzzleHttp\Promise\all($promises);
		})
		->otherwise(function($error): void { throw new \Exception($error); })
		->wait();
?>