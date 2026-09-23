-- RG23 Regulation Courses for GIST
-- Comprehensive course structure for all branches
CREATE DATABASE IF NOT EXISTS gist_mentoring_system;
USE gist_mentoring_system;

-- Add R23 Regulation if not exists
INSERT IGNORE INTO regulations (id, name, description, is_active) VALUES 
('r23', 'R23 Regulation', 'Autonomous Regulation 2023', TRUE);

-- Add R23 Branches
INSERT IGNORE INTO branches (id, regulation_id, name, code, description, is_active) VALUES 
('cse-r23', 'r23', 'Computer Science and Engineering', 'CSE', 'CSE Branch under R23', TRUE),
('ece-r23', 'r23', 'Electronics and Communication Engineering', 'ECE', 'ECE Branch under R23', TRUE),
('eee-r23', 'r23', 'Electrical and Electronics Engineering', 'EEE', 'EEE Branch under R23', TRUE),
('civil-r23', 'r23', 'Civil Engineering', 'CIVIL', 'CIVIL Branch under R23', TRUE),
('aiml-r23', 'r23', 'Artificial Intelligence and Machine Learning', 'AIML', 'AIML Branch under R23', TRUE),
('aids-r23', 'r23', 'Artificial Intelligence and Data Science', 'AIDS', 'AIDS Branch under R23', TRUE);

-- CSE R23 Courses
INSERT IGNORE INTO subjects (id, branch_id, code, name, semester, credits, type, description, is_active) VALUES 
-- Semester 1
('cs101-cse-r23', 'cse-r23', 'CS101', 'Programming for Problem Solving', 1, 4, 'Theory', 'Basic programming concepts and problem-solving', TRUE),
('cs102-cse-r23', 'cse-r23', 'CS102', 'Mathematics for Computing I', 1, 4, 'Theory', 'Discrete mathematics and logic', TRUE),
('cs103-cse-r23', 'cse-r23', 'CS103', 'Applied Physics', 1, 3, 'Theory', 'Physics fundamentals', TRUE),
('cs104-cse-r23', 'cse-r23', 'CS104', 'Professional Ethics and IPR', 1, 2, 'Theory', 'Ethics and intellectual property', TRUE),
('cs105-cse-r23', 'cse-r23', 'CS105', 'Engineering Graphics and CAD', 1, 3, 'Lab', 'Technical drawing and CAD', TRUE),
('cs106-cse-r23', 'cse-r23', 'CS106', 'Programming Lab', 1, 2, 'Lab', 'Hands-on programming practice', TRUE),
-- Semester 2
('cs201-cse-r23', 'cse-r23', 'CS201', 'Data Structures', 2, 4, 'Theory', 'Arrays, lists, trees, graphs', TRUE),
('cs202-cse-r23', 'cse-r23', 'CS202', 'Mathematics for Computing II', 2, 4, 'Theory', 'Calculus and linear algebra', TRUE),
('cs203-cse-r23', 'cse-r23', 'CS203', 'Digital Logic Design', 2, 3, 'Theory', 'Boolean algebra and circuits', TRUE),
('cs204-cse-r23', 'cse-r23', 'CS204', 'Applied Chemistry', 2, 3, 'Theory', 'Chemistry fundamentals', TRUE),
('cs205-cse-r23', 'cse-r23', 'CS205', 'Data Structures Lab', 2, 2, 'Lab', 'Implementation of data structures', TRUE),
('cs206-cse-r23', 'cse-r23', 'CS206', 'Digital Logic Design Lab', 2, 2, 'Lab', 'Logic circuit design', TRUE),
-- Semester 3
('cs301-cse-r23', 'cse-r23', 'CS301', 'Algorithms', 3, 4, 'Theory', 'Algorithm design and analysis', TRUE),
('cs302-cse-r23', 'cse-r23', 'CS302', 'Database Systems', 3, 4, 'Theory', 'Database design and SQL', TRUE),
('cs303-cse-r23', 'cse-r23', 'CS303', 'Computer Architecture', 3, 3, 'Theory', 'CPU design and organization', TRUE),
('cs304-cse-r23', 'cse-r23', 'CS304', 'Discrete Mathematics', 3, 3, 'Theory', 'Sets, relations, graph theory', TRUE),
('cs305-cse-r23', 'cse-r23', 'CS305', 'Algorithms Lab', 3, 2, 'Lab', 'Algorithm implementation', TRUE),
('cs306-cse-r23', 'cse-r23', 'CS306', 'Database Lab', 3, 2, 'Lab', 'Database design practical', TRUE),
-- Semester 4
('cs401-cse-r23', 'cse-r23', 'CS401', 'Operating Systems', 4, 4, 'Theory', 'Process management and memory', TRUE),
('cs402-cse-r23', 'cse-r23', 'CS402', 'Web Technologies', 4, 4, 'Theory', 'HTML, CSS, JavaScript, Web frameworks', TRUE),
('cs403-cse-r23', 'cse-r23', 'CS403', 'Computer Networks', 4, 3, 'Theory', 'Network protocols and architecture', TRUE),
('cs404-cse-r23', 'cse-r23', 'CS404', 'Software Engineering', 4, 3, 'Theory', 'Software development lifecycle', TRUE),
('cs405-cse-r23', 'cse-r23', 'CS405', 'Operating Systems Lab', 4, 2, 'Lab', 'OS concepts implementation', TRUE),
('cs406-cse-r23', 'cse-r23', 'CS406', 'Web Technologies Lab', 4, 2, 'Lab', 'Web development practical', TRUE),
-- Semester 5
('cs501-cse-r23', 'cse-r23', 'CS501', 'Machine Learning', 5, 4, 'Theory', 'Supervised and unsupervised learning', TRUE),
('cs502-cse-r23', 'cse-r23', 'CS502', 'Cloud Computing', 5, 3, 'Theory', 'Cloud infrastructure and services', TRUE),
('cs503-cse-r23', 'cse-r23', 'CS503', 'Information Security', 5, 3, 'Theory', 'Cryptography and cybersecurity', TRUE),
('cs-elective1-r23', 'cse-r23', 'CS-E1', 'Elective I', 5, 3, 'Theory', 'Specialized elective course', TRUE),
('cs505-cse-r23', 'cse-r23', 'CS505', 'Machine Learning Lab', 5, 2, 'Lab', 'ML implementation', TRUE),
-- Semester 6
('cs601-cse-r23', 'cse-r23', 'CS601', 'Artificial Intelligence', 6, 4, 'Theory', 'AI fundamentals and applications', TRUE),
('cs602-cse-r23', 'cse-r23', 'CS602', 'Big Data Analytics', 6, 3, 'Theory', 'Hadoop, Spark, data mining', TRUE),
('cs603-cse-r23', 'cse-r23', 'CS603', 'Compiler Design', 6, 3, 'Theory', 'Language processing', TRUE),
('cs-elective2-r23', 'cse-r23', 'CS-E2', 'Elective II', 6, 3, 'Theory', 'Specialized elective course', TRUE),
('cs605-cse-r23', 'cse-r23', 'CS605', 'AI Lab', 6, 2, 'Lab', 'AI implementation', TRUE),
-- Semester 7
('cs701-cse-r23', 'cse-r23', 'CS701', 'Blockchain and Cryptocurrency', 7, 3, 'Theory', 'Distributed ledger technology', TRUE),
('cs702-cse-r23', 'cse-r23', 'CS702', 'IoT and Edge Computing', 7, 3, 'Theory', 'Internet of Things', TRUE),
('cs703-cse-r23', 'cse-r23', 'CS703', 'Natural Language Processing', 7, 3, 'Theory', 'NLP techniques', TRUE),
('cs-elective3-r23', 'cse-r23', 'CS-E3', 'Elective III', 7, 3, 'Theory', 'Specialized elective course', TRUE),
-- Semester 8
('cs801-cse-r23', 'cse-r23', 'CS801', 'Project Work', 8, 8, 'Project', 'Capstone project', TRUE),
('cs802-cse-r23', 'cse-r23', 'CS802', 'Seminar', 8, 2, 'Theory', 'Research seminar', TRUE);

-- ECE R23 Courses (Representative selection)
INSERT IGNORE INTO subjects (id, branch_id, code, name, semester, credits, type, description, is_active) VALUES 
-- Semester 1
('ec101-ece-r23', 'ece-r23', 'EC101', 'Circuit Theory', 1, 4, 'Theory', 'Basic circuit analysis', TRUE),
('ec102-ece-r23', 'ece-r23', 'EC102', 'Mathematics I', 1, 4, 'Theory', 'Calculus fundamentals', TRUE),
('ec103-ece-r23', 'ece-r23', 'EC103', 'Applied Physics', 1, 3, 'Theory', 'Physics for electronics', TRUE),
('ec104-ece-r23', 'ece-r23', 'EC104', 'Professional Ethics', 1, 2, 'Theory', 'Ethics in engineering', TRUE),
('ec105-ece-r23', 'ece-r23', 'EC105', 'Workshop Practice', 1, 2, 'Lab', 'Hands-on workshop', TRUE),
-- Semester 2
('ec201-ece-r23', 'ece-r23', 'EC201', 'Electronic Devices and Circuits', 2, 4, 'Theory', 'Semiconductors and circuits', TRUE),
('ec202-ece-r23', 'ece-r23', 'EC202', 'Signals and Systems', 2, 4, 'Theory', 'Signal processing fundamentals', TRUE),
('ec203-ece-r23', 'ece-r23', 'EC203', 'Digital Electronics', 2, 3, 'Theory', 'Digital logic', TRUE),
('ec204-ece-r23', 'ece-r23', 'EC204', 'Mathematics II', 2, 3, 'Theory', 'Linear algebra and transforms', TRUE),
('ec205-ece-r23', 'ece-r23', 'EC205', 'Electronics Lab', 2, 2, 'Lab', 'Circuit implementation', TRUE),
-- Semester 3
('ec301-ece-r23', 'ece-r23', 'EC301', 'Analog Circuits', 3, 4, 'Theory', 'Amplifiers and filters', TRUE),
('ec302-ece-r23', 'ece-r23', 'EC302', 'Microprocessors', 3, 4, 'Theory', 'Microprocessor architecture', TRUE),
('ec303-ece-r23', 'ece-r23', 'EC303', 'Control Systems', 3, 3, 'Theory', 'Feedback and control', TRUE),
('ec304-ece-r23', 'ece-r23', 'EC304', 'Electromagnetic Theory', 3, 3, 'Theory', 'Maxwell equations', TRUE),
('ec305-ece-r23', 'ece-r23', 'EC305', 'Analog Circuits Lab', 3, 2, 'Lab', 'Amplifier design', TRUE),
-- Semester 4
('ec401-ece-r23', 'ece-r23', 'EC401', 'Communications I', 4, 4, 'Theory', 'Analog communications', TRUE),
('ec402-ece-r23', 'ece-r23', 'EC402', 'Power Electronics', 4, 4, 'Theory', 'Power conversion devices', TRUE),
('ec403-ece-r23', 'ece-r23', 'EC403', 'VLSI Design', 4, 3, 'Theory', 'Integrated circuit design', TRUE),
('ec404-ece-r23', 'ece-r23', 'EC404', 'Measurement and Instrumentation', 4, 3, 'Theory', 'Test and measurement', TRUE),
('ec405-ece-r23', 'ece-r23', 'EC405', 'Communications Lab', 4, 2, 'Lab', 'Communication systems', TRUE),
-- Remaining semesters follow similar pattern
('ec501-ece-r23', 'ece-r23', 'EC501', 'Communications II', 5, 4, 'Theory', 'Digital communications', TRUE),
('ec502-ece-r23', 'ece-r23', 'EC502', 'Antenna and RF Systems', 5, 3, 'Theory', 'RF engineering', TRUE),
('ec601-ece-r23', 'ece-r23', 'EC601', 'Embedded Systems', 6, 4, 'Theory', 'Microcontroller design', TRUE),
('ec602-ece-r23', 'ece-r23', 'EC602', 'Optical Communications', 6, 3, 'Theory', 'Fiber optics', TRUE),
('ec701-ece-r23', 'ece-r23', 'EC701', 'IoT Systems', 7, 3, 'Theory', 'Internet of Things', TRUE),
('ec801-ece-r23', 'ece-r23', 'EC801', 'Project Work', 8, 8, 'Project', 'Capstone project', TRUE);

-- EEE R23 Courses (Representative selection)
INSERT IGNORE INTO subjects (id, branch_id, code, name, semester, credits, type, description, is_active) VALUES 
('ee101-eee-r23', 'eee-r23', 'EE101', 'Circuit Theory', 1, 4, 'Theory', 'Basic circuit analysis', TRUE),
('ee102-eee-r23', 'eee-r23', 'EE102', 'Mathematics I', 1, 4, 'Theory', 'Calculus fundamentals', TRUE),
('ee103-eee-r23', 'eee-r23', 'EE103', 'Applied Physics', 1, 3, 'Theory', 'Physics for electrical engineering', TRUE),
('ee104-eee-r23', 'eee-r23', 'EE104', 'Professional Ethics', 1, 2, 'Theory', 'Engineering ethics', TRUE),
('ee105-eee-r23', 'eee-r23', 'EE105', 'Engineering Workshop', 1, 2, 'Lab', 'Hands-on workshop', TRUE),
('ee201-eee-r23', 'eee-r23', 'EE201', 'Electromagnetic Theory', 2, 4, 'Theory', 'Maxwell equations and fields', TRUE),
('ee202-eee-r23', 'eee-r23', 'EE202', 'Electrical Machines I', 2, 4, 'Theory', 'DC and AC machines', TRUE),
('ee203-eee-r23', 'eee-r23', 'EE203', 'Power Systems I', 2, 3, 'Theory', 'Power generation and transmission', TRUE),
('ee204-eee-r23', 'eee-r23', 'EE204', 'Mathematics II', 2, 3, 'Theory', 'Linear transforms and differential equations', TRUE),
('ee301-eee-r23', 'eee-r23', 'EE301', 'Power Electronics', 3, 4, 'Theory', 'Power conversion devices', TRUE),
('ee302-eee-r23', 'eee-r23', 'EE302', 'Control Systems', 3, 4, 'Theory', 'Feedback control theory', TRUE),
('ee303-eee-r23', 'eee-r23', 'EE303', 'Electrical Machines II', 3, 3, 'Theory', 'Synchronous and induction machines', TRUE),
('ee304-eee-r23', 'eee-r23', 'EE304', 'Signals and Systems', 3, 3, 'Theory', 'Signal processing', TRUE),
('ee401-eee-r23', 'eee-r23', 'EE401', 'High Voltage Engineering', 4, 4, 'Theory', 'HV systems and testing', TRUE),
('ee402-eee-r23', 'eee-r23', 'EE402', 'Power Systems II', 4, 4, 'Theory', 'Power system analysis', TRUE),
('ee403-eee-r23', 'eee-r23', 'EE403', 'HVDC and FACTS', 4, 3, 'Theory', 'Flexible AC transmission', TRUE),
('ee501-eee-r23', 'eee-r23', 'EE501', 'Renewable Energy Systems', 5, 4, 'Theory', 'Solar, wind, hydro power', TRUE),
('ee601-eee-r23', 'eee-r23', 'EE601', 'Smart Grids', 6, 4, 'Theory', 'Advanced power systems', TRUE),
('ee801-eee-r23', 'eee-r23', 'EE801', 'Project Work', 8, 8, 'Project', 'Capstone project', TRUE);

-- CIVIL R23 Courses (Representative selection)
INSERT IGNORE INTO subjects (id, branch_id, code, name, semester, credits, type, description, is_active) VALUES 
('cv101-civil-r23', 'civil-r23', 'CV101', 'Engineering Mechanics', 1, 4, 'Theory', 'Statics and dynamics', TRUE),
('cv102-civil-r23', 'civil-r23', 'CV102', 'Mathematics I', 1, 4, 'Theory', 'Calculus fundamentals', TRUE),
('cv103-civil-r23', 'civil-r23', 'CV103', 'Applied Physics', 1, 3, 'Theory', 'Physics for civil engineering', TRUE),
('cv104-civil-r23', 'civil-r23', 'CV104', 'Professional Ethics', 1, 2, 'Theory', 'Engineering ethics', TRUE),
('cv105-civil-r23', 'civil-r23', 'CV105', 'Survey Practice', 1, 2, 'Lab', 'Basic surveying', TRUE),
('cv201-civil-r23', 'civil-r23', 'CV201', 'Strength of Materials', 2, 4, 'Theory', 'Stress and strain analysis', TRUE),
('cv202-civil-r23', 'civil-r23', 'CV202', 'Building Materials', 2, 4, 'Theory', 'Properties and testing of materials', TRUE),
('cv203-civil-r23', 'civil-r23', 'CV203', 'Surveying', 2, 3, 'Theory', 'Land surveying principles', TRUE),
('cv204-civil-r23', 'civil-r23', 'CV204', 'Mathematics II', 2, 3, 'Theory', 'Linear algebra and differential equations', TRUE),
('cv301-civil-r23', 'civil-r23', 'CV301', 'Structural Analysis I', 3, 4, 'Theory', 'Beam and frame analysis', TRUE),
('cv302-civil-r23', 'civil-r23', 'CV302', 'Geotechnical Engineering I', 3, 4, 'Theory', 'Soil properties and foundations', TRUE),
('cv303-civil-r23', 'civil-r23', 'CV303', 'Environmental Engineering I', 3, 3, 'Theory', 'Water supply and treatment', TRUE),
('cv304-civil-r23', 'civil-r23', 'CV304', 'Transportation Engineering I', 3, 3, 'Theory', 'Highway design and planning', TRUE),
('cv401-civil-r23', 'civil-r23', 'CV401', 'Structural Analysis II', 4, 4, 'Theory', 'Advanced structural analysis', TRUE),
('cv402-civil-r23', 'civil-r23', 'CV402', 'Geotechnical Engineering II', 4, 4, 'Theory', 'Foundation design', TRUE),
('cv403-civil-r23', 'civil-r23', 'CV403', 'Environmental Engineering II', 4, 3, 'Theory', 'Wastewater treatment', TRUE),
('cv501-civil-r23', 'civil-r23', 'CV501', 'Reinforced Concrete Design', 5, 4, 'Theory', 'RC beam and slab design', TRUE),
('cv601-civil-r23', 'civil-r23', 'CV601', 'Steel Structure Design', 6, 4, 'Theory', 'Steel member and connection design', TRUE),
('cv801-civil-r23', 'civil-r23', 'CV801', 'Project Work', 8, 8, 'Project', 'Capstone project', TRUE);

-- AIML R23 Courses
INSERT IGNORE INTO subjects (id, branch_id, code, name, semester, credits, type, description, is_active) VALUES 
('ai101-aiml-r23', 'aiml-r23', 'AI101', 'Foundations of AI and ML', 1, 4, 'Theory', 'AI and ML fundamentals', TRUE),
('ai102-aiml-r23', 'aiml-r23', 'AI102', 'Mathematics for AI I', 1, 4, 'Theory', 'Linear algebra and calculus', TRUE),
('ai103-aiml-r23', 'aiml-r23', 'AI103', 'Programming for AI', 1, 3, 'Theory', 'Python for AI', TRUE),
('ai104-aiml-r23', 'aiml-r23', 'AI104', 'Professional Ethics', 1, 2, 'Theory', 'Ethics in AI', TRUE),
('ai105-aiml-r23', 'aiml-r23', 'AI105', 'AI Programming Lab', 1, 2, 'Lab', 'Python programming practice', TRUE),
('ai201-aiml-r23', 'aiml-r23', 'AI201', 'Machine Learning I', 2, 4, 'Theory', 'Supervised learning', TRUE),
('ai202-aiml-r23', 'aiml-r23', 'AI202', 'Data Analytics', 2, 4, 'Theory', 'Data analysis and visualization', TRUE),
('ai203-aiml-r23', 'aiml-r23', 'AI203', 'Mathematics for AI II', 2, 3, 'Theory', 'Probability and statistics', TRUE),
('ai301-aiml-r23', 'aiml-r23', 'AI301', 'Deep Learning', 3, 4, 'Theory', 'Neural networks and DL frameworks', TRUE),
('ai302-aiml-r23', 'aiml-r23', 'AI302', 'Natural Language Processing', 3, 4, 'Theory', 'NLP techniques and applications', TRUE),
('ai303-aiml-r23', 'aiml-r23', 'AI303', 'Computer Vision', 3, 3, 'Theory', 'Image processing and CV', TRUE),
('ai401-aiml-r23', 'aiml-r23', 'AI401', 'Reinforcement Learning', 4, 4, 'Theory', 'RL algorithms and applications', TRUE),
('ai402-aiml-r23', 'aiml-r23', 'AI402', 'Time Series Analysis', 4, 3, 'Theory', 'Temporal data modeling', TRUE),
('ai501-aiml-r23', 'aiml-r23', 'AI501', 'Generative AI', 5, 4, 'Theory', 'GANs and diffusion models', TRUE),
('ai502-aiml-r23', 'aiml-r23', 'AI502', 'Edge AI and TinyML', 5, 3, 'Theory', 'AI on edge devices', TRUE),
('ai601-aiml-r23', 'aiml-r23', 'AI601', 'MLOps and Deployment', 6, 4, 'Theory', 'Model deployment and monitoring', TRUE),
('ai801-aiml-r23', 'aiml-r23', 'AI801', 'Project Work', 8, 8, 'Project', 'Capstone project', TRUE);

-- AIDS R23 Courses
INSERT IGNORE INTO subjects (id, branch_id, code, name, semester, credits, type, description, is_active) VALUES 
('ds101-aids-r23', 'aids-r23', 'DS101', 'Foundations of Data Science', 1, 4, 'Theory', 'Data science fundamentals', TRUE),
('ds102-aids-r23', 'aids-r23', 'DS102', 'Mathematics for Data Science I', 1, 4, 'Theory', 'Linear algebra and calculus', TRUE),
('ds103-aids-r23', 'aids-r23', 'DS103', 'Programming for Data Science', 1, 3, 'Theory', 'Python fundamentals', TRUE),
('ds104-aids-r23', 'aids-r23', 'DS104', 'Professional Ethics', 1, 2, 'Theory', 'Data ethics and privacy', TRUE),
('ds105-aids-r23', 'aids-r23', 'DS105', 'Data Science Lab I', 1, 2, 'Lab', 'Python and data handling', TRUE),
('ds201-aids-r23', 'aids-r23', 'DS201', 'Data Analysis and Visualization', 2, 4, 'Theory', 'EDA and visualization techniques', TRUE),
('ds202-aids-r23', 'aids-r23', 'DS202', 'Database Management Systems', 2, 4, 'Theory', 'SQL and NoSQL databases', TRUE),
('ds203-aids-r23', 'aids-r23', 'DS203', 'Mathematics for Data Science II', 2, 3, 'Theory', 'Probability and statistics', TRUE),
('ds301-aids-r23', 'aids-r23', 'DS301', 'Machine Learning for Data Science', 3, 4, 'Theory', 'ML algorithms for data analysis', TRUE),
('ds302-aids-r23', 'aids-r23', 'DS302', 'Big Data Technologies', 3, 4, 'Theory', 'Hadoop, Spark, distributed computing', TRUE),
('ds303-aids-r23', 'aids-r23', 'DS303', 'Statistical Methods', 3, 3, 'Theory', 'Advanced statistical techniques', TRUE),
('ds401-aids-r23', 'aids-r23', 'DS401', 'Deep Learning for Data Science', 4, 4, 'Theory', 'Neural networks for data analysis', TRUE),
('ds402-aids-r23', 'aids-r23', 'DS402', 'Advanced Analytics', 4, 3, 'Theory', 'Predictive and prescriptive analytics', TRUE),
('ds501-aids-r23', 'aids-r23', 'DS501', 'Data Mining', 5, 4, 'Theory', 'Pattern recognition and clustering', TRUE),
('ds502-aids-r23', 'aids-r23', 'DS502', 'Cloud Computing for Data Science', 5, 3, 'Theory', 'Cloud platforms for data processing', TRUE),
('ds601-aids-r23', 'aids-r23', 'DS601', 'Data Engineering', 6, 4, 'Theory', 'Data pipeline and architecture', TRUE),
('ds602-aids-r23', 'aids-r23', 'DS602', 'Business Analytics', 6, 3, 'Theory', 'Business intelligence and decision making', TRUE),
('ds801-aids-r23', 'aids-r23', 'DS801', 'Project Work', 8, 8, 'Project', 'Capstone project', TRUE);
