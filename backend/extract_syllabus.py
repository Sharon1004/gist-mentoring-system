#!/usr/bin/env python3
"""
Extract course structure from PDF syllabi and generate SQL insert statements
"""

import os
import json
import re
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("Installing pdfplumber...")
    os.system("pip install pdfplumber -q")
    import pdfplumber

SYLLABUS_DIR = Path(__file__).parent.parent / "Syllabus"

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            return text
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return ""

def extract_courses_from_text(text, branch_name, regulation):
    """Extract course information from PDF text"""
    courses = []
    
    # Common patterns to find semester info
    semester_pattern = r'(SEMESTER|Sem)[:\s]*(\d)'
    course_pattern = r'([A-Z0-9]{2,6})\s+([^0-9]+?)\s+(\d+(?:\.\d+)?)\s+(Theory|Lab|Practical|Project)'
    
    lines = text.split('\n')
    current_semester = None
    
    for i, line in enumerate(lines):
        # Check for semester
        sem_match = re.search(semester_pattern, line, re.IGNORECASE)
        if sem_match:
            current_semester = int(sem_match.group(2))
        
        # Check for course code
        if re.search(r'^[A-Z]{2,4}\d{2,3}', line.strip()):
            parts = line.strip().split()
            if len(parts) >= 4:
                try:
                    course_code = parts[0]
                    course_name = ' '.join(parts[1:-2])
                    credits = float(parts[-2])
                    course_type = parts[-1] if parts[-1] in ['Theory', 'Lab', 'Practical', 'Project'] else 'Theory'
                    
                    if current_semester:
                        courses.append({
                            'code': course_code,
                            'name': course_name,
                            'credits': credits,
                            'type': course_type,
                            'semester': current_semester,
                            'branch': branch_name,
                            'regulation': regulation
                        })
                except:
                    pass
    
    return courses

def process_syllabi():
    """Process all syllabus PDFs"""
    all_courses = []
    
    # Mapping of PDF files to branches and regulations
    pdf_mapping = {
        'RG23-CSE-Syllabus.pdf': ('CSE', 'r23'),
        'RG-23-ece-Syllabus.pdf': ('ECE', 'r23'),
        'RG23-EEE-Syllabus-1.pdf': ('EEE', 'r23'),
        'RG23-CIVIL-COURSESTRUCTURE-AND-SYLLABUS.pdf': ('CIVIL', 'r23'),
        'AIML-RG23-COURSE-STRUCTURE-SYLLABUS.pdf': ('AIML', 'r23'),
        'AIDS-I-II-YEAR-COURTSE-STRUCTURE-SYLLABUS.pdf': ('AIDS', 'r23'),
    }
    
    for pdf_file, (branch, regulation) in pdf_mapping.items():
        pdf_path = SYLLABUS_DIR / pdf_file
        if pdf_path.exists():
            print(f"Processing {pdf_file}...")
            text = extract_text_from_pdf(pdf_path)
            if text:
                courses = extract_courses_from_text(text, branch, regulation)
                all_courses.extend(courses)
                print(f"  Found {len(courses)} courses for {branch}")
            else:
                print(f"  No text extracted from {pdf_file}")
        else:
            print(f"  File not found: {pdf_path}")
    
    return all_courses

def generate_sql_statements(courses):
    """Generate SQL insert statements"""
    sql_statements = []
    
    # Generate unique branch IDs
    branches_added = {}
    regulations_added = set()
    
    for course in courses:
        regulation = course['regulation']
        branch = course['branch']
        branch_id = f"{branch.lower()}-{regulation}"
        
        # Add regulation if not exists
        if regulation not in regulations_added:
            if regulation == 'r23':
                sql_statements.append(
                    f"INSERT IGNORE INTO regulations (id, name, description, is_active) "
                    f"VALUES ('r23', 'R23 Regulation', 'Autonomous Regulation 2023', TRUE);"
                )
            regulations_added.add(regulation)
        
        # Add branch if not exists
        if branch_id not in branches_added:
            branch_full_names = {
                'cse': 'Computer Science and Engineering',
                'ece': 'Electronics and Communication Engineering',
                'eee': 'Electrical and Electronics Engineering',
                'civil': 'Civil Engineering',
                'aiml': 'Artificial Intelligence and Machine Learning',
                'aids': 'Artificial Intelligence and Data Science'
            }
            branch_name = branch_full_names.get(branch.lower(), branch)
            sql_statements.append(
                f"INSERT IGNORE INTO branches (id, regulation_id, name, code, description, is_active) "
                f"VALUES ('{branch_id}', '{regulation}', '{branch_name}', '{branch}', '{branch} Branch', TRUE);"
            )
            branches_added[branch_id] = True
    
    # Add subjects
    subject_added = set()
    for course in courses:
        branch_id = f"{course['branch'].lower()}-{course['regulation']}"
        subject_id = f"{course['code']}-{branch_id}"
        
        if subject_id not in subject_added:
            course_name = course['name'].replace("'", "\\'")
            sql_statements.append(
                f"INSERT IGNORE INTO subjects "
                f"(id, branch_id, code, name, semester, credits, type, description, is_active) "
                f"VALUES ('{subject_id}', '{branch_id}', '{course['code']}', '{course_name}', "
                f"{course['semester']}, {course['credits']}, '{course['type']}', NULL, TRUE);"
            )
            subject_added.add(subject_id)
    
    return sql_statements

def main():
    print("=" * 60)
    print("SYLLABUS EXTRACTION TOOL")
    print("=" * 60)
    
    if not SYLLABUS_DIR.exists():
        print(f"Error: Syllabus directory not found at {SYLLABUS_DIR}")
        return
    
    print(f"\nReading PDFs from: {SYLLABUS_DIR}")
    
    courses = process_syllabi()
    
    if courses:
        print(f"\nTotal courses extracted: {len(courses)}")
        
        # Generate SQL
        sql_statements = generate_sql_statements(courses)
        
        # Save SQL to file
        sql_file = Path(__file__).parent / "insert_subjects.sql"
        with open(sql_file, 'w') as f:
            f.write("-- Auto-generated subject insertion script\n\n")
            for stmt in sql_statements:
                f.write(stmt + "\n")
        
        print(f"SQL statements saved to: {sql_file}")
        
        # Also save JSON for reference
        json_file = Path(__file__).parent / "courses_data.json"
        with open(json_file, 'w') as f:
            json.dump(courses, f, indent=2)
        
        print(f"Course data saved to: {json_file}")
        print("\nSQL Preview:")
        print("-" * 60)
        for stmt in sql_statements[:10]:
            print(stmt)
        if len(sql_statements) > 10:
            print(f"... and {len(sql_statements) - 10} more statements")
    else:
        print("No courses extracted from PDFs")

if __name__ == "__main__":
    main()
