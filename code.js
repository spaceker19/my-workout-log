document.addEventListener('DOMContentLoaded', () => {
    // --- Program Definition ---
    const program = [
        {
            dayName: "Day 1: Light Strength & Core",
            exercises: [
                "Bodyweight Squats: 2 sets of 8-10 reps",
                "Glute Bridges: 2 sets of 10-12 reps",
                "Knee Push-ups (or Wall): 2 sets AMRAP (aim 5-10)",
                "Plank: 2 sets, hold 15-30 seconds"
            ]
        },
        {
            dayName: "Day 2: Light Cardio & Mobility",
            exercises: [
                "Brisk Walking: 20 minutes",
                "Mobility (5-10 min): Cat-Cow, Thread Needle, Spinal Twists"
            ]
        },
        {
            dayName: "Day 3: Active Recovery or Rest",
            exercises: [
                "Option 1: Gentle Walk (15-20 min) OR Light Stretching",
                "Option 2: Complete Rest"
            ]
        },
        {
            dayName: "Day 4: Light Strength & Core",
            exercises: [
                "Alternating Lunges: 2 sets of 6-8 reps per leg",
                "Bird-Dog: 2 sets of 8-10 reps per side",
                "Wall/Knee Push-ups: 2 sets AMRAP (aim 5-10)",
                "Plank: 2 sets, hold 15-30 seconds"
            ]
        },
        {
            dayName: "Day 5: Light Cardio",
            exercises: [
                "Brisk Walking: 20-25 minutes (try slight incline/speed)"
            ]
        },
        {
            dayName: "Day 6: Mobility & Flexibility Focus",
            exercises: [
                "Dynamic Stretches (10 min): Arm circles, leg swings, torso twists",
                "Static Stretches (10 min, hold 30s each): Quads, Hams, Glutes, Chest, Tris, Child's Pose"
            ]
        },
        {
            dayName: "Day 7: Rest",
            exercises: [
                "Complete Rest - allow your body to recover!"
            ]
        }
    ];

    // --- DOM Elements ---
    const workoutDayNameEl = document.getElementById('workout-day-name');
    const workoutExercisesEl = document.getElementById('workout-exercises');
    const logDateEl = document.getElementById('log-date');
    const notesTextarea = document.getElementById('workout-notes');
    const logButton = document.getElementById('log-button');
    const logConfirmationEl = document.getElementById('log-confirmation');
    const historyListEl = document.getElementById('history-list');
    const resetButton = document.getElementById('reset-button');

    // --- State Variables ---
    let currentDayIndex = 0;
    let workoutLogs = [];
    let lastLogDate = null; // Track the date of the last log

    // --- Functions ---

    // Load state from localStorage
    function loadState() {
        const storedIndex = localStorage.getItem('currentDayIndex');
        const storedLogs = localStorage.getItem('workoutLogs');
        const storedLastLogDate = localStorage.getItem('lastLogDate');

        currentDayIndex = storedIndex ? parseInt(storedIndex, 10) : 0;
        workoutLogs = storedLogs ? JSON.parse(storedLogs) : [];
        lastLogDate = storedLastLogDate ? storedLastLogDate : null;

        // Check if a day has passed since the last log to advance the cycle
        const todayStr = new Date().toDateString();
        if (lastLogDate && lastLogDate !== todayStr) {
            // Only advance if a log was actually made on the previous day shown
            const lastLogWasForPreviousDay = workoutLogs.some(log => log.date === lastLogDate && log.dayIndex === currentDayIndex);
            if(lastLogWasForPreviousDay) {
                 currentDayIndex = (currentDayIndex + 1) % program.length;
                 localStorage.setItem('currentDayIndex', currentDayIndex.toString());
            }
        } else if (!lastLogDate && workoutLogs.length > 0) {
             // Edge case: Logs exist but no lastLogDate (maybe from older version), try to sync
             const lastLog = workoutLogs[workoutLogs.length - 1];
             if (lastLog.date !== todayStr) {
                 currentDayIndex = (lastLog.dayIndex + 1) % program.length;
                 localStorage.setItem('currentDayIndex', currentDayIndex.toString());
             } else {
                 currentDayIndex = lastLog.dayIndex; // Stay on the current day if last log was today
             }
        }
    }

    // Save state to localStorage
    function saveState() {
        localStorage.setItem('currentDayIndex', currentDayIndex.toString());
        localStorage.setItem('workoutLogs', JSON.stringify(workoutLogs));
        localStorage.setItem('lastLogDate', lastLogDate);
    }

    // Display the workout for the current day index
    function displayCurrentWorkout() {
        const todayWorkout = program[currentDayIndex];
        workoutDayNameEl.textContent = todayWorkout.dayName;

        workoutExercisesEl.innerHTML = ''; // Clear previous exercises
        todayWorkout.exercises.forEach(exercise => {
            const li = document.createElement('li');
            li.textContent = exercise;
            workoutExercisesEl.appendChild(li);
        });

        logDateEl.textContent = new Date().toLocaleDateString(); // Show today's date for logging
    }

    // Display the workout history
    function displayHistory() {
        historyListEl.innerHTML = ''; // Clear previous history
        if (workoutLogs.length === 0) {
            historyListEl.innerHTML = '<li>No workouts logged yet.</li>';
            return;
        }

        // Display logs in reverse chronological order (newest first)
        [...workoutLogs].reverse().forEach(log => {
            const li = document.createElement('li');
            const dayName = program[log.dayIndex] ? program[log.dayIndex].dayName : 'Unknown Day'; // Handle potential index mismatch
            li.innerHTML = `
                <span class="log-date">${new Date(log.date).toLocaleDateString()} - ${dayName}</span>
                ${log.notes ? `<span class="log-notes">Notes: ${log.notes}</span>` : ''}
            `;
            historyListEl.appendChild(li);
        });
    }

    // Handle logging the workout
    function handleLogWorkout() {
        const todayStr = new Date().toDateString(); // Use toDateString for simple day comparison
        const notes = notesTextarea.value.trim();

        // Prevent logging the same day multiple times *unless* it's intended for progression tracking
        // Simple check: Don't log if the last log was today FOR THE SAME DAY INDEX
        const alreadyLoggedToday = workoutLogs.some(log => log.date === todayStr && log.dayIndex === currentDayIndex);

        if (alreadyLoggedToday) {
             logConfirmationEl.textContent = 'Already logged for this day. Progress to next day tomorrow!';
             setTimeout(() => logConfirmationEl.textContent = '', 3000); // Clear message
             return;
        }


        const logEntry = {
            date: todayStr,
            dayIndex: currentDayIndex,
            notes: notes
        };

        workoutLogs.push(logEntry);
        lastLogDate = todayStr; // Update the last log date

        // Don't advance day index immediately, advance on next page load if date changed
        // currentDayIndex = (currentDayIndex + 1) % program.length; // Cycle through program

        notesTextarea.value = ''; // Clear notes
        logConfirmationEl.textContent = 'Workout Logged Successfully!';
        setTimeout(() => logConfirmationEl.textContent = '', 3000); // Clear message after 3 seconds

        saveState();
        displayHistory();
        // No need to redisplay workout, it stays same until next day/load
    }

     // Handle resetting all data
    function handleResetData() {
        if (confirm('Are you sure you want to delete ALL workout history and reset the cycle? This cannot be undone.')) {
            localStorage.removeItem('currentDayIndex');
            localStorage.removeItem('workoutLogs');
            localStorage.removeItem('lastLogDate');

            // Reset state variables
            currentDayIndex = 0;
            workoutLogs = [];
            lastLogDate = null;

            // Refresh display
            displayCurrentWorkout();
            displayHistory();
            logConfirmationEl.textContent = 'All data has been reset.';
             setTimeout(() => logConfirmationEl.textContent = '', 3000);
        }
    }


    // --- Event Listeners ---
    logButton.addEventListener('click', handleLogWorkout);
    resetButton.addEventListener('click', handleResetData);

    // --- Initial Load ---
    loadState();
    displayCurrentWorkout();
    displayHistory();
});