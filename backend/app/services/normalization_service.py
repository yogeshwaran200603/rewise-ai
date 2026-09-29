import re
import logging
from typing import Optional, Tuple, Dict, Any, List
from statistics import median
from sqlalchemy.orm import Session
from app.models.models import Device, DeviceAlias

logger = logging.getLogger("NormalizationService")

# Canonical Problem Categories recognized in ReWise
VALID_PROBLEM_CATEGORIES = {
    "display": "Display",
    "screen": "Display",
    "touch": "Display",
    "glass": "Display",
    "amoled": "Display",
    "battery": "Battery",
    "drain": "Battery",
    "charging": "Charging",
    "charging_port": "Charging",
    "port": "Charging",
    "motherboard": "Motherboard",
    "board": "Motherboard",
    "logic_board": "Motherboard",
    "water_damage": "Water damage",
    "liquid": "Water damage",
    "camera": "Camera",
    "lens": "Camera",
    "speaker": "Speaker",
    "audio": "Speaker",
    "microphone": "Microphone",
    "mic": "Microphone",
    "software": "Software/OS",
    "os": "Software/OS",
}

VALID_CONDITIONS = {"excellent", "good", "fair", "damaged", "non_functional"}


class NormalizationService:
    """
    Normalizes device identifiers, validates scraped data against strict schema rules,
    and computes statistical price aggregation with provenance guarantees.
    """

    BRAND_MAP = {
        "apple": "Apple",
        "apple inc": "Apple",
        "apple inc.": "Apple",
        "samsung": "Samsung",
        "samsung electronics": "Samsung",
        "oneplus": "OnePlus",
        "oneplus technology": "OnePlus",
        "xiaomi": "Xiaomi",
        "xiaomi inc.": "Xiaomi",
        "mi": "Xiaomi",
        "redmi": "Redmi",
        "realme": "Realme",
        "vivo": "Vivo",
        "oppo": "OPPO",
        "motorola": "Motorola",
        "moto": "Motorola",
        "google": "Google",
        "nothing": "Nothing",
        "poco": "POCO",
        "iqoo": "iQOO",
    }

    @classmethod
    def normalize_brand(cls, raw_brand: str) -> str:
        """Normalizes brand names (e.g. 'Apple Inc.' -> 'Apple')."""
        if not raw_brand:
            return "Other"
        b = raw_brand.strip()
        b_lower = b.lower()
        if b_lower in cls.BRAND_MAP:
            return cls.BRAND_MAP[b_lower]
        for key, val in cls.BRAND_MAP.items():
            if key in b_lower:
                return val
        return b.title()

    @classmethod
    def normalize_model_name(cls, brand: str, raw_model: str) -> str:
        """
        Normalizes model names while strictly preserving genuinely different models:
        'Apple iPhone 13 5G' -> 'iPhone 13'
        'iPhone 13 Pro' -> 'iPhone 13 Pro' (NOT merged with iPhone 13)
        'iPhone 13 Pro Max' -> 'iPhone 13 Pro Max'
        """
        s = raw_model.strip()
        # Strip redundant leading brand name if present
        b_pattern = rf"^{re.escape(brand)}\s+"
        s = re.sub(b_pattern, "", s, flags=re.IGNORECASE)
        # Strip carrier / generic network suffixes like 5G, 4G, LTE when standalone at end
        s = re.sub(r"\s+\b(?:5G|4G|LTE)\b$", "", s, flags=re.IGNORECASE)
        # Remove parenthesized storage or color
        s = re.sub(r"\s*\(\s*\d+\s*(?:GB|TB)\s*\)", "", s, flags=re.IGNORECASE)
        s = re.sub(r"\s*\(\s*[^)]+\s*\)", "", s)
        s = re.sub(r"\s+", " ", s).strip()
        return s

    @staticmethod
    def normalize_storage_options(raw_storage: Any) -> List[str]:
        """Normalizes storage variants into a standard list, e.g. ['128GB', '256GB', '512GB']."""
        if not raw_storage:
            return ["128GB", "256GB"]
        if isinstance(raw_storage, list):
            items = []
            for item in raw_storage:
                val = str(item).strip()
                if not val.upper().endswith("GB") and not val.upper().endswith("TB") and val.isdigit():
                    val = f"{val}GB"
                if val:
                    items.append(val)
            return sorted(list(dict.fromkeys(items)))
        elif isinstance(raw_storage, str):
            parts = [p.strip() for p in raw_storage.split(",") if p.strip()]
            return sorted(list(dict.fromkeys(parts)))
        return ["128GB", "256GB"]

    @staticmethod
    def clean_model_string(raw_model: str) -> str:
        """Strips storage suffixes, color names, and network badges from model string."""
        s = raw_model.strip()
        # Remove patterns like (128GB), 256GB, 5G, 4G, Space Gray, Phantom Black
        s = re.sub(r"\b\d+\s*(?:GB|TB)\b", "", s, flags=re.IGNORECASE)
        s = re.sub(r"\b(?:5G|4G|LTE)\b", "", s, flags=re.IGNORECASE)
        s = re.sub(r"\b(?:Blue|Black|Green|White|Red|Purple|Gold|Silver|Midnight|Starlight|Phantom|Titanium)\b", "", s, flags=re.IGNORECASE)
        s = re.sub(r"[\(\)]", "", s)
        s = re.sub(r"\s+", " ", s).strip()
        return s

    @classmethod
    def resolve_canonical_device(
        cls,
        db: Session,
        brand: str,
        raw_model: str
    ) -> Tuple[Optional[Device], str, str]:
        """
        Resolves a scraped brand & raw model string to a canonical Device in the database.
        Checks aliases first, then exact matches, then cleaned name matching.
        """
        cleaned_model = cls.clean_model_string(raw_model)
        b_clean = brand.strip()

        # 1. Exact alias lookup
        alias = db.query(DeviceAlias).filter(
            DeviceAlias.alias_name.ilike(raw_model.strip())
        ).first()
        if alias and alias.device:
            return alias.device, alias.device.brand, alias.device.model

        # 2. Exact device model match
        dev = db.query(Device).filter(
            Device.brand.ilike(b_clean),
            Device.model.ilike(raw_model.strip())
        ).first()
        if dev:
            return dev, dev.brand, dev.model

        # 3. Cleaned device model match
        dev = db.query(Device).filter(
            Device.brand.ilike(b_clean),
            Device.model.ilike(cleaned_model)
        ).first()
        if dev:
            return dev, dev.brand, dev.model

        # 4. Partial substring match
        candidates = db.query(Device).filter(Device.brand.ilike(b_clean)).all()
        for cand in candidates:
            if cand.model.lower() in raw_model.lower() or cleaned_model.lower() in cand.model.lower():
                return cand, cand.brand, cand.model

        return None, b_clean, cleaned_model

    @staticmethod
    def normalize_problem_category(raw_category: str) -> str:
        """Normalizes freeform problem category to standard ReWise taxonomy."""
        cleaned = raw_category.strip().lower().replace(" ", "_").replace("-", "_")
        for key, canonical in VALID_PROBLEM_CATEGORIES.items():
            if key in cleaned:
                return canonical
        return "Other"

    # -------------------------------------------------------------------------
    # Validation Rules (Ethical Provenance & Schema Enforcement)
    # -------------------------------------------------------------------------
    @staticmethod
    def validate_device_record(data: Dict[str, Any]) -> Tuple[bool, str]:
        """Validates scraped device hardware specifications."""
        brand = data.get("brand")
        model = data.get("model")
        source_url = data.get("source_url")

        if not brand or not str(brand).strip():
            return False, "Missing or blank 'brand'"
        if not model or not str(model).strip():
            return False, "Missing or blank 'model'"
        if not source_url or not str(source_url).startswith("http"):
            return False, "Missing or invalid 'source_url' (must start with http/https)"

        release_year = data.get("release_year")
        if release_year is not None:
            try:
                yr = int(release_year)
                if yr < 2018 or yr > 2027:
                    return False, f"Release year {yr} out of expected range (2018-2027)"
            except (ValueError, TypeError):
                return False, f"Invalid release_year format: {release_year}"

        return True, "Valid"

    @staticmethod
    def validate_repair_record(data: Dict[str, Any]) -> Tuple[bool, str]:
        """Validates scraped repair price entry."""
        brand = data.get("brand")
        model = data.get("model")
        source_url = data.get("source_url")
        part_price = data.get("part_price")

        if not brand or not model:
            return False, "Missing 'brand' or 'model'"
        if not source_url or not str(source_url).startswith("http"):
            return False, "Missing or invalid 'source_url'"
        if part_price is None:
            return False, "Missing 'part_price'"
        try:
            val = float(part_price)
            if val <= 0:
                return False, f"'part_price' must be strictly positive (got {val})"
        except (ValueError, TypeError):
            return False, f"Invalid 'part_price' value: {part_price}"

        return True, "Valid"

    @staticmethod
    def validate_resale_record(data: Dict[str, Any]) -> Tuple[bool, str]:
        """Validates secondary marketplace price listing."""
        brand = data.get("brand")
        model = data.get("model")
        source_url = data.get("source_url")
        low = data.get("estimated_price_low")
        high = data.get("estimated_price_high")

        if not brand or not model:
            return False, "Missing 'brand' or 'model'"
        if not source_url or not str(source_url).startswith("http"):
            return False, "Missing or invalid 'source_url'"

        try:
            low_f = float(low) if low is not None else 0.0
            high_f = float(high) if high is not None else 0.0
            if low_f <= 0 or high_f <= 0:
                return False, f"Resale bounds must be positive (low={low}, high={high})"
            if low_f > high_f:
                return False, f"estimated_price_low ({low_f}) > estimated_price_high ({high_f})"
        except (ValueError, TypeError):
            return False, f"Invalid numeric price values (low={low}, high={high})"

        return True, "Valid"

    @staticmethod
    def validate_service_center_record(data: Dict[str, Any]) -> Tuple[bool, str]:
        """Validates authorized service center listing."""
        name = data.get("name")
        address = data.get("address")
        city = data.get("city")
        source_url = data.get("source_url")

        if not name or not str(name).strip():
            return False, "Missing center 'name'"
        if not address or not str(address).strip():
            return False, "Missing center 'address'"
        if not city or not str(city).strip():
            return False, "Missing center 'city'"
        if not source_url or not str(source_url).startswith("http"):
            return False, "Missing or invalid 'source_url'"

        lat = data.get("latitude")
        lon = data.get("longitude")
        if lat is not None and lon is not None:
            try:
                lat_f = float(lat)
                lon_f = float(lon)
                # India geographical bounding box: lat 6 to 38, lon 68 to 98
                if not (6.0 <= lat_f <= 38.0 and 68.0 <= lon_f <= 98.0):
                    return False, f"Coordinates outside India bounding box: ({lat_f}, {lon_f})"
            except (ValueError, TypeError):
                return False, f"Invalid latitude/longitude: ({lat}, {lon})"

        return True, "Valid"

    @staticmethod
    def validate_recycling_center_record(data: Dict[str, Any]) -> Tuple[bool, str]:
        """Validates CPCB / State PCB registered recycling center listing."""
        name = data.get("name")
        address = data.get("address")
        city = data.get("city")
        source_url = data.get("source_url")

        if not name or not str(name).strip():
            return False, "Missing recycler 'name'"
        if not address or not str(address).strip():
            return False, "Missing recycler 'address'"
        if not city or not str(city).strip():
            return False, "Missing recycler 'city'"
        if not source_url or not str(source_url).startswith("http"):
            return False, "Missing or invalid 'source_url'"

        return True, "Valid"

    # -------------------------------------------------------------------------
    # Statistical Aggregation (Price Truth Policy)
    # -------------------------------------------------------------------------
    @staticmethod
    def aggregate_prices(observed_prices: List[float]) -> Dict[str, float]:
        """
        Never present a single scraped price as absolute truth.
        Computes min_observed, max_observed, median_price, and count.
        """
        valid_prices = [p for p in observed_prices if p is not None and p > 0]
        if not valid_prices:
            return {
                "min_observed": 0.0,
                "max_observed": 0.0,
                "median_price": 0.0,
                "source_count": 0,
            }

        valid_prices.sort()
        return {
            "min_observed": round(min(valid_prices), 2),
            "max_observed": round(max(valid_prices), 2),
            "median_price": round(float(median(valid_prices)), 2),
            "source_count": len(valid_prices),
        }
