import re
import logging
from typing import List, Dict, Any, Optional, Tuple, Set
from app.schemas.schemas import (
    ExtractedSymptom,
    ExtractedEvent,
    ExtractedDeviceContext,
    NLPReasoningOutput,
)

logger = logging.getLogger("NLPReasoningService")

# ---------------------------------------------------------------------------
# 1. TYPO & ABBREVIATION DICTIONARY
# ---------------------------------------------------------------------------
COMMON_TYPOS = {
    r"\bdisply\b": "display",
    r"\bscrin\b": "screen",
    r"\bscren\b": "screen",
    r"\bdisple\b": "display",
    r"\bbattry\b": "battery",
    r"\bbtry\b": "battery",
    r"\bbatry\b": "battery",
    r"\bchrg\b": "charge",
    r"\bchargr\b": "charger",
    r"\bchargng\b": "charging",
    r"\bcamra\b": "camera",
    r"\bcmra\b": "camera",
    r"\bspkr\b": "speaker",
    r"\bspekr\b": "speaker",
    r"\bmoble\b": "mobile",
    r"\bfon\b": "phone",
    r"\bphne\b": "phone",
    r"\bswtch\b": "switch",
    r"\bgrn\b": "green",
    r"\bgren\b": "green",
    r"\bblck\b": "black",
    r"\bblak\b": "black",
    r"\bflickrg\b": "flickering",
    r"\bdrpd\b": "dropped",
    r"\bwtr\b": "water",
}

# ---------------------------------------------------------------------------
# 2. TANGLISH & REGIONAL SLANG PHRASE NORMALIZER
# ---------------------------------------------------------------------------
TANGLISH_PHRASES: List[Tuple[str, str]] = [
    # Display & Touch
    (r"\b(?:mobile\s+|phone\s+)?display\s*(?:pochu|poiruchu|poiduchu)\b", "screen cracked black failure"),
    (r"\bscreen\s*(?:pochu|poiruchu|poiduchu)\b", "screen cracked black failure"),
    (r"\btouch\s*(?:velai\s*seiyala|work\s*aagala|work\s*agala|varala)\b", "touch not working"),
    (r"\btouch\s*(?:appo\s*appo|sometimes)\s*(?:velai\s*seiyudhu|works)\b", "touch sometimes works"),
    (r"\bglass\s*(?:udanjiduchu|udanjuduchu|odanjiduchu)\b", "glass broken cracked"),
    (r"\bdisplay\s*la\s*kodu\s*vanthuruchu\b", "display vertical green line"),
    (r"\bdisplay\s*line\s*(?:varuthu|varudhu|vanthuruchu|vanthiruchu)\b", "display vertical green line"),
    (r"\bgreen\s*line\s*(?:vanthuruchu|vanthiruchu|came|varuthu|varudhu)\b", "green line came"),

    # Charging & Power
    (r"\bcharger\s*connect\s*panna\s*charge\s*aagala\b", "charger not detected charging failure"),
    (r"\bcharge\s*(?:aagala|agala|eradha|eramaatengudhu|aagamatinguthu)\b", "charging failure not charging"),
    (r"\bcharging\s*(?:romba\s*)?slow\s*(?:a|aa)?\s*(?:erudhu|iruku)\b", "slow charging"),
    (r"\bcharging\s*(?:podumbothu|panumbothu)\s*(?:heat|suda)\s*aaguthu\b", "charging overheating phone heating"),
    (r"\bphone\s*switch\s*on\s*(?:aagala|agala|aagamatinguthu)\b", "phone dead no power switch on aagala"),
    (r"\bphone\s*on\s*(?:aagala|agala)\b", "phone dead no power"),
    (r"\bphone\s*restart\s*aagite\s*iruku\b", "phone restart continuous boot loop"),
    (r"\brestart\s*aagite\s*iruku\b", "phone restart continuous boot loop"),
    (r"\bphone\s*dead\s*(?:aaiduchu|aiduchu)\b", "phone dead no power"),

    # Battery & Heat
    (r"\bbattery\s*(?:romba\s*)?(?:seekiram|seekirama)\s*(?:theerudhu|theerithu|drain\s*aagudhu)\b", "battery drains fast abnormal drain"),
    (r"\bphone\s*(?:suda\s*aaguthu|heat\s*aaguthu|over\s*heat\s*aaguthu)\b", "phone heating overheating"),
    (r"\bbattery\s*(?:uppiduchu|veengiduchu)\b", "battery swelling swollen"),

    # Water & Physical Drops
    (r"\b(?:phone\s*)?water\s*la\s*(?:vizhunthuchu|vizhundhuduchu|vizhndhuchu|potuten)\b", "dropped in water liquid exposure"),
    (r"\bthanni\s*la\s*(?:vizhunthuchu|vizhundhuduchu|potuten)\b", "dropped in water liquid exposure"),
    (r"\bmazhai\s*la\s*nananjiduchu\b", "got wet in rain liquid exposure"),
    (r"\b(?:keezha|keela)\s*(?:vizhunthuchu|vizhundhuduchu|pottuten|potuten)\b", "phone fell down dropped"),
    (r"\bdown\s*la\s*(?:vizhunthuchu|vizhundhuduchu)\b", "phone fell down dropped"),

    # Audio & Camera & Signal
    (r"\bspeaker\s*sound\s*(?:kekala|varala|pochu|low)\b", "speaker sound low speaker no sound"),
    (r"\bpesuradhu\s*kekala\b", "mic not working caller cannot hear"),
    (r"\bmic\s*(?:velai\s*seiyala|work\s*aagala)\b", "mic not working"),
    (r"\bsim\s*(?:kaatala|detect\s*aagala)\b", "sim not detected"),
    (r"\bsim\s*signal\s*(?:pochu|varala)\b", "sim signal pochu no signal"),
    (r"\bcamera\s*open\s*panna\s*black\s*screen\s*(?:varuthu|varudhu)\b", "camera black screen camera failure"),
    (r"\bcamera\s*(?:open\s*aagala|blur\s*a\s*iruku)\b", "camera not opening camera blur"),
]

# ---------------------------------------------------------------------------
# 3. SYMPTOM TAXONOMY (All 10 Categories Defined in Section 4)
# ---------------------------------------------------------------------------
SYMPTOM_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # DISPLAY
    "cracked_screen": {
        "category": "Display",
        "description": "Cracked front screen or AMOLED matrix fracture",
        "patterns": [
            r"(?:screen|display)\s+(?:is\s+)?(?:cracked|broken|shattered|damaged)",
            r"(?:cracked|broken|shattered)\s+(?:screen|display)",
        ],
        "severity": "Moderate",
    },
    "broken_glass": {
        "category": "Display",
        "description": "Front protective glass broken while digitizer is intact",
        "patterns": [
            r"glass\s+(?:is\s+)?(?:broken|cracked|fractured)",
            r"(?:broken|cracked)\s+glass",
        ],
        "severity": "Minor",
    },
    "black_screen": {
        "category": "Display",
        "description": "Display panel produces no image (screen gone black)",
        "patterns": [
            r"screen\s+(?:has\s+)?(?:gone|went|is)\s+black",
            r"black\s+screen",
            r"blank\s+screen",
            r"no\s+display",
        ],
        "severity": "Moderate",
    },
    "white_screen": {
        "category": "Display",
        "description": "Display panel shows static white light without graphics",
        "patterns": [
            r"screen\s+(?:has\s+)?(?:gone|went|is)\s+white",
            r"white\s+screen",
        ],
        "severity": "Moderate",
    },
    "display_vertical_line": {
        "category": "Display",
        "description": "Vertical green or colored line on display panel",
        "patterns": [
            r"(?:green|black|colored|vertical|horizontal|pink|white)\s+lines?",
            r"vertical\s+lines?",
            r"black\s+lines?",
            r"(?:screen|display)\s+has\s+(?:.*?\s+)?lines?",
            r"lines?\s+on\s+(?:the\s+)?(?:screen|display)",
        ],
        "severity": "Moderate",
    },
    "green_line": {
        "category": "Display",
        "description": "Vertical green line on display",
        "patterns": [
            r"green\s+lines?",
            r"vertical\s+green\s+lines?",
            r"green\s+line\s+came",
            r"green\s+stripe",
        ],
        "severity": "Moderate",
    },
    "pink_line": {
        "category": "Display",
        "description": "Vertical pink line on display",
        "patterns": [
            r"pink\s+lines?",
            r"vertical\s+pink\s+lines?",
        ],
        "severity": "Moderate",
    },
    "flickering": {
        "category": "Display",
        "description": "Rapid screen flickering or luminance instability",
        "patterns": [
            r"screen\s+(?:is\s+)?flickering",
            r"display\s+(?:is\s+)?flickering",
            r"\bflickering\b",
        ],
        "severity": "Moderate",
    },
    "dead_pixels": {
        "category": "Display",
        "description": "Dead pixel cluster or localized black ink bleed",
        "patterns": [
            r"dead\s+pixels?",
            r"ink\s+bleed",
            r"black\s+spot\s+on\s+screen",
        ],
        "severity": "Moderate",
    },
    "brightness_problem": {
        "category": "Display",
        "description": "Backlight sensor or display brightness failure",
        "patterns": [
            r"brightness\s+(?:problem|issue|low)",
            r"screen\s+dim",
        ],
        "severity": "Minor",
    },
    "touch_failure": {
        "category": "Display",
        "description": "Capacitive touch digitizer failure",
        "patterns": [
            r"touch\s+(?:is\s+)?(?:not\s+working|unresponsive|dead|failing|not\s+responding)",
            r"no\s+touch\s+response",
            r"touch\s+stopped",
        ],
        "severity": "Moderate",
    },
    "ghost_touch": {
        "category": "Display",
        "description": "Erratic phantom screen taps and ghost touch",
        "patterns": [
            r"ghost\s+touch",
            r"automatic\s+touch",
            r"screen\s+tapping\s+itself",
        ],
        "severity": "Moderate",
    },
    "intermittent_touch": {
        "category": "Display",
        "description": "Touch response intermittent or occasionally working",
        "patterns": [
            r"touch\s+(?:sometimes\s+works|works\s+sometimes)",
            r"sometimes\s+touch\s+(?:is\s+)?(?:not\s+working|working)",
            r"intermittent\s+touch",
        ],
        "severity": "Moderate",
    },

    # BATTERY
    "battery_fast_drain": {
        "category": "Battery",
        "description": "Battery depleting at abnormally rapid rate",
        "patterns": [
            r"battery\s+(?:is\s+)?(?:draining|drains)\s*(?:very\s+)?fast",
            r"fast\s+drain",
            r"battery\s+draining",
            r"draining\s+(?:very\s+)?fast",
            r"battery\s+dying\s+fast",
        ],
        "severity": "Moderate",
    },
    "fast_drain": {
        "category": "Battery",
        "description": "Battery depleting at abnormally rapid rate",
        "patterns": [
            r"battery\s+(?:is\s+)?(?:draining|drains)\s*(?:very\s+)?fast",
            r"fast\s+drain",
            r"draining\s+(?:very\s+)?fast",
            r"battery\s+dying\s+fast",
        ],
        "severity": "Moderate",
    },
    "battery_swelling": {
        "category": "Battery",
        "description": "Swollen lithium battery expanding back cover",
        "patterns": [
            r"battery\s+(?:is\s+)?(?:swollen|swelling|bulging|puffed)",
            r"swollen\s+battery",
            r"back\s+cover\s+(?:popping|bulging)",
        ],
        "severity": "Critical",
    },
    "overheating": {
        "category": "Battery",
        "description": "Abnormal device surface temperature or overheating",
        "patterns": [
            r"(?:phone|device)\s+(?:is\s+)?(?:getting|gets|becoming|becomes)?\s*(?:extremely\s+|very\s+)?(?:hot|warm|heating|overheating)",
            r"(?:heating|hot|overheating)\s+(?:while|during|when)\s+charging",
            r"charging\s+(?:overheating|heating)",
            r"phone\s+heating",
            r"\boverheating\b",
        ],
        "severity": "Moderate",
    },
    "charging_percentage_stuck": {
        "category": "Battery",
        "description": "Battery charge percentage frozen",
        "patterns": [
            r"percentage\s+stuck",
            r"battery\s+stuck",
            r"charging\s+percentage\s+stuck",
        ],
        "severity": "Minor",
    },
    "sudden_shutdown": {
        "category": "Battery",
        "description": "Sudden unexpected system power shutdown",
        "patterns": [
            r"sudden\s+shutdown",
            r"shuts\s+down\s+suddenly",
            r"turns\s+off\s+randomly",
        ],
        "severity": "Moderate",
    },
    "battery_not_charging": {
        "category": "Battery",
        "description": "Battery fails to accumulate charge",
        "patterns": [
            r"battery\s+(?:is\s+)?not\s+charging",
            r"plugged\s+in\s+not\s+charging",
        ],
        "severity": "Moderate",
    },

    # CHARGING
    "charging_failure": {
        "category": "Charging",
        "description": "Device fails to accept charge from charger",
        "patterns": [
            r"(?:charge|charging)\s+(?:is\s+)?(?:failure|not\s+working|agala|aagala)",
            r"(?:phone|device)\s+not\s+charging",
            r"won't\s+charge",
        ],
        "severity": "Moderate",
    },
    "slow_charging": {
        "category": "Charging",
        "description": "Charging speed degraded significantly",
        "patterns": [
            r"charging\s+(?:is\s+)?slow",
            r"slow\s+charging",
        ],
        "severity": "Minor",
    },
    "intermittent_charging": {
        "category": "Charging",
        "description": "Charging connection loose and intermittent",
        "patterns": [
            r"intermittent\s+charging",
            r"charges\s+on\s+and\s+off",
        ],
        "severity": "Minor",
    },
    "loose_port": {
        "category": "Charging",
        "description": "Loose charging port connector",
        "patterns": [
            r"loose\s+(?:port|cable|pin)",
            r"charging\s+port\s+loose",
        ],
        "severity": "Minor",
    },
    "charger_not_detected": {
        "category": "Charging",
        "description": "Charger connection not detected by phone",
        "patterns": [
            r"charger\s+(?:is\s+)?not\s+detected",
            r"charger\s+connect\s+panna\s+charge\s+aagala",
        ],
        "severity": "Minor",
    },

    # POWER
    "no_power": {
        "category": "Power",
        "description": "Device dead with zero power response",
        "patterns": [
            r"(?:phone|device)\s+(?:is\s+)?(?:dead|totally\s+dead)",
            r"phone\s+dead",
            r"no\s+power",
            r"(?:phone\s+)?switch\s+on\s+aagala",
            r"won't\s+turn\s+on",
            r"will\s+not\s+turn\s+on",
        ],
        "severity": "Critical",
    },
    "boot_loop": {
        "category": "Power",
        "description": "Continuous restart or boot loop",
        "patterns": [
            r"boot\s*loop",
            r"restart\s+continuous",
            r"phone\s+restart\s+aagite\s+iruku",
            r"restarting\s+again\s+and\s+again",
        ],
        "severity": "Moderate",
    },
    "random_restart": {
        "category": "Power",
        "description": "Random unprovoked system reboot",
        "patterns": [
            r"random\s+restart",
            r"restarts\s+randomly",
        ],
        "severity": "Moderate",
    },
    "stuck_on_logo": {
        "category": "Power",
        "description": "System frozen on brand startup logo",
        "patterns": [
            r"stuck\s+on\s+(?:brand\s+|apple\s+|samsung\s+)?logo",
            r"frozen\s+on\s+logo",
        ],
        "severity": "Moderate",
    },

    # CAMERA
    "camera_not_opening": {
        "category": "Camera",
        "description": "Camera application fails to open or crashes",
        "patterns": [
            r"camera\s+(?:is\s+)?not\s+opening",
            r"camera\s+crashes",
        ],
        "severity": "Moderate",
    },
    "blurry_camera": {
        "category": "Camera",
        "description": "Camera preview or capture out of focus / blurry",
        "patterns": [
            r"camera\s+blur",
            r"blurry\s+camera",
            r"camera\s+(?:is\s+)?blurry",
        ],
        "severity": "Minor",
    },
    "black_camera": {
        "category": "Camera",
        "description": "Camera viewfinder displays complete blackness",
        "patterns": [
            r"black\s+camera",
            r"camera\s+shows\s+black",
            r"camera\s+(?:app\s+)?(?:shows\s+|is\s+|open\s+panna\s+)?black\s*screen",
            r"camera\s+black\s+screen",
        ],
        "severity": "Moderate",
    },
    "focus_failure": {
        "category": "Camera",
        "description": "Autofocus or OIS mechanism vibrating/failing",
        "patterns": [
            r"focus\s+failure",
            r"autofocus\s+not\s+working",
            r"camera\s+shaking",
        ],
        "severity": "Moderate",
    },

    # AUDIO
    "speaker_no_sound": {
        "category": "Audio",
        "description": "Speaker produces no audio",
        "patterns": [
            r"speaker\s+(?:sound\s+)?(?:low|no\s+sound|not\s+working)",
            r"no\s+sound\s+from\s+speaker",
        ],
        "severity": "Minor",
    },
    "low_volume": {
        "category": "Audio",
        "description": "Loudspeaker or earpiece output extremely low",
        "patterns": [
            r"speaker\s+sound\s+low",
            r"volume\s+(?:is\s+)?(?:very\s+)?low",
            r"sound\s+low",
        ],
        "severity": "Minor",
    },
    "distorted_audio": {
        "category": "Audio",
        "description": "Audio crackling, buzzing, or heavily distorted",
        "patterns": [
            r"distorted\s+audio",
            r"crackling\s+sound",
        ],
        "severity": "Minor",
    },
    "microphone_failure": {
        "category": "Audio",
        "description": "Primary mic failure; voice inaudible to callers",
        "patterns": [
            r"mic\s+(?:is\s+)?not\s+working",
            r"microphone\s+failure",
            r"caller\s+cannot\s+hear",
        ],
        "severity": "Minor",
    },

    # NETWORK
    "no_signal": {
        "category": "Network",
        "description": "Cellular signal lost or sim signal pochu",
        "patterns": [
            r"no\s+signal",
            r"no\s+network",
            r"sim\s+signal\s+pochu",
        ],
        "severity": "Moderate",
    },
    "sim_not_detected": {
        "category": "Network",
        "description": "SIM card inserted but not detected by hardware",
        "patterns": [
            r"sim\s+(?:card\s+)?(?:is\s+)?not\s+detected",
            r"no\s+sim\s+card",
        ],
        "severity": "Minor",
    },
    "wifi_failure": {
        "category": "Network",
        "description": "WiFi interface failing to connect or scan",
        "patterns": [
            r"wifi\s+(?:is\s+)?not\s+connecting",
            r"wifi\s+failure",
        ],
        "severity": "Minor",
    },
    "bluetooth_failure": {
        "category": "Network",
        "description": "Bluetooth pairing or discovery failure",
        "patterns": [
            r"bluetooth\s+(?:is\s+)?not\s+connecting",
            r"bluetooth\s+failure",
        ],
        "severity": "Minor",
    },

    # WATER DAMAGE
    "liquid_exposure": {
        "category": "Water damage",
        "description": "Device dropped in water or exposed to liquid",
        "patterns": [
            r"water\s+la\s+vizhundhuduchu",
            r"(?:dropped|fell)\s+(?:in|into)\s+water",
            r"liquid\s+exposure",
            r"water\s+spill",
        ],
        "severity": "Critical",
    },
    "moisture_warning": {
        "category": "Water damage",
        "description": "Moisture detected in charging port or internals",
        "patterns": [
            r"moisture\s+warning",
            r"moisture\s+detected",
        ],
        "severity": "Moderate",
    },

    # SOFTWARE
    "app_crash": {
        "category": "Software/OS",
        "description": "Applications crashing or OS freezing",
        "patterns": [
            r"app\s+crash",
            r"apps\s+crashing",
            r"system\s+lag",
            r"phone\s+freezing",
        ],
        "severity": "Minor",
    },

    # MOTHERBOARD
    "motherboard_failure": {
        "category": "Motherboard",
        "description": "Motherboard dead or PMIC component failure",
        "patterns": [
            r"motherboard\s+dead",
            r"board\s+dead",
            r"multiple\s+components\s+failed",
        ],
        "severity": "Critical",
    },
}

# ---------------------------------------------------------------------------
# 3b. CANONICAL SYMPTOM TO COMPONENT MAPPINGS (Problem 12)
# ---------------------------------------------------------------------------
CANONICAL_MAPPINGS: Dict[str, Dict[str, str]] = {
    "touch_failure": {
        "canonical_symptom": "touch_failure",
        "probable_issue": "Touch/digitizer/display assembly problem",
        "affected_component": "display/touch assembly",
        "repair_category": "Display",
    },
    "intermittent_touch": {
        "canonical_symptom": "touch_failure",
        "probable_issue": "Touch/digitizer/display assembly problem",
        "affected_component": "display/touch assembly",
        "repair_category": "Display",
    },
    "ghost_touch": {
        "canonical_symptom": "touch_failure",
        "probable_issue": "Touch/digitizer/display assembly problem",
        "affected_component": "display/touch assembly",
        "repair_category": "Display",
    },
    "display_vertical_line": {
        "canonical_symptom": "display_vertical_line",
        "probable_issue": "Display vertical line / display panel problem",
        "affected_component": "display assembly",
        "repair_category": "Display",
    },
    "green_line": {
        "canonical_symptom": "display_vertical_line",
        "probable_issue": "Display vertical line / display panel problem",
        "affected_component": "display assembly",
        "repair_category": "Display",
    },
    "pink_line": {
        "canonical_symptom": "display_vertical_line",
        "probable_issue": "Display line / display panel problem",
        "affected_component": "display assembly",
        "repair_category": "Display",
    },
    "cracked_screen": {
        "canonical_symptom": "cracked_screen",
        "probable_issue": "Cracked screen / display panel fracture",
        "affected_component": "display assembly",
        "repair_category": "Display",
    },
    "broken_glass": {
        "canonical_symptom": "broken_glass",
        "probable_issue": "Broken protective glass",
        "affected_component": "display glass",
        "repair_category": "Display",
    },
    "battery_fast_drain": {
        "canonical_symptom": "battery_fast_drain",
        "probable_issue": "Battery capacity degradation / abnormal drain problem",
        "affected_component": "battery",
        "repair_category": "Battery",
    },
    "fast_drain": {
        "canonical_symptom": "battery_fast_drain",
        "probable_issue": "Battery capacity degradation / abnormal drain problem",
        "affected_component": "battery",
        "repair_category": "Battery",
    },
    "battery_swelling": {
        "canonical_symptom": "battery_swelling",
        "probable_issue": "Battery swelling physical deformation",
        "affected_component": "battery",
        "repair_category": "Battery",
    },
    "overheating": {
        "canonical_symptom": "overheating",
        "probable_issue": "Thermal management / abnormal temperature problem",
        "affected_component": "battery",
        "repair_category": "Battery",
    },
    "charging_failure": {
        "canonical_symptom": "charging_failure",
        "probable_issue": "Charging port / charging circuit connection problem",
        "affected_component": "charging port / charging circuit",
        "repair_category": "Charging",
    },
    "slow_charging": {
        "canonical_symptom": "charging_failure",
        "probable_issue": "Charging port / degraded charging",
        "affected_component": "charging port / charging circuit",
        "repair_category": "Charging",
    },
    "charger_not_detected": {
        "canonical_symptom": "charging_failure",
        "probable_issue": "Charging port / connection problem",
        "affected_component": "charging port / charging circuit",
        "repair_category": "Charging",
    },
    "no_power": {
        "canonical_symptom": "no_power",
        "probable_issue": "Power startup failure",
        "affected_component": "battery / power circuit / motherboard",
        "repair_category": "Power",
    },
    "liquid_exposure": {
        "canonical_symptom": "liquid_exposure",
        "probable_issue": "Liquid-related hardware damage",
        "affected_component": "multiple components",
        "repair_category": "Water damage",
    },
}

# ---------------------------------------------------------------------------
# 4. EVENT & TEMPORAL PATTERNS
# ---------------------------------------------------------------------------
EVENT_PATTERNS = [
    (r"\b(?:dropped in water|dropped into water|fell into water|fell in water|(?:fell|dropped)\s+(?:in|into)\s+water|water la vizhundhuduchu|dropped in toilet|coffee spill|liquid exposure|got wet in rain)\b", "liquid_exposure", "Device exposed to liquid ingress"),
    (r"\b(?:fell down|dropped|fell from table|fell on road|fell onto floor|keezha vizhundhuduchu)\b", "drop", "Device subjected to physical drop shock"),
    (r"\b(?:after software update|after update|updated to android|updated to ios|post update)\b", "software_update", "Symptoms emerged immediately following OS/software update"),
    (r"\b(?:charging overnight|kept on charge all night|overcharged|overnight charging)\b", "prolonged_charging", "Device subjected to prolonged overnight charging session"),
    (r"\b(?:started suddenly|suddenly stopped|out of nowhere|all of a sudden)\b", "sudden_failure", "Unprovoked sudden hardware failure"),
    (r"\b(?:after screen replacement|after replacing screen|after local repair|post repair)\b", "previous_repair", "Issue emerged following third-party part replacement"),
]


TEMPORAL_PATTERNS = [
    r"\btoday\b",
    r"\byesterday\b",
    r"\b\d+\s*days?\s*ago\b",
    r"\bsince\s*last\s*week\b",
    r"\bfor\s*\d+\s*months?\b",
    r"\bjust\s*now\b",
    r"\bafter\s*charging\b",
    r"\bafter\s*i\s*dropped\s*it\b",
]

# Words that indicate component is working / intact (Negation of damage)
INTACT_WORDS_PATTERN = r"\b(?:is\s+)?(?:fine|ok|good|working\s+fine|intact|undamaged|not\s+damaged|problem\s*illa|problem\s*illai|illa|illai)\b"


class NLPReasoningService:
    """
    NLP + Diagnostic Reasoning Engine.
    Processes natural human language, cleans typos, normalizes Tanglish / repair slang,
    splits complex sentences into clauses, performs multi-symptom extraction with explicit
    negation handling, extracts events and device context, and outputs structured diagnostic evidence.
    """

    @classmethod
    def clean_text(cls, text: str) -> str:
        """Lowercases text, standardizes whitespaces, fixes typos, and expands Tanglish slang."""
        cleaned = text.lower().strip()

        # Apply typo corrections
        for pattern, replacement in COMMON_TYPOS.items():
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

        # Apply Tanglish phrase normalization
        for pattern, replacement in TANGLISH_PHRASES:
            cleaned = re.sub(pattern, replacement, cleaned, flags=re.IGNORECASE)

        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    @classmethod
    def split_into_clauses(cls, text: str) -> List[str]:
        """
        Splits complex sentences across punctuation and adversative/additive conjunctions:
        'Display is fine but touch is not working' -> ['Display is fine', 'touch is not working']
        """
        pattern = r"[,;.]|\b(?:and|but|however|although|though|yet|except|aana|aanal)\b"
        raw_clauses = re.split(pattern, text, flags=re.IGNORECASE)
        return [c.strip() for c in raw_clauses if c.strip()]

    @classmethod
    def is_clause_negating_component(cls, clause: str, component_kw: str) -> bool:
        """
        Checks if a clause affirms that a component is NOT damaged or IS working fine.
        Example: 'display is fine' -> True (display damage is negated)
                 'screen is not cracked' -> True (cracked screen is negated)
                 'phone is not heating' -> True (heating is negated)
        """
        cl = clause.lower()
        if re.search(r"\b(?:not|no|never|isnt|isn't|without)\s+" + re.escape(component_kw), cl):
            return True
        if re.search(re.escape(component_kw) + r"\s+" + INTACT_WORDS_PATTERN, cl):
            return True
        return False

    @classmethod
    def extract_device_context(cls, text: str) -> ExtractedDeviceContext:
        """Extracts smartphone brand, model, and storage if present in text."""
        b_match = None
        for brand in ["apple", "iphone", "samsung", "oneplus", "xiaomi", "redmi", "realme", "vivo", "oppo", "motorola", "pixel"]:
            if re.search(r"\b" + brand + r"\b", text, re.IGNORECASE):
                b_match = "Apple" if brand == "iphone" else brand.capitalize()
                break

        # Storage pattern
        st_match = None
        st = re.search(r"\b(64|128|256|512|1024)\s*(?:gb|tb)\b", text, re.IGNORECASE)
        if st:
            st_match = st.group(0).upper().replace(" ", "")

        # Model pattern
        m_match = None
        if b_match == "Apple":
            m = re.search(r"\b(?:iphone\s*)?(?:11|12|13|14|15|16|xr|xs|x|se)(?:\s*(?:pro|max|mini|plus))?\b", text, re.IGNORECASE)
            if m:
                m_match = m.group(0).strip().title()
                if not m_match.lower().startswith("iphone"):
                    m_match = f"iPhone {m_match}"
        elif b_match == "Samsung":
            m = re.search(r"\b(?:galaxy\s*)?(?:s\d{2}|a\d{2}|z\s*fold|z\s*flip)(?:\s*(?:ultra|plus|fe))?\b", text, re.IGNORECASE)
            if m:
                m_match = m.group(0).strip().title()
                if not m_match.lower().startswith("galaxy"):
                    m_match = f"Galaxy {m_match}"

        return ExtractedDeviceContext(
            brand=b_match,
            model=m_match,
            storage=st_match
        )

    @classmethod
    def extract_event_and_time(cls, text: str) -> Optional[ExtractedEvent]:
        """Extracts causal events (drop, water, update) and temporal references."""
        event_type = None
        event_desc = None
        for pattern, ev_type, desc in EVENT_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                event_type = ev_type
                event_desc = desc
                break

        time_str = None
        for t_pat in TEMPORAL_PATTERNS:
            tm = re.search(t_pat, text, re.IGNORECASE)
            if tm:
                time_str = tm.group(0)
                break

        if event_type or time_str:
            return ExtractedEvent(
                event_type=event_type,
                event_time=time_str,
                description=event_desc
            )
        return None

    @classmethod
    def analyze(
        cls,
        raw_description: str,
        provided_brand: Optional[str] = None,
        provided_model: Optional[str] = None,
        provided_storage: Optional[int] = None
    ) -> NLPReasoningOutput:
        """
        Executes end-to-end NLP reasoning pipeline:
        1. Clean input & translate Tanglish / repair slang.
        2. Clause splitting for adversative context.
        3. Multi-symptom extraction with robust negation detection.
        4. Event & temporal extraction.
        5. Diagnostic evidence synthesis & component categorization.
        """
        cleaned = cls.clean_text(raw_description)
        clauses = cls.split_into_clauses(cleaned)

        active_symptoms: List[ExtractedSymptom] = []
        negated_symptoms: List[ExtractedSymptom] = []
        seen_symptom_ids: Set[str] = set()

        # Handle component intact statements like "Display is fine" or "Screen is fine"
        for clause in clauses:
            cl = clause.lower()
            if re.search(r"\b(?:display|screen|front\s*glass)\s+" + INTACT_WORDS_PATTERN, cl) or re.search(r"\b(?:not|no)\s+(?:cracked|broken)\b", cl):
                if "cracked_screen" not in seen_symptom_ids:
                    negated_symptoms.append(
                        ExtractedSymptom(
                            symptom_id="cracked_screen",
                            category="Display",
                            description="Screen is intact with no physical display damage",
                            is_negated=True,
                            confidence=0.95
                        )
                    )
                    seen_symptom_ids.add("cracked_screen")

            if re.search(r"\b(?:phone|device)\s+(?:is\s+)?not\s+heating\b", cl) or re.search(r"\bnot\s+heating\b", cl):
                if "overheating" not in seen_symptom_ids:
                    negated_symptoms.append(
                        ExtractedSymptom(
                            symptom_id="overheating",
                            category="Battery",
                            description="Device is not overheating; thermal status normal",
                            is_negated=True,
                            confidence=0.95
                        )
                    )
                    seen_symptom_ids.add("overheating")

        # Scan each clause for positive and negated symptoms from taxonomy
        for clause in clauses:
            cl = clause.lower()
            for symptom_id, info in SYMPTOM_TAXONOMY.items():
                if symptom_id in seen_symptom_ids:
                    continue

                if symptom_id == "black_screen" and "camera" in cl:
                    continue

                for pat in info["patterns"]:
                    match = re.search(pat, cl, re.IGNORECASE)
                    if match:
                        matched_kw = match.group(0)

                        # Check for negation in clause
                        is_neg = False
                        if re.search(r"\b(?:not|no|never|isnt|isn't|without)\s+" + re.escape(matched_kw), cl):
                            is_neg = True
                        elif re.search(re.escape(matched_kw) + r"\s+" + INTACT_WORDS_PATTERN, cl):
                            is_neg = True

                        symptom_obj = ExtractedSymptom(
                            symptom_id=symptom_id,
                            category=info["category"],
                            description=info["description"],
                            is_negated=is_neg,
                            confidence=0.92
                        )

                        if is_neg:
                            negated_symptoms.append(symptom_obj)
                            seen_symptom_ids.add(symptom_id)
                        else:
                            active_symptoms.append(symptom_obj)
                            seen_symptom_ids.add(symptom_id)
                        break

        # Event and Temporal Information
        event = cls.extract_event_and_time(cleaned)

        # Device context extraction with fallback to user provided form fields
        dev_ctx = cls.extract_device_context(cleaned)
        if not dev_ctx.brand and provided_brand:
            dev_ctx.brand = provided_brand
        if not dev_ctx.model and provided_model:
            dev_ctx.model = provided_model
        if not dev_ctx.storage and provided_storage:
            dev_ctx.storage = f"{provided_storage}GB"

        # ---------------------------------------------------------------------
        # PROBLEM 13: CHECK FOR VAGUE / INSUFFICIENT INFORMATION
        # e.g., "Phone not working", "My phone is not working"
        # ---------------------------------------------------------------------
        vague_patterns = [
            r"^(?:my\s+)?(?:phone|mobile|device)?\s*(?:is\s+)?not\s+working[.]?$",
            r"^(?:phone|mobile|device)\s+problem[.]?$",
            r"^(?:phone|mobile|device)\s+issue[.]?$",
            r"^not\s+working[.]?$",
            r"^having\s+(?:some\s+)?problems?[.]?$",
            r"^phone\s+broken[.]?$",
        ]
        is_vague_input = any(re.match(vp, raw_description.strip(), re.IGNORECASE) for vp in vague_patterns) or (
            len(active_symptoms) == 0 and any(re.match(vp, cleaned.strip(), re.IGNORECASE) for vp in vague_patterns)
        )

        if is_vague_input or (len(active_symptoms) == 0 and len(negated_symptoms) == 0 and event is None):
            return NLPReasoningOutput(
                raw_input=raw_description,
                cleaned_input=cleaned,
                detected_language="Tamil-English / Tanglish" if any(re.search(p, raw_description, re.IGNORECASE) for p, _ in TANGLISH_PHRASES) else "English (Normalized)",
                device=dev_ctx,
                event=None,
                symptoms=[],
                negated_symptoms=[],
                primary_category="Unknown",
                secondary_categories=[],
                canonical_symptom=None,
                probable_issue="I need more information to narrow down the problem.",
                affected_component=None,
                severity="Minor",
                safety_flags=[],
                diagnostic_evidence="Insufficient diagnostic information provided to isolate a specific hardware defect.",
                confidence_score=0.40,
                confidence_level="LOW",
                insufficient_information=True,
                follow_up_questions=[
                    "Does the phone show anything when connected to a charger?",
                    "Does it vibrate, ring, or make any sound?",
                    "Did the problem start after a fall, water exposure, charging issue, or software update?"
                ]
            )

        # ---------------------------------------------------------------------
        # DIAGNOSTIC EVIDENCE ENGINE (Component Categorization & Severity)
        # ---------------------------------------------------------------------
        category_weights: Dict[str, float] = {}
        for s in active_symptoms:
            cat = s.category
            category_weights[cat] = category_weights.get(cat, 0.0) + 1.0

        # Event boosts (Do not map drops to Motherboard)
        if event and event.event_type == "liquid_exposure":
            category_weights["Water damage"] = category_weights.get("Water damage", 0.0) + 5.0
        elif event and event.event_type == "drop":
            category_weights["Display"] = category_weights.get("Display", 0.0) + 2.0

        if category_weights:
            sorted_cats = sorted(category_weights.items(), key=lambda x: x[1], reverse=True)
            primary_cat = sorted_cats[0][0]
            secondary_cats = [c[0] for c in sorted_cats[1:]]
        else:
            primary_cat = "General Hardware"
            secondary_cats = []

        # Determine Canonical Mapping & Probable Issue (Problem 12)
        canonical_sym = None
        probable_issue = None
        affected_comp = None

        for s in active_symptoms:
            if s.symptom_id in CANONICAL_MAPPINGS:
                m = CANONICAL_MAPPINGS[s.symptom_id]
                canonical_sym = m["canonical_symptom"]
                probable_issue = m["probable_issue"]
                affected_comp = m["affected_component"]
                # Use mapped repair category if primary is generic
                if primary_cat == "General Hardware":
                    primary_cat = m["repair_category"]
                break

        if not canonical_sym and active_symptoms:
            canonical_sym = active_symptoms[0].symptom_id
            probable_issue = f"{primary_cat} assembly problem"
            affected_comp = primary_cat.lower()

        # Determine Severity Level
        has_critical = any(
            s.symptom_id in ["battery_swelling", "liquid_exposure", "no_power", "motherboard_failure"]
            for s in active_symptoms
        )
        has_moderate = any(
            s.symptom_id in ["cracked_screen", "green_line", "display_vertical_line", "touch_failure", "battery_fast_drain", "fast_drain", "overheating", "boot_loop"]
            for s in active_symptoms
        )

        if has_critical or (event and event.event_type == "liquid_exposure"):
            severity = "Critical"
        elif has_moderate or len(active_symptoms) >= 2:
            severity = "Moderate"
        else:
            severity = "Minor"

        # Safety Flags Synthesis
        safety_flags = []
        if any(s.symptom_id == "battery_swelling" for s in active_symptoms):
            safety_flags.append("thermal_runaway_hazard")
        if event and event.event_type == "liquid_exposure" or any(s.symptom_id == "liquid_exposure" for s in active_symptoms):
            safety_flags.append("liquid_galvanic_short_risk")
        if any(s.symptom_id in ["cracked_screen", "broken_glass"] for s in active_symptoms):
            safety_flags.append("glass_splinter_hazard")
        if any(s.symptom_id == "overheating" for s in active_symptoms):
            safety_flags.append("abnormal_temperature_warning")

        # Clinical Diagnostic Evidence Sentence
        active_names = [s.symptom_id.replace("_", " ") for s in active_symptoms]
        if active_names:
            sym_text = ", ".join(active_names)
            ev_text = f" following {event.event_type} event" if event and event.event_type else ""
            evidence = f"Extracted positive symptoms: [{sym_text}]{ev_text}. Primary failure identified as {primary_cat} ({severity} severity)."
        else:
            evidence = f"General hardware anomaly detected. Primary category assigned to {primary_cat}."

        confidence = 0.88 if len(active_symptoms) > 0 else 0.65
        conf_level = "MODERATE" if len(active_symptoms) > 0 else "LOW"

        return NLPReasoningOutput(
            raw_input=raw_description,
            cleaned_input=cleaned,
            detected_language="Tamil-English / Tanglish" if any(re.search(p, raw_description, re.IGNORECASE) for p, _ in TANGLISH_PHRASES) else "English (Normalized)",
            device=dev_ctx,
            event=event,
            symptoms=active_symptoms,
            negated_symptoms=negated_symptoms,
            primary_category=primary_cat,
            secondary_categories=secondary_cats,
            canonical_symptom=canonical_sym,
            probable_issue=probable_issue,
            affected_component=affected_comp,
            severity=severity,
            safety_flags=safety_flags,
            diagnostic_evidence=evidence,
            confidence_score=confidence,
            confidence_level=conf_level,
            insufficient_information=False,
            follow_up_questions=[]
        )
