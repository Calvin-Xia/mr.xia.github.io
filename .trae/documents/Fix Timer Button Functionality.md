## Fix Timer Button Functionality

### Problem Identified
The main issue is in the `Timer.init()` method in `main.js`. The code is checking if all three buttons (start, pause, reset) exist before adding any event listeners:

```javascript
if (startBtn && pauseBtn && resetBtn) {
    startBtn.addEventListener('click', () => this.start());
    pauseBtn.addEventListener('click', () => this.pause());
    resetBtn.addEventListener('click', () => this.reset());
    // 初始状态
    pauseBtn.disabled = true;
}
```

This means if any single button is missing, none of the event listeners will be added, causing all buttons to not work.

### Solution

1. **Fix Event Listener Binding**: Modify the `Timer.init()` method to add event listeners for each button individually, rather than all at once.

2. **Improve Button State Management**: Ensure each button's state is managed correctly, even if other buttons are not present.

3. **Check All Button IDs**: Verify that all button IDs in the HTML match what's being used in the JavaScript.

4. **Test ChangeTime Function**: Ensure the `changeTime` function in the HTML file is working correctly.

### Implementation Steps

1. **Modify Timer.init() Method**: Update the method to add event listeners for each button individually

2. **Update Button State Logic**: Ensure button states are managed correctly for each button

3. **Verify Button IDs**: Check that all button IDs match between HTML and JavaScript

4. **Test ChangeTime Function**: Ensure the function handles all cases correctly

### Expected Outcome
After the fix, all timer buttons should work correctly:
- Start button should start the timer
- Pause button should pause the timer
- Reset button should reset the timer
- Set Time button should set the target time from inputs
- Time adjustment buttons should work correctly

The timer display should update properly, and the progress bar should show the correct progress.