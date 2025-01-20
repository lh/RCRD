## Modules

<dl>
<dt><a href="#module_RetinalCalculator">RetinalCalculator</a></dt>
<dd><p>Main component for the Risk Calculator Retinal Detachment (RCRD) application.
This component serves as the root container and implements responsive design by
conditionally rendering either mobile or desktop versions of the calculator.</p>
<p>The component uses Tailwind CSS for styling and implements a responsive layout:</p>
<ul>
<li>Mobile view: Single column layout with optimized touch interactions</li>
<li>Desktop view: Two-column layout with enhanced visualization</li>
</ul>
<p>The calculator is based on the UK BEAVRS database study and provides risk assessment
for retinal detachment.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#CLOCK">CLOCK</a></dt>
<dd><p>Clock face constants</p>
</dd>
<dt><a href="#segmentToHour">segmentToHour</a> ⇒ <code>number</code></dt>
<dd><p>Converts a segment number (0-59) to its corresponding clock hour (1-12)</p>
</dd>
<dt><a href="#segmentIdToHour">segmentIdToHour</a> ⇒ <code>number</code></dt>
<dd><p>Converts a segment ID string to its corresponding clock hour</p>
</dd>
<dt><a href="#MAPPING_TYPE">MAPPING_TYPE</a></dt>
<dd><p>Types of hour mapping needed by different parts of the system</p>
</dd>
<dt><a href="#getSegmentForAngle">getSegmentForAngle</a> ⇒ <code>number</code></dt>
<dd><p>Converts an angle to its corresponding segment number</p>
</dd>
<dt><a href="#getHourMapping">getHourMapping</a> ⇒ <code>Object</code></dt>
<dd><p>Converts a segment number to its corresponding clock hour(s)</p>
</dd>
<dt><a href="#getHourMappingFromId">getHourMappingFromId</a> ⇒ <code>Object</code></dt>
<dd><p>Converts a segment ID string to clock hour(s)</p>
</dd>
<dt><a href="#getHoursFromSegments">getHoursFromSegments</a> ⇒ <code>Set.&lt;number&gt;</code></dt>
<dd><p>Converts an array of segments to their corresponding hours</p>
</dd>
<dt><a href="#getSegmentsForHours">getSegmentsForHours</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Gets segments for a given hour range</p>
</dd>
<dt><a href="#formatDetachmentHours">formatDetachmentHours</a> ⇒ <code>string</code></dt>
<dd><p>Formats an array of segment numbers into a human-readable clock hour range string</p>
</dd>
<dt><a href="#getClockHour">getClockHour</a> ⇒ <code>number</code></dt>
<dd><p>Converts a segment number (0-59) to its corresponding clock hour (1-12)</p>
</dd>
<dt><a href="#getSegmentRanges">getSegmentRanges</a> ⇒ <code>Array.&lt;{start: number, length: number}&gt;</code></dt>
<dd><p>Groups consecutive segments into ranges, handling wraparound at 59/0</p>
</dd>
<dt><a href="#interpolateSegments">interpolateSegments</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Interpolates between non-adjacent segments to create continuous ranges</p>
</dd>
<dt><a href="#calculateSegmentsForHourRange">calculateSegmentsForHourRange</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Calculates the expected segments for a given hour range on the clock face</p>
</dd>
<dt><a href="#getMobileView">getMobileView</a> ⇒ <code>Object</code></dt>
<dd><p>Gets the mobile view container and elements</p>
</dd>
<dt><a href="#getDesktopView">getDesktopView</a> ⇒ <code>Object</code></dt>
<dd><p>Gets the desktop view container and elements</p>
</dd>
<dt><a href="#getResultsSection">getResultsSection</a> ⇒ <code>Object</code></dt>
<dd><p>Gets the results section elements</p>
</dd>
<dt><a href="#fillForm">fillForm</a></dt>
<dd><p>Fills out the form with test data</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#segmentToHour">segmentToHour(segment)</a> ⇒ <code>number</code></dt>
<dd><p>Converts a segment number to its corresponding hour</p>
</dd>
<dt><a href="#applyMedicalRules">applyMedicalRules(hours)</a> ⇒ <code>Set.&lt;number&gt;</code></dt>
<dd><p>Applies medical domain rules to add implied hours</p>
</dd>
<dt><a href="#isTotalDetachment">isTotalDetachment(hours)</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if the detachment is considered total (all 12 hours affected)</p>
</dd>
<dt><a href="#countInferiorHours">countInferiorHours(hours)</a> ⇒ <code>number</code></dt>
<dd><p>Count how many inferior clock hours (3-9) are affected</p>
</dd>
<dt><a href="#getDetachmentCategory">getDetachmentCategory(hours)</a> ⇒ <code>string</code></dt>
<dd><p>Get the medical category for a detachment based on affected hours.
Categories are based on the BEAVRS database study coefficients.</p>
<p>For inferior detachment:</p>
<ul>
<li>less_than_3: 0-2 inferior hours affected (reference category)</li>
<li>3_to_5: 3-5 inferior hours affected (+0.441)</li>
<li>6_hours: 6 or more inferior hours affected (+0.435)</li>
<li>total_detachment: all 12 hours affected (+0.663)</li>
</ul>
</dd>
<dt><a href="#areConsecutive">areConsecutive(hour1, hour2)</a> ⇒ <code>boolean</code></dt>
<dd><p>Check if two hours are consecutive, handling midnight crossing</p>
</dd>
<dt><a href="#formatHourRange">formatHourRange(hours)</a> ⇒ <code>string</code></dt>
<dd><p>Convert an array of hours into a formatted range string.
Examples:
[1, 2, 3] -&gt; &quot;1-3&quot;
[3] -&gt; &quot;3&quot;
[11, 12, 1] -&gt; &quot;11-1&quot;
[1, 3, 5] -&gt; &quot;1; 3; 5&quot;</p>
</dd>
<dt><a href="#formatDetachment">formatDetachment(hours)</a> ⇒ <code>string</code></dt>
<dd><p>Format a detachment into a human-readable string.</p>
</dd>
<dt><a href="#segmentToHour">segmentToHour(segment)</a> ⇒ <code>number</code></dt>
<dd><p>Convert a segment number (0-23) to its corresponding clock hour (1-12)
using the formula: x = (segment + 24)/2, then hour = x &gt; 12 ? x - 12 : x</p>
</dd>
<dt><a href="#segmentsToHours">segmentsToHours(segments)</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Convert an array of segments to their corresponding clock hours</p>
</dd>
<dt><a href="#CryotherapySelection">CryotherapySelection()</a></dt>
<dd><p>CryotherapySelection component for selecting cryotherapy status
Shows options from Table 2 of the paper</p>
</dd>
<dt><a href="#GaugeSelection">GaugeSelection()</a></dt>
<dd><p>GaugeSelection component for selecting vitrectomy gauge
Allows selection of all gauges from Table 2 of the paper</p>
</dd>
<dt><a href="#TamponadeSelection">TamponadeSelection()</a></dt>
<dd><p>TamponadeSelection component for selecting tamponade type
Shows all options from Table 2 of the paper</p>
</dd>
<dt><a href="#Toggle">Toggle()</a></dt>
<dd><p>Toggle component for binary choices with consistent styling
Based on the radio button styling from RiskInputForm</p>
<p>Keyboard Navigation:</p>
<ul>
<li>Tab: Move focus to the radio group</li>
<li>Space/Enter: Select focused option</li>
<li>Arrow Left/Up: Select previous option</li>
<li>Arrow Right/Down: Select next option</li>
</ul>
</dd>
</dl>

<a name="module_RetinalCalculator"></a>

## RetinalCalculator
Main component for the Risk Calculator Retinal Detachment (RCRD) application.
This component serves as the root container and implements responsive design by
conditionally rendering either mobile or desktop versions of the calculator.

The component uses Tailwind CSS for styling and implements a responsive layout:
- Mobile view: Single column layout with optimized touch interactions
- Desktop view: Two-column layout with enhanced visualization

The calculator is based on the UK BEAVRS database study and provides risk assessment
for retinal detachment.

**Component**:   
**Example**  
```js
return (
  <RetinalCalculator />
)
```
<a name="CLOCK"></a>

## CLOCK
Clock face constants

**Kind**: global constant  
<a name="segmentToHour"></a>

## segmentToHour ⇒ <code>number</code>
Converts a segment number (0-59) to its corresponding clock hour (1-12)

**Kind**: global constant  
**Returns**: <code>number</code> - The corresponding clock hour (1-12)  

| Param | Type | Description |
| --- | --- | --- |
| segment | <code>number</code> | The segment number (0-59) |

<a name="segmentIdToHour"></a>

## segmentIdToHour ⇒ <code>number</code>
Converts a segment ID string to its corresponding clock hour

**Kind**: global constant  
**Returns**: <code>number</code> - The corresponding clock hour (1-12)  

| Param | Type | Description |
| --- | --- | --- |
| segmentId | <code>string</code> | The segment ID (e.g., 'segment50') |

<a name="MAPPING_TYPE"></a>

## MAPPING\_TYPE
Types of hour mapping needed by different parts of the system

**Kind**: global constant  
<a name="getSegmentForAngle"></a>

## getSegmentForAngle ⇒ <code>number</code>
Converts an angle to its corresponding segment number

**Kind**: global constant  
**Returns**: <code>number</code> - Segment number (0-23)  

| Param | Type | Description |
| --- | --- | --- |
| angle | <code>number</code> | Angle in degrees |

<a name="getHourMapping"></a>

## getHourMapping ⇒ <code>Object</code>
Converts a segment number to its corresponding clock hour(s)

**Kind**: global constant  
**Returns**: <code>Object</code> - Hour mapping information  

| Param | Type | Description |
| --- | --- | --- |
| segment | <code>number</code> | Segment number (0-23) |
| mappingType | <code>string</code> | Type of mapping needed (from MAPPING_TYPE) |

<a name="getHourMappingFromId"></a>

## getHourMappingFromId ⇒ <code>Object</code>
Converts a segment ID string to clock hour(s)

**Kind**: global constant  
**Returns**: <code>Object</code> - Hour mapping information  

| Param | Type | Description |
| --- | --- | --- |
| segmentId | <code>string</code> | Segment ID (e.g., 'segment12') |
| mappingType | <code>string</code> | Type of mapping needed |

<a name="getHoursFromSegments"></a>

## getHoursFromSegments ⇒ <code>Set.&lt;number&gt;</code>
Converts an array of segments to their corresponding hours

**Kind**: global constant  
**Returns**: <code>Set.&lt;number&gt;</code> - Set of unique hours  

| Param | Type | Description |
| --- | --- | --- |
| segments | <code>Array.&lt;(number\|string)&gt;</code> | Array of segments or segment IDs |
| mappingType | <code>string</code> | Type of mapping needed |

<a name="getSegmentsForHours"></a>

## getSegmentsForHours ⇒ <code>Array.&lt;number&gt;</code>
Gets segments for a given hour range

**Kind**: global constant  
**Returns**: <code>Array.&lt;number&gt;</code> - Array of segment numbers  

| Param | Type | Description |
| --- | --- | --- |
| startHour | <code>number</code> | Starting hour (1-12) |
| endHour | <code>number</code> | Ending hour (1-12) |

<a name="formatDetachmentHours"></a>

## formatDetachmentHours ⇒ <code>string</code>
Formats an array of segment numbers into a human-readable clock hour range string

**Kind**: global constant  
**Returns**: <code>string</code> - Formatted clock hour range (e.g., "1-3 o'clock" or "12; 5-6 o'clock")  

| Param | Type | Description |
| --- | --- | --- |
| segments | <code>Array.&lt;number&gt;</code> | Array of segment numbers (0-23) |

<a name="getClockHour"></a>

## getClockHour ⇒ <code>number</code>
Converts a segment number (0-59) to its corresponding clock hour (1-12)

**Kind**: global constant  
**Returns**: <code>number</code> - The clock hour (1-12)  

| Param | Type | Description |
| --- | --- | --- |
| segment | <code>number</code> | The segment number (0-59) |

<a name="getSegmentRanges"></a>

## getSegmentRanges ⇒ <code>Array.&lt;{start: number, length: number}&gt;</code>
Groups consecutive segments into ranges, handling wraparound at 59/0

**Kind**: global constant  
**Returns**: <code>Array.&lt;{start: number, length: number}&gt;</code> - Array of range objects  

| Param | Type | Description |
| --- | --- | --- |
| segments | <code>Array.&lt;number&gt;</code> | Array of segment numbers (0-59) |

<a name="interpolateSegments"></a>

## interpolateSegments ⇒ <code>Array.&lt;number&gt;</code>
Interpolates between non-adjacent segments to create continuous ranges

**Kind**: global constant  
**Returns**: <code>Array.&lt;number&gt;</code> - Array of segments including interpolated values  

| Param | Type | Description |
| --- | --- | --- |
| segments | <code>Array.&lt;number&gt;</code> | Array of segment numbers (0-59) |

<a name="calculateSegmentsForHourRange"></a>

## calculateSegmentsForHourRange ⇒ <code>Array.&lt;number&gt;</code>
Calculates the expected segments for a given hour range on the clock face

**Kind**: global constant  
**Returns**: <code>Array.&lt;number&gt;</code> - Array of segment numbers  

| Param | Type | Description |
| --- | --- | --- |
| startHour | <code>number</code> | Starting hour (1-12) |
| endHour | <code>number</code> | Ending hour (1-12) |

<a name="getMobileView"></a>

## getMobileView ⇒ <code>Object</code>
Gets the mobile view container and elements

**Kind**: global constant  
**Returns**: <code>Object</code> - Object containing mobile view elements  

| Param | Type | Description |
| --- | --- | --- |
| container | <code>HTMLElement</code> | The main container from render() |

<a name="getDesktopView"></a>

## getDesktopView ⇒ <code>Object</code>
Gets the desktop view container and elements

**Kind**: global constant  
**Returns**: <code>Object</code> - Object containing desktop view elements  

| Param | Type | Description |
| --- | --- | --- |
| container | <code>HTMLElement</code> | The main container from render() |

<a name="getResultsSection"></a>

## getResultsSection ⇒ <code>Object</code>
Gets the results section elements

**Kind**: global constant  
**Returns**: <code>Object</code> - Object containing results elements  

| Param | Type | Description |
| --- | --- | --- |
| container | <code>HTMLElement</code> | The main container from render() |

<a name="fillForm"></a>

## fillForm
Fills out the form with test data

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> | The parameters object |
| params.screen | <code>Object</code> | The screen object from render() |
| params.fireEvent | <code>function</code> | The fireEvent function from testing-library |
| params.within | <code>function</code> | The within function from testing-library |
| params.mobileView | <code>HTMLElement</code> | The mobile view container |
| params.data | <code>Object</code> | The test data to fill in |

<a name="segmentToHour"></a>

## segmentToHour(segment) ⇒ <code>number</code>
Converts a segment number to its corresponding hour

**Kind**: global function  
**Returns**: <code>number</code> - Hour (1-12)  

| Param | Type | Description |
| --- | --- | --- |
| segment | <code>number</code> | Segment number (0-23) |

<a name="applyMedicalRules"></a>

## applyMedicalRules(hours) ⇒ <code>Set.&lt;number&gt;</code>
Applies medical domain rules to add implied hours

**Kind**: global function  
**Returns**: <code>Set.&lt;number&gt;</code> - Updated hours with medical implications  

| Param | Type | Description |
| --- | --- | --- |
| hours | <code>Set.&lt;number&gt;</code> | Set of detected hours |

<a name="isTotalDetachment"></a>

## isTotalDetachment(hours) ⇒ <code>boolean</code>
Check if the detachment is considered total (all 12 hours affected)

**Kind**: global function  
**Returns**: <code>boolean</code> - True if detachment is total  

| Param | Type | Description |
| --- | --- | --- |
| hours | <code>Array.&lt;number&gt;</code> | Array of affected clock hours |

<a name="countInferiorHours"></a>

## countInferiorHours(hours) ⇒ <code>number</code>
Count how many inferior clock hours (3-9) are affected

**Kind**: global function  
**Returns**: <code>number</code> - Number of inferior hours affected  

| Param | Type | Description |
| --- | --- | --- |
| hours | <code>Array.&lt;number&gt;</code> | Array of affected clock hours |

<a name="getDetachmentCategory"></a>

## getDetachmentCategory(hours) ⇒ <code>string</code>
Get the medical category for a detachment based on affected hours.
Categories are based on the BEAVRS database study coefficients.

For inferior detachment:
- less_than_3: 0-2 inferior hours affected (reference category)
- 3_to_5: 3-5 inferior hours affected (+0.441)
- 6_hours: 6 or more inferior hours affected (+0.435)
- total_detachment: all 12 hours affected (+0.663)

**Kind**: global function  
**Returns**: <code>string</code> - Medical category:
  - "total_detachment" if exactly 12 hours affected
  - "6_hours" if 6+ inferior hours affected
  - "3_to_5" if 3-5 inferior hours affected
  - "less_than_3" if 0-2 inferior hours affected  

| Param | Type | Description |
| --- | --- | --- |
| hours | <code>Array.&lt;number&gt;</code> | Array of affected clock hours |

<a name="areConsecutive"></a>

## areConsecutive(hour1, hour2) ⇒ <code>boolean</code>
Check if two hours are consecutive, handling midnight crossing

**Kind**: global function  
**Returns**: <code>boolean</code> - True if hours are consecutive  

| Param | Type | Description |
| --- | --- | --- |
| hour1 | <code>number</code> | First hour (1-12) |
| hour2 | <code>number</code> | Second hour (1-12) |

<a name="formatHourRange"></a>

## formatHourRange(hours) ⇒ <code>string</code>
Convert an array of hours into a formatted range string.
Examples:
[1, 2, 3] -> "1-3"
[3] -> "3"
[11, 12, 1] -> "11-1"
[1, 3, 5] -> "1; 3; 5"

**Kind**: global function  
**Returns**: <code>string</code> - Formatted range string  

| Param | Type | Description |
| --- | --- | --- |
| hours | <code>Array.&lt;number&gt;</code> | Array of clock hours (1-12) |

<a name="formatDetachment"></a>

## formatDetachment(hours) ⇒ <code>string</code>
Format a detachment into a human-readable string.

**Kind**: global function  
**Returns**: <code>string</code> - Formatted detachment string  

| Param | Type | Description |
| --- | --- | --- |
| hours | <code>Array.&lt;number&gt;</code> | Array of affected clock hours |

<a name="segmentToHour"></a>

## segmentToHour(segment) ⇒ <code>number</code>
Convert a segment number (0-23) to its corresponding clock hour (1-12)
using the formula: x = (segment + 24)/2, then hour = x > 12 ? x - 12 : x

**Kind**: global function  
**Returns**: <code>number</code> - The corresponding clock hour (1-12)  

| Param | Type | Description |
| --- | --- | --- |
| segment | <code>number</code> | The segment number (0-23) |

<a name="segmentsToHours"></a>

## segmentsToHours(segments) ⇒ <code>Array.&lt;number&gt;</code>
Convert an array of segments to their corresponding clock hours

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> - Array of unique clock hours in ascending order  

| Param | Type | Description |
| --- | --- | --- |
| segments | <code>Array.&lt;number&gt;</code> | Array of segment numbers |

<a name="CryotherapySelection"></a>

## CryotherapySelection()
CryotherapySelection component for selecting cryotherapy status
Shows options from Table 2 of the paper

**Kind**: global function  
<a name="GaugeSelection"></a>

## GaugeSelection()
GaugeSelection component for selecting vitrectomy gauge
Allows selection of all gauges from Table 2 of the paper

**Kind**: global function  
<a name="TamponadeSelection"></a>

## TamponadeSelection()
TamponadeSelection component for selecting tamponade type
Shows all options from Table 2 of the paper

**Kind**: global function  
<a name="Toggle"></a>

## Toggle()
Toggle component for binary choices with consistent styling
Based on the radio button styling from RiskInputForm

Keyboard Navigation:
- Tab: Move focus to the radio group
- Space/Enter: Select focused option
- Arrow Left/Up: Select previous option
- Arrow Right/Down: Select next option

**Kind**: global function  
