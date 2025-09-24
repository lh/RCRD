#!/usr/bin/env Rscript

# RCRD Risk Calculation Model in R
# Implementation matching JavaScript riskCalculations.js

# Model coefficients from BEAVRS database study
COEFFICIENTS <- list(
  constant = -1.611,
  
  age = list(
    "45-64" = 0,      # Reference
    "65-79" = 0.236,
    "80+" = 0.498,
    "<45" = 0.459
  ),
  
  breakLocation = list(
    "9-3" = 0,        # Reference
    "4-8" = 0.428,
    "5-7" = 0.607,
    "none" = 0.676
  ),
  
  inferiorDetachment = list(
    "less_than_3" = 0,  # Reference
    "3_to_5" = 0.441,
    "6_hours" = 0.435
  ),
  
  totalDetachment = list(
    "no" = 0,         # Reference
    "yes" = 0.663
  ),
  
  pvrGrade = list(
    "none" = 0,       # Reference
    "C" = 0.220
  ),
  
  cryotherapy = list(
    "no" = 0,         # Reference
    "yes" = -0.420
  ),
  
  tamponade = list(
    "sf6" = 0,        # Reference
    "c2f6" = -0.417,
    "c3f8" = -0.104,
    "air" = -0.159,
    "light_oil" = 0.670,
    "heavy_oil" = 0.030
  ),
  
  vitrectomyGauge = list(
    "20g" = 0,        # Reference
    "23g" = -0.408,
    "25g" = -0.885,
    "27g" = -0.703,
    "not_recorded" = -0.738
  )
)

# Helper function to get age group
getAgeGroup <- function(age) {
  ageNum <- as.numeric(age)
  if (is.na(ageNum)) return("45-64")
  
  if (ageNum < 45) return("<45")
  if (ageNum < 65) return("45-64")
  if (ageNum < 80) return("65-79")
  if (ageNum >= 80) return("80+")
  return("45-64")
}

# Helper function to get break location category
getBreakLocation <- function(selectedHours) {
  if (is.null(selectedHours) || length(selectedHours) == 0) return("none")
  
  # Check for breaks in 5-7 range (highest priority)
  if (any(selectedHours >= 5 & selectedHours <= 7)) return("5-7")
  
  # Check for breaks at 4 or 8
  if (any(selectedHours == 4 | selectedHours == 8)) return("4-8")
  
  # Default to 9-3 location
  return("9-3")
}

# Helper function to check if detachment is total
isTotalRD <- function(segments) {
  if (is.null(segments) || length(segments) == 0) return("no")
  
  # Total detachment if 23 or more segments
  if (length(segments) >= 23) return("yes") else return("no")
}

# Helper function to check if segments touch a specific hour
segmentsTouchHour <- function(segments, hour) {
  # Each hour covers segments in a pattern
  # Hour 12: segments 23, 0, 1
  # Hour 1: segments 1, 2, 3
  # Hour 2: segments 3, 4, 5
  # etc.
  
  hourToSegments <- list(
    "12" = c(23, 0, 1),
    "1" = c(1, 2, 3),
    "2" = c(3, 4, 5),
    "3" = c(5, 6, 7),
    "4" = c(7, 8, 9),
    "5" = c(9, 10, 11),
    "6" = c(11, 12, 13),
    "7" = c(13, 14, 15),
    "8" = c(15, 16, 17),
    "9" = c(17, 18, 19),
    "10" = c(19, 20, 21),
    "11" = c(21, 22, 23)
  )
  
  hourSegments <- hourToSegments[[as.character(hour)]]
  if (is.null(hourSegments)) return(FALSE)
  
  # Check if any of the hour's segments are in the provided segments
  return(any(segments %in% hourSegments))
}

# Helper function to get inferior detachment category
getInferiorDetachment <- function(segments) {
  if (is.null(segments) || length(segments) == 0) return("less_than_3")
  
  # Convert segments to numeric if needed
  segments <- as.numeric(segments)
  
  # Count inferior hours (3-9)
  inferiorHours <- c(3, 4, 5, 6, 7, 8, 9)
  inferiorCount <- sum(sapply(inferiorHours, function(hour) {
    segmentsTouchHour(segments, hour)
  }))
  
  if (inferiorCount >= 6) return("6_hours")
  if (inferiorCount >= 3) return("3_to_5")
  return("less_than_3")
}

# Helper function to get PVR grade category
getPVRGrade <- function(pvrGrade) {
  if (is.null(pvrGrade)) return("none")
  if (pvrGrade == "C") return("C") else return("none")
}

# Main risk calculation function
calculateRisk <- function(age, pvrGrade = "none", vitrectomyGauge = "20g",
                         selectedHours = NULL, detachmentSegments = NULL,
                         cryotherapy = "no", tamponade = "sf6") {
  
  # Initialize logit with constant
  logit <- COEFFICIENTS$constant
  
  # Add age coefficient
  ageGroup <- getAgeGroup(age)
  logit <- logit + COEFFICIENTS$age[[ageGroup]]
  
  # Add break location coefficient
  breakLocation <- getBreakLocation(selectedHours)
  logit <- logit + COEFFICIENTS$breakLocation[[breakLocation]]
  
  # Add inferior detachment coefficient
  inferiorDetachment <- getInferiorDetachment(detachmentSegments)
  logit <- logit + COEFFICIENTS$inferiorDetachment[[inferiorDetachment]]
  
  # Add total RD coefficient
  totalRD <- isTotalRD(detachmentSegments)
  logit <- logit + COEFFICIENTS$totalDetachment[[totalRD]]
  
  # Add PVR grade coefficient
  pvrCategory <- getPVRGrade(pvrGrade)
  logit <- logit + COEFFICIENTS$pvrGrade[[pvrCategory]]
  
  # Add vitrectomy gauge coefficient
  if (!is.null(vitrectomyGauge) && vitrectomyGauge %in% names(COEFFICIENTS$vitrectomyGauge)) {
    logit <- logit + COEFFICIENTS$vitrectomyGauge[[vitrectomyGauge]]
  }
  
  # Add cryotherapy coefficient
  if (!is.null(cryotherapy) && cryotherapy %in% names(COEFFICIENTS$cryotherapy)) {
    logit <- logit + COEFFICIENTS$cryotherapy[[cryotherapy]]
  }
  
  # Add tamponade coefficient
  if (!is.null(tamponade) && tamponade %in% names(COEFFICIENTS$tamponade)) {
    logit <- logit + COEFFICIENTS$tamponade[[tamponade]]
  }
  
  # Calculate probability
  probability <- 100 / (1 + exp(-logit))
  
  # Round to 2 decimal places for consistency
  probability <- round(probability, 2)
  
  return(list(
    probability = probability,
    logit = logit,
    ageGroup = ageGroup,
    breakLocation = breakLocation,
    inferiorDetachment = inferiorDetachment,
    totalRD = totalRD,
    pvrCategory = pvrCategory
  ))
}

# Test function for command line usage
if (!interactive()) {
  args <- commandArgs(trailingOnly = TRUE)
  
  if (length(args) == 0) {
    # Default test case
    result <- calculateRisk(
      age = 55,
      pvrGrade = "none",
      vitrectomyGauge = "25g",
      selectedHours = c(5, 6),
      detachmentSegments = 1:10,
      cryotherapy = "no",
      tamponade = "sf6"
    )
    
    cat(sprintf("Test Case Result:\n"))
    cat(sprintf("Probability: %.2f%%\n", result$probability))
    cat(sprintf("Logit: %.4f\n", result$logit))
    cat(sprintf("Age Group: %s\n", result$ageGroup))
    cat(sprintf("Break Location: %s\n", result$breakLocation))
    cat(sprintf("Inferior Detachment: %s\n", result$inferiorDetachment))
    cat(sprintf("Total RD: %s\n", result$totalRD))
    cat(sprintf("PVR Category: %s\n", result$pvrCategory))
  } else {
    # Parse JSON input from command line
    library(jsonlite)
    input <- fromJSON(args[1])
    
    result <- calculateRisk(
      age = input$age,
      pvrGrade = input$pvrGrade,
      vitrectomyGauge = input$vitrectomyGauge,
      selectedHours = input$selectedHours,
      detachmentSegments = input$detachmentSegments,
      cryotherapy = input$cryotherapy,
      tamponade = input$tamponade
    )
    
    # Output as JSON for easy parsing
    cat(toJSON(result, auto_unbox = TRUE))
  }
}