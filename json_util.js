function extractJsonWithKey(arbitraryText, requiredKey) {
  let firstOpen = -1;
  while ((firstOpen = arbitraryText.indexOf('{', firstOpen + 1)) !== -1) {
    let countOpen = 1;
    let countClosed = 0;
    let i = firstOpen;
    // Iterate through the string to find the matching closing brace, accounting for nesting
    while (i < arbitraryText.length && countOpen !== countClosed) {
      i++;
      if (arbitraryText[i] === '{') {
        countOpen++;
      } else if (arbitraryText[i] === '}') {
        countClosed++;
      }
    }

    // If a balanced set of braces is found
    if (countOpen === countClosed) {
      const candidate = arbitraryText.substring(firstOpen, i + 1);
      try {
        const jsonObject = JSON.parse(candidate);

        // Check if the parsed object is a plain object and contains the required key
        if (typeof jsonObject === 'object' && jsonObject !== null && !Array.isArray(jsonObject) && Object.prototype.hasOwnProperty.call(jsonObject, requiredKey)) {
          return jsonObject;
        }
      } catch (e) {
        // Not a valid JSON, continue searching
      }
    }
  }

  return null; // No valid JSON object with the key was found
}