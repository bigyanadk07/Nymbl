// market/password-analyzer/password-analyzer.service.js

// ============================================================
// PATTERN DEFINITIONS
// ============================================================

const COMMON_WEAK_PATTERNS = [
  'password', 'passw0rd', 'admin', 'qwerty', 'qwerty123',
  'letmein', 'welcome', 'monkey', 'dragon', 'master',
  'login', 'abc123', 'iloveyou', 'sunshine', 'princess',
  'football', 'baseball', 'superman', 'trustno1', '123456',
  '111111', 'shadow', 'michael', 'jennifer'
];

const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;

// Anything that isn't a letter or number counts as "special".
const SPECIAL_CHARACTER_REGEX = /[^A-Za-z0-9]/;

// Same character repeated 3+ times in a row (e.g. "aaa", "111").
const REPEATED_CHARACTER_REGEX = /(.)\1{2,}/;


// ============================================================
// SEQUENTIAL PATTERN DETECTION
//
// Flags any 3-character run that is consecutively ascending or
// descending, letters or digits, case-insensitive — e.g. "123",
// "321", "abc", "cba". This follows the rule as written; note
// it WILL flag sequences embedded inside an otherwise strong
// password (e.g. "MyPassword123!" contains "123").
// ============================================================

const hasSequentialPattern = (password) => {

  const lower = password.toLowerCase();

  for (let i = 0; i < lower.length - 2; i++) {

    const a = lower.charCodeAt(i);
    const b = lower.charCodeAt(i + 1);
    const c = lower.charCodeAt(i + 2);

    const isAscending = (b - a === 1) && (c - b === 1);
    const isDescending = (a - b === 1) && (b - c === 1);

    if (isAscending || isDescending) {
      return true;
    }

  }

  return false;

};


// ============================================================
// COMMON WEAK PATTERN DETECTION
// ============================================================

const hasCommonPattern = (password) => {

  const lower = password.toLowerCase();

  return COMMON_WEAK_PATTERNS.some(
    pattern => lower.includes(pattern)
  );

};


// ============================================================
// SCORING
//
// A heuristic 0-100 score, not tied to any single published
// standard. Components:
//
//   - length:          up to 40 points (caps out around 13+ chars)
//   - character types: up to 40 points (10 per type, 4 types max)
//   - penalties:       repeated / sequential / common patterns
// ============================================================

const calculateScore = ({
  length,
  characterTypes,
  hasRepeatedCharacters,
  hasSequentialPattern,
  hasCommonPattern
}) => {

  let score = 0;

  score += Math.min(length * 3, 40);

  score += characterTypes * 10;

  if (hasRepeatedCharacters) {
    score -= 15;
  }

  if (hasSequentialPattern) {
    score -= 15;
  }

  if (hasCommonPattern) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));

};


// ============================================================
// CLASSIFICATION
// ============================================================

const classifyStrength = (score) => {

  if (score < 20) return 'Very Weak';
  if (score < 40) return 'Weak';
  if (score < 60) return 'Moderate';
  if (score < 80) return 'Strong';

  return 'Very Strong';

};


// ============================================================
// RECOMMENDATIONS
// ============================================================

const buildRecommendations = ({
  length,
  hasUppercase,
  hasLowercase,
  hasNumbers,
  hasSpecialCharacters,
  hasRepeatedCharacters,
  hasSequentialPattern,
  hasCommonPattern
}) => {

  const recommendations = [];

  if (length < 12) {
    recommendations.push('Use a longer password (at least 12 characters)');
  }

  if (!hasUppercase) {
    recommendations.push('Add uppercase letters');
  }

  if (!hasLowercase) {
    recommendations.push('Add lowercase letters');
  }

  if (!hasNumbers) {
    recommendations.push('Add numbers');
  }

  if (!hasSpecialCharacters) {
    recommendations.push('Add special characters (e.g. !@#$%^&*)');
  }

  if (hasRepeatedCharacters) {
    recommendations.push('Avoid repeating the same character multiple times in a row');
  }

  if (hasSequentialPattern) {
    recommendations.push('Avoid sequential patterns like "123" or "abc"');
  }

  if (hasCommonPattern) {
    recommendations.push('Avoid common words or patterns like "password" or "qwerty"');
  }

  return recommendations;

};


// ============================================================
// ANALYZE
//
// IMPORTANT: the password itself must never be logged or
// persisted anywhere in this function or its callers. Only
// derived boolean/numeric statistics are returned.
// ============================================================

const analyzePassword = (password) => {

  const length = password.length;

  const hasUppercase = UPPERCASE_REGEX.test(password);
  const hasLowercase = LOWERCASE_REGEX.test(password);
  const hasNumbers = NUMBER_REGEX.test(password);
  const hasSpecialCharacters = SPECIAL_CHARACTER_REGEX.test(password);

  const characterTypes =
    [hasUppercase, hasLowercase, hasNumbers, hasSpecialCharacters]
      .filter(Boolean).length;

  const repeatedCharacters = REPEATED_CHARACTER_REGEX.test(password);
  const sequentialPattern = hasSequentialPattern(password);
  const commonPattern = hasCommonPattern(password);

  const score = calculateScore({
    length,
    characterTypes,
    hasRepeatedCharacters: repeatedCharacters,
    hasSequentialPattern: sequentialPattern,
    hasCommonPattern: commonPattern
  });

  const strength = classifyStrength(score);

  const recommendations = buildRecommendations({
    length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecialCharacters,
    hasRepeatedCharacters: repeatedCharacters,
    hasSequentialPattern: sequentialPattern,
    hasCommonPattern: commonPattern
  });

  return {
    length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecialCharacters,
    characterTypes,
    hasRepeatedCharacters: repeatedCharacters,
    hasSequentialPattern: sequentialPattern,
    hasCommonPattern: commonPattern,
    score,
    strength,
    recommendations
  };

};

module.exports = {
  analyzePassword
};