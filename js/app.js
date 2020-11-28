(function () {
  var timerUpdateDate = 0,
    flagDigital = false,
    interval,
    arrDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    arrMonth = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

  /**
   * Updates the date and sets refresh callback on the next day.
   * @private
   * @param {number} prevDay - date of the previous day
   */
  function updateDate(prevDay) {
    var datetime = tizen.time.getCurrentDateTime(),
      nextInterval,
      strDay = document.getElementById("str-day"),
      strFullDate,
      getDay = datetime.getDay(),
      getDate = datetime.getDate(),
      getMonth = datetime.getMonth();

    // Check the update condition.
    // if prevDate is '0', it will always update the date.
    if (prevDay !== null) {
      if (prevDay === getDay) {
        /**
         * If the date was not changed (meaning that something went wrong),
         * call updateDate again after a second.
         */
        nextInterval = 1000;
      } else {
        /**
         * If the day was changed,
         * call updateDate at the beginning of the next day.
         */
        // Calculate how much time is left until the next day.
        nextInterval =
          (23 - datetime.getHours()) * 60 * 60 * 1000 +
          (59 - datetime.getMinutes()) * 60 * 1000 +
          (59 - datetime.getSeconds()) * 1000 +
          (1000 - datetime.getMilliseconds()) +
          1;
      }
    }

    if (getDate < 10) {
      getDate = "0" + getDate;
    }

    strFullDate = arrDay[getDay] + ", " + arrMonth[getMonth] + " " + getDate;
    strDay.innerHTML = strFullDate;

    // If an updateDate timer already exists, clear the previous timer.
    if (timerUpdateDate) {
      clearTimeout(timerUpdateDate);
    }

    // Set next timeout for date update.
    timerUpdateDate = setTimeout(function () {
      updateDate(getDay);
    }, nextInterval);
  }

  function humanize(num) {
    const capitalize = (s) => {
      if (typeof s !== "string") {
        return "";
      }
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    var ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    var tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    var numString = num.toString();

    if (num < 0) {
      throw new Error("Negative numbers are not supported.");
    }

    if (num === 0) {
      return "o'clock";
    }

    //the case of 1 - 20
    if (num < 20) {
      return capitalize(ones[num]);
    }

    if (numString.length === 2) {
      return capitalize(tens[numString[0]] + " " + ones[numString[1]]);
    }
  }

  /**
   * Updates the current time.
   * @private
   */
  function updateTime() {
    var strHours = document.getElementById("str-hours"),
      strMinutes = document.getElementById("str-minutes"),
      datetime = tizen.time.getCurrentDateTime(),
      hour = datetime.getHours(),
      minute = datetime.getMinutes();

    hour = hour % 12 === 0 ? 12 : hour % 12;

    strHours.innerHTML = humanize(hour);
    strMinutes.innerHTML = humanize(minute);
  }

  function updateSteps() {
    function onsuccessCB(pedometerInfo) {
      var steps_count = document.getElementById("steps-count");
      steps_count.innerHTML = pedometerInfo.cumulativeTotalStepCount;
    }

    function onerrorCB(error) {
      console.log(
        "Error occurs. name:" + error.name + ", message: " + error.message
      );
    }

    tizen.humanactivitymonitor.getHumanActivityData(
      "PEDOMETER",
      onsuccessCB,
      onerrorCB
    );
  }

  /**
   * Sets to background image as BACKGROUND_URL,
   * and starts timer for normal digital watch mode.
   * @private
   */
  function initDigitalWatch() {
    flagDigital = true;
    // document.getElementById("digital-body").style.backgroundImage = BACKGROUND_URL;
    interval = setInterval(updateTime, 500);
  }

  /**
   * Clears timer and sets background image as none for ambient digital watch mode.
   * @private
   */
  function ambientDigitalWatch() {
    flagDigital = false;
    clearInterval(interval);
    document.getElementById("digital-body").style.backgroundImage = "none";
    updateTime();
  }

  /**
   * Updates watch screen. (time and date)
   * @private
   */
  function updateWatch() {
    updateTime();
    updateDate(0);
    updateSteps();
  }

  /**
   * Binds events.
   * @private
   */
  function bindEvents() {
    // add eventListener for timetick
    window.addEventListener("timetick", function () {
      ambientDigitalWatch();
    });

    // add eventListener for ambientmodechanged
    window.addEventListener("ambientmodechanged", function (e) {
      if (e.detail.ambientMode === true) {
        // rendering ambient mode case
        ambientDigitalWatch();
      } else {
        // rendering normal digital mode case
        initDigitalWatch();
      }
    });

    // add eventListener to update the screen immediately when the device wakes up.
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        updateWatch();
      }
    });

    // add event listener to update watch screen when the time zone is changed.
    tizen.time.setTimezoneChangeListener(function () {
      updateWatch();
    });

    // add even listener to update steps when Pedometer change occurs
    tizen.humanactivitymonitor.setAccumulativePedometerListener(function () {
      updateSteps();
    });
  }

  /**
   * Initializes date and time.
   * Sets to digital mode.
   * @private
   */
  function init() {
    initDigitalWatch();
    updateDate(0);
    updateSteps();

    bindEvents();
  }

  window.onload = init();
})();
