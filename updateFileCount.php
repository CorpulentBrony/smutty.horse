#!/usr/local/bin/php
<?php
	ini_set("zlib.output_compression", 0);
	error_reporting(E_ALL);
	ini_set("display_errors", 1);

	require_once "includes/database.inc.php";

	const BYTE_SCALE = 2;
	const BYTE_UNIT_POWERS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	const DESTINATION_FILE_NAME = "file_count.html";
	const SQL = "select count(*) as NumFiles, sum(size) as TotalFileSize, sum(views) as NumViews, sum(case when views = 0 then 1 else views end * size) as TotalViews from files;";

	interface DataInterface {
		public function getDisplayUnit(): string;
		public function getDisplayValue(): string;
		public function getValue(): string;
		public function toHtml(array $attributes): string;
		public function toString(string $separator): string;
		public function __toString(): string;
	}
	class Data implements DataInterface {
		protected static function arrayToAttributes(array $attributes): string {
			return " " . implode(" ", array_map(function(string $key, $value): string { return "{$key}=\"" . strval($value) . "\""; }, array_keys($attributes), array_values($attributes)));
		}
		protected static function formatToScale(int $scale, string $number): string {
			$numberParts = explode(".", $number);
			$integer = $numberParts[0];
			$fraction = $numberParts[1] ?? "0";

			if ($fraction !== "")
				$fraction = substr(bcmul("1", "0.{$fraction}", $scale), 1);
			$numDigits = strlen($integer);

			if ($numDigits > 3) {
				$integerRev = strrev($integer);
				$integer = substr($integerRev, 0, 3);

				for ($i = 3; $i < $numDigits; $i += 3)
					$integer .= "," . substr($integerRev, $i, 3);
				$integer = strrev($integer);
			}
			return "{$integer}{$fraction}";
		}

		protected $value = "0";
		private $displayValue;

		public function __construct(string $value = "0") { $this->value = $value; }
		public function getDisplayUnit(): string { return ""; }
		public function getDisplayValue(): string {
			if (!is_null($this->displayValue))
				return $this->displayValue;
			return $this->displayValue = self::formatToScale(0, $this->getValue());
		}
		public function getValue(): string { return $this->value; }
		public function toHtml(array $attributes = []): string { return "<data" . self::arrayToAttributes($attributes) . " value=\"{$this->getValue()}\">" . static::toString() . "</data>"; }
		public function toString(string $separator = ""): string { return $this->getDisplayValue() . $separator . $this->getDisplayUnit(); }
		public function __toString(): string { return $this->toString(""); }
	}
	class ByteData extends Data {
		private static $byteUnits;

		private static function getByteUnits(): \Ds\Sequence {
			if (!is_null(self::$byteUnits))
				return self::$byteUnits;
			$base = gmp_init(1024, 10);
			$result = new \Ds\Map();

			foreach (BYTE_UNIT_POWERS as $i => $unit)
				$result->put(gmp_pow($base, $i), $unit);
			return self::$byteUnits = $result->pairs();
		}

		protected $value = "0";
		private $displayParameter;
		private $displayUnit;
		private $displayValue;

		public function __construct(string $value = "0") { $this->value = $value; }
		private function getDisplayParameter(): \Ds\Pair {
			if (!is_null($this->displayParameter))
				return $this->displayParameter;
			$value = gmp_init($this->getValue(), 10);
			$byteUnits = self::getByteUnits();

			for ($i = 1, $numUnits = count($byteUnits); $i < $numUnits; $i++)
				if (gmp_cmp($value, $byteUnits->get($i)->key) < 1)
					return $this->displayParameter = $byteUnits->get($i - 1);
			return $this->displayParameter = $byteUnits->last();
		}
		public function getDisplayUnit(): string {
			if (!is_null($this->displayUnit))
				return $this->displayUnit;
			return $this->displayUnit = $this->getDisplayParameter()->value;
		}
		public function getDisplayValue(): string {
			if (!is_null($this->displayValue))
				return $this->displayValue;
			$divisor = gmp_strval($this->getDisplayParameter()->key);
			$scale = ($divisor === "1") ? 0 : BYTE_SCALE;
			$displayValue = bcdiv($this->getValue(), $divisor, $scale);
			return $this->displayValue = (bccomp($displayValue, "1000") >= 0) ? parent::formatToScale($scale, $displayValue) : $displayValue;
		}
		public function toString(string $separator = "&nbsp;"): string { return parent::toString($separator); }
		public function __toString(): string { return $this->toString(" "); }
	}

	list($numFiles, $totalFileSize, $numViews, $totalViewSize) = $db->query(SQL)->fetch();
	$numFiles = new Data($numFiles);
	$totalFileSize = new ByteData($totalFileSize);
	$numViews = new Data($numViews);
	$totalViewSize = new ByteData($totalViewSize);
	ob_implicit_flush(false);
	ob_start();
?>
<aside class="alert file-count">
	<strong>
		<span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
			<link href="https://schema.org/ReceiveAction" itemprop="interactionType">
			Currently hosting <?= $numFiles->toHtml(["itemprop" => "userInteractionCount"]) ?> files (<?= $totalFileSize->toHtml() ?>)
		</span><br>
		<span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
			<link href="https://schema.org/ViewAction" itemprop="interactionType">
			Files viewed <?= $numViews->toHtml(["itemprop" => "userInteractionCount"]) ?> times (<?= $totalViewSize->toHtml() ?> transferred)
		</span>
	</strong>
</aside>
<?php
	file_put_contents(DESTINATION_FILE_NAME, ob_get_contents());
	ob_end_clean();
?>