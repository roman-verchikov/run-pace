/* eslint-disable require-jsdoc */
'use strict';


function toSeconds(hours = 0, minutes = 0, seconds = 0) {
  return hours * 60 * 60 + minutes * 60 + seconds;
}

function leadingZeroes(num) {
  if (num.split('.')[0].length === 1) {
    return '0' + num;
  }
  return num;
}

function toMinutesAndSeconds(seconds) {
  const mins = Math.floor(seconds % 3600 / 60);
  const secs = seconds % 60;
  const hours = Math.floor(seconds / 3600);

  const minsAndSecs = (
    leadingZeroes(mins.toString()) + ':' +
    leadingZeroes(secs.toFixed(1))
  );

  if (isNaN(hours) || isNaN(mins) || isNaN(seconds)) {
    return 'NA';
  } else if (hours === 0) {
    return minsAndSecs;
  } else {
    return leadingZeroes(hours.toString()) + ':' + minsAndSecs;
  }
}

function imperialToMetric(secondsPerMile) {
  return secondsPerMile / 1.60934;
}

function metricToImperial(secondsPerKm) {
  return secondsPerKm * 1.60934;
}

function parseInput(inputValue) {
  const split = inputValue.split(':');
  let seconds = 0;
  let minutes = 0;
  let hours = 0;

  if (split.length === 1) {
    seconds = parseFloat(split[0]);
  } else if (split.length === 2) {
    minutes = parseInt(split[0]);
    seconds = parseFloat(split[1]);
  } else if (split.length === 3) {
    hours = parseInt(split[0]);
    minutes = parseInt(split[1]);
    seconds = parseFloat(split[2]);
  }

  return [hours, minutes, seconds];
}

function toMetric(hours, minutes, seconds, modifier) {
  const totalSeconds = toSeconds(hours, minutes, seconds);
  const metricPaceInSeconds = modifier(totalSeconds);
  return toMinutesAndSeconds(metricPaceInSeconds);
}

function updatePace(inputField, resultSelector, modifier) {
  const defaultPace = 'NA';
  if (inputField.value === '') {
    document.querySelector(resultSelector).innerHTML = defaultPace;
    return;
  }

  const pace = parseInput(inputField.value);
  const hours = pace[0];
  const minutes = pace[1];
  const seconds = pace[2];

  if (isNaN(minutes) || isNaN(seconds)) {
    document.querySelector(resultSelector).value = defaultPace;
  } else {
    document.querySelector(resultSelector).value = toMetric(
        hours, minutes, seconds, modifier,
    );
  }
}

function toggleCustomDistanceInput() {
  const distanceInput = document.querySelector('#distance');
  const distanceContainer = document.querySelector('#distance_container');
  const customDistanceContainer = document.querySelector(
      '#custom_distance_container'
  );
  const isCustom = distanceInput.selectedOptions[0].value === 'custom';
  if (isCustom) {
    distanceContainer.className = 'input-field col s3';
    customDistanceContainer.className = 'input-field col s3';
  } else {
    distanceContainer.className = 'input-field col s6';
    customDistanceContainer.className = 'input-field col s3 hide';
  }
}

function getDistance() {
  const distanceInput = document.querySelector('#distance');
  const distanceSelectorValue = distanceInput.selectedOptions[0].value;
  let distanceKm = distanceSelectorValue;
  if (distanceSelectorValue === 'custom') {
    const customDistanceInput = document.querySelector('#custom_distance');
    distanceKm = customDistanceInput.value;
  }
  return parseFloat(distanceKm);
}

function distanceChanged() {
  const timeInput = document.querySelector('#distance_time');
  const paceInput = document.querySelector('#metric_pace');
  const pace = parseInput(paceInput.value);
  const distanceKm = getDistance();

  toggleCustomDistanceInput();

  const time = toSeconds(pace[0], pace[1], pace[2]) * distanceKm;
  timeInput.value = toMinutesAndSeconds(time);
}

function updateMetricPace() {
  const inputField = document.querySelector('#imperial_pace');
  updatePace(inputField, '#metric_pace', imperialToMetric);
}

function updateImperialPace() {
  const inputField = document.querySelector('#metric_pace');
  updatePace(inputField, '#imperial_pace', metricToImperial);
}

function updatePaceForDistance() {
  const distanceKm = getDistance();
  const timeInput = document.querySelector('#distance_time');
  const time = parseInput(timeInput.value);

  const seconds = toSeconds(time[0], time[1], time[2]);

  const paceMetric = seconds / distanceKm;
  const paceImperial = seconds / distanceKm * 1.60934;

  const metricPaceHuman = toMinutesAndSeconds(paceMetric);
  const imperialPaceHuman = toMinutesAndSeconds(paceImperial);

  const paceInput = document.querySelector('#metric_pace');
  paceInput.value = metricPaceHuman;

  const imperialPaceInput = document.querySelector('#imperial_pace');
  imperialPaceInput.value = imperialPaceHuman;
}

function miToKm(miles) {
  return miles * 1.60934;
}

function initializeDistanceSelection() {
  const distanceSelector = document.querySelector('#distance');
  const options = {
    '1 km': 1,
    '1 mi': miToKm(1),
    '3 km': 3,
    '5 km': 5,
    '10 km': 10,
    '10 mi': miToKm(10),
    '20 km': 20,
    'Half marathon': 21.1,
    'Full marathon': 42.2,
    'custom': 'custom',
  };
  // eslint-disable-next-line guard-for-in
  for (const label in options) {
    const opt = document.createElement('option');
    opt.value = options[label];
    opt.text = label;
    distanceSelector.add(opt);
  }
}

function initializeSlider() {
  const elems = document.querySelectorAll('.slider');
  // eslint-disable-next-line no-unused-vars
  const instances = M.Slider.init(elems);
}

function registerListeners() {
  const listeners = [
    ['distance', 'change', distanceChanged],
    ['imperial_pace', 'keyup', updateMetricPace],
    ['imperial_pace', 'keyup', distanceChanged],
    ['metric_pace', 'keyup', updateImperialPace],
    ['metric_pace', 'keyup', distanceChanged],
    ['custom_distance', 'keyup', distanceChanged],
    ['distance_time', 'keyup', updatePaceForDistance],
  ];

  window.addEventListener('DOMContentLoaded', function(event) {
    initializeDistanceSelection();
    initializeSlider();

    listeners.forEach(function(element) {
      const elementId = element[0];
      const event = element[1];
      const callback = element[2];

      document.getElementById(elementId).addEventListener(event, callback);
      const elems = document.querySelectorAll('select');

      M.FormSelect.init(elems);
    });
  });
}

registerListeners();
