export const checkPasswordStrength = (password) => {
  let score = 0;
  
  if (!password || password.length < 6) {
    return {
      strength: 'weak',
      message: 'Weak',
      score: 0,
      color: '#FF4444', // Red
      maxScore: 4
    };
  }

  // Check password conditions with more detailed scoring
  const conditions = {
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasGoodLength: password.length >= 8,
    hasExcellentLength: password.length >= 12
  };

  // Base scoring
  if (conditions.hasLowerCase) score += 1;
  if (conditions.hasUpperCase) score += 1;
  if (conditions.hasNumber) score += 1;
  if (conditions.hasSpecialChar) score += 1;

  // Bonus points for length and combination
  if (conditions.hasGoodLength) score += 0.5;
  if (conditions.hasExcellentLength) score += 0.5;

  // Calculate final score (max 4)
  score = Math.min(4, score);

  // Determine strength based on score
  if (score <= 2) {
    return {
      strength: 'weak',
      message: 'Weak',
      score: Math.floor(score),
      color: '#FF4444', // Red
      maxScore: 4
    };
  } else if (score < 4) {
    return {
      strength: 'medium',
      message: 'Medium',
      score: Math.floor(score),
      color: '#FFA700', // Orange
      maxScore: 4
    };
  } else {
    return {
      strength: 'strong',
      message: 'Strong',
      score: 4,
      color: '#00C851', // Green
      maxScore: 4
    };
  }
}; 