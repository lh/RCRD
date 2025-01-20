## Modules

<dl>
<dt><a href="#module_riskCalculations">riskCalculations</a></dt>
<dd><p>Risk calculation utilities for the Retinal Detachment Risk Calculator.
These functions implement the risk calculation model based on the BEAVRS database study.
The calculations take into account various factors including age, break location,
detachment characteristics, and surgical parameters to estimate redetachment risk.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getStepExplanation">getStepExplanation(step, value)</a> ⇒ <code>string</code></dt>
<dd><p>Get explanation text for a calculation step</p>
</dd>
<dt><a href="#getProbabilityFormulaText">getProbabilityFormulaText(logit)</a> ⇒ <code>string</code></dt>
<dd><p>Format the probability formula text</p>
</dd>
<dt><a href="#getProbabilityResultText">getProbabilityResultText(probability)</a> ⇒ <code>string</code></dt>
<dd><p>Format the probability result text</p>
</dd>
<dt><a href="#getMethodologyNote">getMethodologyNote()</a> ⇒ <code>string</code></dt>
<dd><p>Get the methodology note text</p>
</dd>
<dt><a href="#getRiskSummaryText">getRiskSummaryText(probability)</a> ⇒ <code>string</code></dt>
<dd><p>Get the risk summary text</p>
</dd>
<dt><a href="#getRiskSummarySubtitle">getRiskSummarySubtitle()</a> ⇒ <code>string</code></dt>
<dd><p>Get the risk summary subtitle text</p>
</dd>
</dl>

<a name="module_riskCalculations"></a>

## riskCalculations
Risk calculation utilities for the Retinal Detachment Risk Calculator.
These functions implement the risk calculation model based on the BEAVRS database study.
The calculations take into account various factors including age, break location,
detachment characteristics, and surgical parameters to estimate redetachment risk.


* [riskCalculations](#module_riskCalculations)
    * [.getAgeGroup(age)](#module_riskCalculations.getAgeGroup) ⇒ <code>string</code>
    * [.getBreakLocation(selectedHours)](#module_riskCalculations.getBreakLocation) ⇒ <code>string</code>
    * [.isTotalRD(segments)](#module_riskCalculations.isTotalRD) ⇒ <code>string</code>
    * [.getInferiorDetachment(segments)](#module_riskCalculations.getInferiorDetachment) ⇒ <code>string</code>
    * [.getPVRGrade(pvrGrade)](#module_riskCalculations.getPVRGrade) ⇒ <code>string</code>
    * [.calculateRiskWithSteps(params)](#module_riskCalculations.calculateRiskWithSteps) ⇒ <code>Object</code>

<a name="module_riskCalculations.getAgeGroup"></a>

### riskCalculations.getAgeGroup(age) ⇒ <code>string</code>
Determines the age group category for risk calculation

**Kind**: static method of [<code>riskCalculations</code>](#module_riskCalculations)  
**Returns**: <code>string</code> - Age group category: "<45", "45-64", "65-79", or "80+"  

| Param | Type | Description |
| --- | --- | --- |
| age | <code>string</code> | Patient age as a string |

**Example**  
```js
getAgeGroup("42") // returns "<45"
getAgeGroup("70") // returns "65-79"
```
<a name="module_riskCalculations.getBreakLocation"></a>

### riskCalculations.getBreakLocation(selectedHours) ⇒ <code>string</code>
Determines the break location category based on selected clock hours

**Kind**: static method of [<code>riskCalculations</code>](#module_riskCalculations)  
**Returns**: <code>string</code> - Break location category: "5-7", "4-8", "9-3", or "none"  

| Param | Type | Description |
| --- | --- | --- |
| selectedHours | <code>Array.&lt;number&gt;</code> | Array of selected break hours (1-12) |

**Example**  
```js
getBreakLocation([5, 6]) // returns "5-7"
getBreakLocation([4]) // returns "4-8"
```
<a name="module_riskCalculations.isTotalRD"></a>

### riskCalculations.isTotalRD(segments) ⇒ <code>string</code>
Determines if the detachment is total based on number of affected segments

**Kind**: static method of [<code>riskCalculations</code>](#module_riskCalculations)  
**Returns**: <code>string</code> - "yes" if total detachment (23+ segments), "no" otherwise  

| Param | Type | Description |
| --- | --- | --- |
| segments | <code>Array.&lt;(string\|number)&gt;</code> | Array of segment IDs or numbers |

**Example**  
```js
isTotalRD(["segment1", "segment2"]) // returns "no"
isTotalRD(Array(24).fill().map((_, i) => i)) // returns "yes"
```
<a name="module_riskCalculations.getInferiorDetachment"></a>

### riskCalculations.getInferiorDetachment(segments) ⇒ <code>string</code>
Determines the inferior detachment category based on affected inferior hours

**Kind**: static method of [<code>riskCalculations</code>](#module_riskCalculations)  
**Returns**: <code>string</code> - Inferior detachment category: "6_hours", "3_to_5", or "less_than_3"  

| Param | Type | Description |
| --- | --- | --- |
| segments | <code>Array.&lt;(string\|number)&gt;</code> | Array of segment IDs or numbers |

**Example**  
```js
getInferiorDetachment(["segment15", "segment16", "segment17"]) // returns "3_to_5"
```
<a name="module_riskCalculations.getPVRGrade"></a>

### riskCalculations.getPVRGrade(pvrGrade) ⇒ <code>string</code>
Determines the PVR grade category for risk calculation

**Kind**: static method of [<code>riskCalculations</code>](#module_riskCalculations)  
**Returns**: <code>string</code> - PVR grade category: 'C' or 'none'  

| Param | Type | Description |
| --- | --- | --- |
| pvrGrade | <code>string</code> | PVR grade ('C' or other) |

**Example**  
```js
getPVRGrade('C') // returns 'C'
getPVRGrade('B') // returns 'none'
```
<a name="module_riskCalculations.calculateRiskWithSteps"></a>

### riskCalculations.calculateRiskWithSteps(params) ⇒ <code>Object</code>
Calculates redetachment risk with detailed calculation steps

**Kind**: static method of [<code>riskCalculations</code>](#module_riskCalculations)  
**Returns**: <code>Object</code> - Risk calculation results  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| params | <code>Object</code> |  | Risk calculation parameters |
| params.age | <code>string</code> |  | Patient age |
| params.pvrGrade | <code>string</code> |  | PVR grade |
| params.vitrectomyGauge | <code>string</code> |  | Vitrectomy gauge size |
| [params.selectedHours] | <code>Array.&lt;number&gt;</code> | <code>[]</code> | Array of selected break hours |
| [params.detachmentSegments] | <code>Array.&lt;(string\|number)&gt;</code> | <code>[]</code> | Array of detachment segments |
| [params.cryotherapy] | <code>string</code> | <code>&quot;&#x27;no&#x27;&quot;</code> | Whether cryotherapy was used |
| [params.tamponade] | <code>string</code> | <code>&quot;&#x27;sf6&#x27;&quot;</code> | Type of tamponade used |
| [params.modelType] | <code>string</code> | <code>&quot;MODEL_TYPE.FULL&quot;</code> | Risk model type to use |

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| probability | <code>number</code> | Calculated risk probability (0-100) |
| steps | <code>Array.&lt;Object&gt;</code> | Detailed calculation steps |
| logit | <code>number</code> | Final logit value |
| age | <code>string</code> | Age group used |
| pvrGrade | <code>string</code> | PVR grade category used |
| vitrectomyGauge | <code>string</code> | Vitrectomy gauge used |
| cryotherapy | <code>string</code> | Cryotherapy status used |
| tamponade | <code>string</code> | Tamponade type used |

**Example**  
```js
const result = calculateRiskWithSteps({
  age: "65",
  pvrGrade: "C",
  vitrectomyGauge: "23g",
  selectedHours: [5, 6],
  detachmentSegments: ["segment1", "segment2"],
  cryotherapy: "yes",
  tamponade: "c3f8"
});
```
<a name="getStepExplanation"></a>

## getStepExplanation(step, value) ⇒ <code>string</code>
Get explanation text for a calculation step

**Kind**: global function  
**Returns**: <code>string</code> - The explanation text  

| Param | Type | Description |
| --- | --- | --- |
| step | <code>string</code> | The step name |
| value | <code>number</code> | The coefficient value |

<a name="getProbabilityFormulaText"></a>

## getProbabilityFormulaText(logit) ⇒ <code>string</code>
Format the probability formula text

**Kind**: global function  
**Returns**: <code>string</code> - The formula text  

| Param | Type | Description |
| --- | --- | --- |
| logit | <code>number</code> | The logit value |

<a name="getProbabilityResultText"></a>

## getProbabilityResultText(probability) ⇒ <code>string</code>
Format the probability result text

**Kind**: global function  
**Returns**: <code>string</code> - The result text  

| Param | Type | Description |
| --- | --- | --- |
| probability | <code>number</code> | The probability value |

<a name="getMethodologyNote"></a>

## getMethodologyNote() ⇒ <code>string</code>
Get the methodology note text

**Kind**: global function  
**Returns**: <code>string</code> - The methodology note text  
<a name="getRiskSummaryText"></a>

## getRiskSummaryText(probability) ⇒ <code>string</code>
Get the risk summary text

**Kind**: global function  
**Returns**: <code>string</code> - The risk summary text  

| Param | Type | Description |
| --- | --- | --- |
| probability | <code>number</code> | The probability value |

<a name="getRiskSummarySubtitle"></a>

## getRiskSummarySubtitle() ⇒ <code>string</code>
Get the risk summary subtitle text

**Kind**: global function  
**Returns**: <code>string</code> - The risk summary subtitle text  
