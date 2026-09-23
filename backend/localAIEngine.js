  /**
 * Local AI Career Recommendation Engine
 * Generates personalized career advice based on student profile (CGPA, department, interests, career goals)
 * No external API required - fully self-contained and free!
 */

/**
 * Generate personalized career recommendations based on student profile
 * @param {Object} profile - { cgpa, department, year, careerGoal, interests }
 * @returns {string} - Formatted career recommendation text
 */
function generateCareerRecommendations(profile) {
  const { cgpa, department, year, careerGoal, interests } = profile;
  
  // Parse interests
  const interestsList = Array.isArray(interests) ? interests : 
                       (typeof interests === 'string' ? JSON.parse(interests || '[]') : []);
  
  // Determine CGPA tier
  const cgpaTier = cgpa != null ? 
    (cgpa >= 9.0 ? 'excellent' : cgpa >= 8.0 ? 'very-good' : cgpa >= 7.0 ? 'good' : cgpa >= 6.0 ? 'average' : 'needs-improvement') :
    'unknown';
  
  // Get department-specific career paths
  const deptCareers = getDepartmentCareers(department);
  
  // Analyze interests to suggest relevant paths
  const interestMatches = analyzeInterests(interestsList, department);
  
  // Build recommendation
  let recommendation = '';
  
  // Opening personalized greeting
  recommendation += `Based on your academic profile, here are personalized career recommendations tailored for you:\n\n`;
  
  // CGPA-based assessment
  recommendation += `📊 **Academic Performance Analysis**\n`;
  if (cgpa != null) {
    recommendation += `Your current CGPA of ${cgpa.toFixed(2)} indicates `;
    switch(cgpaTier) {
      case 'excellent':
        recommendation += `excellent academic performance. You're well-positioned for competitive roles and advanced programs. `;
        recommendation += `Consider pursuing research opportunities, internships at top companies, or higher studies.\n\n`;
        break;
      case 'very-good':
        recommendation += `strong academic performance. You have a solid foundation to pursue your career goals. `;
        recommendation += `Focus on building practical skills and gaining industry experience through internships.\n\n`;
        break;
      case 'good':
        recommendation += `good academic standing. Continue maintaining this level while strengthening your practical skills. `;
        recommendation += `Consider certifications and hands-on projects to enhance your profile.\n\n`;
        break;
      case 'average':
        recommendation += `room for improvement academically. Focus on core subjects while building a strong portfolio. `;
        recommendation += `Practical projects and certifications can significantly boost your career prospects.\n\n`;
        break;
      case 'needs-improvement':
        recommendation += `that you should prioritize improving your academic performance. `;
        recommendation += `Focus on core subjects, seek help when needed, and build practical skills through projects.\n\n`;
        break;
    }
  } else {
    recommendation += `Academic records are still being updated. Focus on maintaining strong performance in your current courses.\n\n`;
  }
  
  // Career goal alignment
  if (careerGoal) {
    recommendation += `🎯 **Your Career Goal: ${careerGoal}**\n`;
    recommendation += `This is a great direction! To achieve this goal:\n`;
    recommendation += getActionStepsForGoal(careerGoal, cgpaTier, department);
    recommendation += `\n`;
  }
  
  // Recommended career paths based on career goal first, then department/interests
  recommendation += `💼 **Recommended Career Paths for You**\n\n`;

  const goalSpecificPaths = getGoalSpecificCareerPaths(careerGoal, cgpaTier);
  const recommendedPaths = goalSpecificPaths.length > 0
    ? goalSpecificPaths
    : getTopCareerPaths(deptCareers, interestMatches, cgpaTier);
  
  recommendedPaths.forEach((path, index) => {
    recommendation += `${index + 1}. **${path.title}**\n`;
    recommendation += `   ${path.description}\n`;
    recommendation += `   💡 Why this fits: ${path.reason}\n`;
    recommendation += `   🛠️ Skills to build: ${path.skills.join(', ')}\n`;
    recommendation += `   📈 Next steps: ${path.nextSteps}\n\n`;
  });
  
  // Interest-based suggestions
  if (interestsList.length > 0) {
    recommendation += `✨ **Based on Your Interests**\n`;
    recommendation += `You've shown interest in: ${interestsList.join(', ')}\n`;
    recommendation += getInterestBasedAdvice(interestsList, department, cgpaTier);
    recommendation += `\n`;
  }
  
  // Year-specific advice
  recommendation += `📅 **Year-Specific Guidance**\n`;
  recommendation += getYearSpecificAdvice(year, cgpaTier);
  recommendation += `\n`;
  
  // Final encouragement
  recommendation += `🚀 **Final Thoughts**\n`;
  recommendation += `Remember, your career journey is unique. Focus on consistent effort, practical preparation, and discipline. `;
  if (isPublicServiceGoal(careerGoal)) {
    recommendation += `For civil services goals like IAS, success comes from structured preparation, current affairs, writing practice, and mock tests. `;
  } else {
    recommendation += `Your ${department} background can still be a strong advantage when combined with focused skill-building. `;
  }
  recommendation += `Stay motivated and keep improving every week.\n`;
  
  return recommendation;
}

/**
 * Get department-specific career paths
 */
function getDepartmentCareers(dept) {
  const careers = {
    'CSE': [
      { title: 'Full Stack Developer', category: 'web', skills: ['JavaScript', 'React', 'Node.js', 'Databases'], difficulty: 'medium' },
      { title: 'Machine Learning Engineer', category: 'ai', skills: ['Python', 'TensorFlow', 'Deep Learning'], difficulty: 'high' },
      { title: 'Cloud Solutions Architect', category: 'cloud', skills: ['AWS/Azure', 'DevOps', 'Networking'], difficulty: 'high' },
      { title: 'Data Scientist', category: 'data', skills: ['Python', 'SQL', 'Data Visualization', 'ML'], difficulty: 'medium' },
      { title: 'Mobile App Developer', category: 'mobile', skills: ['React Native', 'Flutter', 'APIs'], difficulty: 'medium' },
      { title: 'Cybersecurity Analyst', category: 'security', skills: ['Network Security', 'Ethical Hacking'], difficulty: 'high' },
      { title: 'DevOps Engineer', category: 'devops', skills: ['Docker', 'Kubernetes', 'CI/CD'], difficulty: 'high' },
      { title: 'Software Architect', category: 'architecture', skills: ['System Design', 'Microservices'], difficulty: 'very-high' }
    ],
    'ECE': [
      { title: 'VLSI Design Engineer', category: 'hardware', skills: ['Verilog/VHDL', 'Circuit Design'], difficulty: 'high' },
      { title: 'Embedded Systems Engineer', category: 'embedded', skills: ['C/C++', 'Microcontrollers', 'RTOS'], difficulty: 'medium' },
      { title: 'Signal Processing Engineer', category: 'signal', skills: ['MATLAB', 'DSP', 'Algorithms'], difficulty: 'high' },
      { title: 'IoT Solutions Developer', category: 'iot', skills: ['Embedded Systems', 'Cloud', 'Sensors'], difficulty: 'medium' },
      { title: 'RF/Antenna Engineer', category: 'rf', skills: ['RF Design', 'Antenna Theory'], difficulty: 'very-high' },
      { title: 'Telecommunications Engineer', category: 'telecom', skills: ['Networking', '5G', 'Protocols'], difficulty: 'high' }
    ],
    'EEE': [
      { title: 'Power Systems Engineer', category: 'power', skills: ['Power Systems', 'Grid Analysis'], difficulty: 'high' },
      { title: 'Control Systems Engineer', category: 'control', skills: ['Control Theory', 'PLC', 'Automation'], difficulty: 'high' },
      { title: 'Renewable Energy Engineer', category: 'renewable', skills: ['Solar/Wind Systems', 'Energy Storage'], difficulty: 'medium' },
      { title: 'Electrical Design Engineer', category: 'design', skills: ['CAD', 'Circuit Design', 'Standards'], difficulty: 'medium' },
      { title: 'Smart Grid Engineer', category: 'smartgrid', skills: ['IoT', 'Data Analytics', 'Grid Tech'], difficulty: 'high' }
    ],
    'MECH': [
      { title: 'Mechanical Design Engineer', category: 'design', skills: ['CAD/CAM', 'SolidWorks', 'FEA'], difficulty: 'medium' },
      { title: 'Thermal Engineer', category: 'thermal', skills: ['Thermodynamics', 'CFD', 'Heat Transfer'], difficulty: 'high' },
      { title: 'Manufacturing Engineer', category: 'manufacturing', skills: ['CNC', 'Process Optimization'], difficulty: 'medium' },
      { title: 'Automotive Engineer', category: 'automotive', skills: ['Vehicle Design', 'Engine Systems'], difficulty: 'high' },
      { title: 'Robotics Engineer', category: 'robotics', skills: ['Mechatronics', 'Control Systems'], difficulty: 'high' }
    ],
    'CIVIL': [
      { title: 'Structural Engineer', category: 'structural', skills: ['Structural Analysis', 'CAD', 'Standards'], difficulty: 'high' },
      { title: 'Transportation Engineer', category: 'transport', skills: ['Traffic Engineering', 'Planning'], difficulty: 'medium' },
      { title: 'Geotechnical Engineer', category: 'geotech', skills: ['Soil Mechanics', 'Foundation Design'], difficulty: 'high' },
      { title: 'Environmental Engineer', category: 'environmental', skills: ['Water Treatment', 'Sustainability'], difficulty: 'medium' },
      { title: 'Construction Project Manager', category: 'management', skills: ['Project Management', 'Planning'], difficulty: 'medium' }
    ]
  };
  
  return careers[dept] || careers['CSE']; // Default to CSE if unknown
}

/**
 * Analyze interests and match to career paths
 */
function analyzeInterests(interests, department) {
  const matches = {};
  const interestStr = interests.join(' ').toLowerCase();
  
  // Map interest keywords to career categories
  const categoryKeywords = {
    'web': ['web', 'frontend', 'backend', 'full stack', 'javascript', 'react', 'html', 'css'],
    'ai': ['machine learning', 'ai', 'artificial intelligence', 'deep learning', 'neural', 'data science'],
    'cloud': ['cloud', 'aws', 'azure', 'devops', 'docker', 'kubernetes'],
    'mobile': ['mobile', 'android', 'ios', 'app development', 'flutter', 'react native'],
    'security': ['cybersecurity', 'security', 'hacking', 'ethical hacking', 'network security'],
    'data': ['data', 'analytics', 'sql', 'database', 'big data'],
    'embedded': ['embedded', 'iot', 'microcontroller', 'arduino', 'raspberry'],
    'hardware': ['vlsi', 'circuit', 'hardware', 'chip design'],
    'design': ['design', 'cad', 'solidworks', 'autocad'],
    'power': ['power', 'electrical', 'grid', 'energy'],
    'control': ['control', 'automation', 'plc'],
    'renewable': ['renewable', 'solar', 'wind', 'green energy'],
    'structural': ['structural', 'construction', 'building'],
    'transport': ['transportation', 'traffic', 'highway']
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matchCount = keywords.filter(kw => interestStr.includes(kw)).length;
    if (matchCount > 0) {
      matches[category] = matchCount;
    }
  }
  
  return matches;
}

/**
 * Get top career paths based on department, interests, and CGPA
 */
function getTopCareerPaths(deptCareers, interestMatches, cgpaTier) {
  // Score and rank careers
  const scored = deptCareers.map(career => {
    let score = 0;
    
    // Interest match
    const interestScore = interestMatches[career.category] || 0;
    score += interestScore * 20;
    
    // CGPA suitability
    const difficultyMap = { 'very-high': 9.0, 'high': 8.0, 'medium': 7.0, 'low': 6.0 };
    const requiredCGPA = difficultyMap[career.difficulty] || 7.0;
    const cgpaNum = cgpaTier === 'excellent' ? 9.5 : cgpaTier === 'very-good' ? 8.5 : 
                   cgpaTier === 'good' ? 7.5 : cgpaTier === 'average' ? 6.5 : 5.5;
    
    if (cgpaNum >= requiredCGPA - 0.5) {
      score += 30;
    } else if (cgpaNum >= requiredCGPA - 1.0) {
      score += 15;
    }
    
    // Base score for all careers
    score += 10;
    
    return { ...career, score };
  });
  
  // Sort by score and take top 3
  const top3 = scored.sort((a, b) => b.score - a.score).slice(0, 3);
  
  // Add reasons and next steps
  return top3.map((path, index) => ({
    title: path.title,
    description: getCareerDescription(path.title, path.category),
    reason: getCareerReason(path, interestMatches, cgpaTier),
    skills: path.skills,
    nextSteps: getNextSteps(path.title, path.category, cgpaTier)
  }));
}

function isPublicServiceGoal(goal) {
  const goalLower = String(goal || '').toLowerCase();
  return goalLower.includes('ias') ||
         goalLower.includes('upsc') ||
         goalLower.includes('civil service') ||
         goalLower.includes('ips') ||
         goalLower.includes('ifs');
}

function getGoalSpecificCareerPaths(goal, cgpaTier) {
  if (!isPublicServiceGoal(goal)) return [];
  return [
    {
      title: 'IAS (Civil Services - CSE)',
      description: 'Prepare for UPSC Civil Services Examination with a structured prelims-mains-interview strategy.',
      reason: 'directly aligned with your stated goal',
      skills: ['Indian Polity', 'Current Affairs', 'Answer Writing', 'Ethics', 'Optional Subject Mastery'],
      nextSteps: 'Build a 12-month study plan, Read NCERT + standard books, Daily current affairs notes, Weekly mock tests'
    },
    {
      title: 'State Public Service (PSC/Group Services)',
      description: 'State civil services are a strong parallel track that builds the same governance and policy foundation.',
      reason: 'highly relevant backup for public administration goals',
      skills: ['State GK', 'Polity', 'Economy', 'Essay Writing'],
      nextSteps: 'Track state PSC notifications, Prepare state-specific syllabus, Practice answer writing and test series'
    },
    {
      title: 'Public Policy / Governance Analyst',
      description: 'Work in policy think tanks, governance consulting, or development sector roles while preparing.',
      reason: 'builds policy exposure and supports long-term IAS journey',
      skills: ['Policy Analysis', 'Research', 'Data Interpretation', 'Report Writing'],
      nextSteps: 'Complete public policy courses, Build policy briefs, Apply for internships in governance organizations'
    }
  ];
}

/**
 * Get career description
 */
function getCareerDescription(title, category) {
  const descriptions = {
    'Full Stack Developer': 'Build end-to-end web applications using modern frameworks and technologies.',
    'Machine Learning Engineer': 'Develop AI/ML models and deploy intelligent systems for real-world applications.',
    'Cloud Solutions Architect': 'Design and implement scalable cloud infrastructure solutions.',
    'Data Scientist': 'Analyze large datasets to derive actionable business insights.',
    'Mobile App Developer': 'Create native and cross-platform mobile applications.',
    'Cybersecurity Analyst': 'Protect systems and networks from security threats.',
    'VLSI Design Engineer': 'Design and verify integrated circuits and chips.',
    'Embedded Systems Engineer': 'Develop firmware for IoT and embedded devices.',
    'Power Systems Engineer': 'Design and maintain electrical power generation and distribution systems.',
    'Mechanical Design Engineer': 'Create and optimize mechanical systems and components.',
    'Structural Engineer': 'Design safe and efficient structures and buildings.'
  };
  
  return descriptions[title] || `A promising career path in ${category} with strong industry demand.`;
}

/**
 * Get reason why this career fits
 */
function getCareerReason(path, interestMatches, cgpaTier) {
  const reasons = [];
  
  if (interestMatches[path.category]) {
    reasons.push('matches your interests');
  }
  
  if (cgpaTier === 'excellent' || cgpaTier === 'very-good') {
    reasons.push('your strong academic performance');
  }
  
  if (path.difficulty === 'high' || path.difficulty === 'very-high') {
    if (cgpaTier === 'excellent' || cgpaTier === 'very-good') {
      reasons.push('suitable for challenging roles');
    }
  } else {
    reasons.push('good entry point');
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'aligned with your department';
}

/**
 * Get next steps for a career path
 */
function getNextSteps(title, category, cgpaTier) {
  const steps = [];
  
  if (cgpaTier === 'excellent' || cgpaTier === 'very-good') {
    steps.push('Apply for internships at top companies');
    steps.push('Build portfolio projects');
    steps.push('Consider relevant certifications');
  } else if (cgpaTier === 'good') {
    steps.push('Focus on building practical skills');
    steps.push('Start with personal projects');
    steps.push('Look for entry-level opportunities');
  } else {
    steps.push('Strengthen core fundamentals');
    steps.push('Build small projects to demonstrate skills');
    steps.push('Consider online courses and certifications');
  }
  
  return steps.join(', ');
}

/**
 * Get action steps for career goal
 */
function getActionStepsForGoal(goal, cgpaTier, department) {
  const goalLower = goal.toLowerCase();
  let steps = '';
  
  if (isPublicServiceGoal(goalLower)) {
    steps += `• Understand UPSC syllabus and exam pattern (Prelims, Mains, Interview)\n`;
    steps += `• Build a fixed daily timetable for GS, optional subject, and current affairs\n`;
    steps += `• Practice answer writing and join a quality test series\n`;
    steps += `• Revise regularly and track progress with monthly targets\n`;
  } else if (goalLower.includes('developer') || goalLower.includes('programming') || goalLower.includes('software')) {
    steps += `• Build a portfolio of projects showcasing your coding skills\n`;
    steps += `• Contribute to open-source projects\n`;
    steps += `• Practice coding problems on platforms like LeetCode, HackerRank\n`;
    steps += `• Learn version control (Git) and collaboration tools\n`;
  } else if (goalLower.includes('data') || goalLower.includes('analyst')) {
    steps += `• Master SQL and data manipulation tools\n`;
    steps += `• Learn data visualization (Tableau, Power BI)\n`;
    steps += `• Work on real-world datasets and case studies\n`;
  } else if (goalLower.includes('machine learning') || goalLower.includes('ai')) {
    steps += `• Complete ML courses (Coursera, edX)\n`;
    steps += `• Build ML projects from scratch\n`;
    steps += `• Participate in Kaggle competitions\n`;
  } else {
    steps += `• Research companies and roles in this field\n`;
    steps += `• Connect with professionals on LinkedIn\n`;
    steps += `• Gain relevant certifications or training\n`;
  }
  
  if (cgpaTier === 'needs-improvement' || cgpaTier === 'average') {
    steps += `• Focus on improving your CGPA while building practical skills\n`;
  }
  
  return steps;
}

/**
 * Get interest-based advice
 */
function getInterestBasedAdvice(interests, department, cgpaTier) {
  let advice = '';
  const interestStr = interests.join(' ').toLowerCase();
  
  if (interestStr.includes('web') || interestStr.includes('frontend') || interestStr.includes('backend')) {
    advice += `Your interest in web development is valuable. Start with HTML/CSS/JavaScript fundamentals, `;
    advice += `then move to frameworks like React or Node.js. Build real projects to showcase your skills.\n`;
  } else if (interestStr.includes('machine learning') || interestStr.includes('ai') || interestStr.includes('data')) {
    advice += `AI/ML is a rapidly growing field. Focus on Python, statistics, and hands-on ML projects. `;
    advice += `Consider certifications from reputable platforms.\n`;
  } else if (interestStr.includes('cloud') || interestStr.includes('devops')) {
    advice += `Cloud and DevOps skills are highly in demand. Start with AWS/Azure fundamentals, `;
    advice += `learn Docker and CI/CD pipelines. Practical experience is key.\n`;
  } else {
    advice += `Your interests align well with ${department} career paths. `;
    advice += `Continue exploring these areas through projects and coursework.\n`;
  }
  
  return advice;
}

/**
 * Get year-specific advice
 */
function getYearSpecificAdvice(year, cgpaTier) {
  const yearNum = parseInt(year) || 0;
  
  if (yearNum === 1) {
    return `As a first-year student, focus on building strong fundamentals. Explore different areas, ` +
           `join clubs, and start building a foundation. Your CGPA matters, so maintain good grades ` +
           `while exploring your interests.\n`;
  } else if (yearNum === 2) {
    return `Second year is perfect for exploring career paths. Start building projects, ` +
           `consider internships, and identify your strengths. This is when you should start ` +
           `thinking about specialization.\n`;
  } else if (yearNum === 3) {
    return `Third year is crucial for career preparation. Focus on internships, ` +
           `build a strong portfolio, and network with professionals. ` +
           `${cgpaTier === 'excellent' || cgpaTier === 'very-good' ? 'Your strong academic performance gives you an advantage.' : 'Continue improving your skills and academic performance.'}\n`;
  } else if (yearNum === 4) {
    return `Final year - time to prepare for placements or higher studies! ` +
           `Polish your resume, practice interviews, and leverage your academic performance. ` +
           `Your projects and internships will be crucial now.\n`;
  } else {
    return `Continue focusing on your academics and building practical skills. ` +
           `Stay updated with industry trends in your field.\n`;
  }
}

module.exports = { generateCareerRecommendations };
