#!/bin/bash
cd /Users/rose/Code/retinal/RCRD
npm test -- --watchAll=false --testPathPattern="(Toggle|ModelToggle|RiskResults|GaugeSelection|RiskInputForm.base)" 2>&1