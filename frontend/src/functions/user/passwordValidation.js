// Gemensam lösenordsvalidering för registrering och lösenordsåterställning.
// Matchar kraven i backend (userController.js): minst 10 tecken, minst en bokstav och minst en siffra.
export const PASSWORD_REQUIREMENTS_TEXT =
  "Password must be at least 10 characters long and contain at least one letter and one number.";

const LETTER_AND_NUMBER_REGEX = /^(?=.*[A-Za-z])(?=.*\d)/;

export function validatePasswordInput(password, confirmPassword = null) {
  if (!password || password.length < 10) {
    return "Password must be at least 10 characters long.";
  }

  if (!LETTER_AND_NUMBER_REGEX.test(password)) {
    return "Password must contain at least one letter and one number.";
  }

  if (confirmPassword !== null && password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}