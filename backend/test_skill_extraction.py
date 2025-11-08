#!/usr/bin/env python3
"""
Test script for skill extraction verification.

This script tests the skill extraction endpoint to verify that Gemini output
matches expected output, especially for cases where false positives should be avoided.

Usage:
    # Activate venv first:
    source venv/bin/activate
    python test_skill_extraction.py

    # Or use venv python directly:
    ./venv/bin/python test_skill_extraction.py

    # Or test specific cases:
    python test_skill_extraction.py --text "I know JavaScript" --expected JavaScript
"""

import json
import sys
import argparse
import os
from typing import List, Optional

# Try to use requests, if not available, provide helpful error
try:
    import requests
except ImportError:
    print("Error: 'requests' module not found.")
    print("Please activate the virtual environment first:")
    print("  source venv/bin/activate")
    print("Or install requests:")
    print("  pip install requests")
    sys.exit(1)

# API endpoint
API_URL = "http://localhost:8000/api/skills/test-extraction"

# Test cases
TEST_CASES = [
    {
        "name": "JavaScript only - should NOT extract Java or R",
        "text": "I have 5 years of JavaScript experience",
        "expected_skills": ["JavaScript"],
        "should_not_extract": ["Java", "R"]
    },
    {
        "name": "JavaScript and Java separately - should extract both",
        "text": "I know Java and JavaScript",
        "expected_skills": ["Java", "JavaScript"],
        "should_not_extract": []
    },
    {
        "name": "React only - should NOT extract R",
        "text": "I use React for frontend development",
        "expected_skills": ["React"],
        "should_not_extract": ["R"]
    },
    {
        "name": "TypeScript only - should NOT extract Script",
        "text": "I work with TypeScript",
        "expected_skills": ["TypeScript"],
        "should_not_extract": ["Script"]
    },
    {
        "name": "Multiple skills",
        "text": "I have experience with Python, JavaScript, React, and Node.js",
        "expected_skills": ["Python", "JavaScript", "React", "Node.js"],
        "should_not_extract": ["Java", "R", "Script"]
    },
    {
        "name": "Single letter R as standalone",
        "text": "I know R programming language",
        "expected_skills": ["R"],
        "should_not_extract": []
    }
]

def test_extraction(text: str, expected_skills: Optional[List[str]] = None, should_not_extract: Optional[List[str]] = None):
    """Test skill extraction for a given text."""
    payload = {
        "text": text,
        "expected_skills": expected_skills or [],
        "user_id": "test_user"
    }
    
    try:
        response = requests.post(API_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        
        return result
    except requests.exceptions.RequestException as e:
        print(f"Error calling API: {e}")
        return None

def print_test_result(test_case: dict, result: dict):
    """Print formatted test result."""
    print(f"\n{'='*80}")
    print(f"Test: {test_case['name']}")
    print(f"{'='*80}")
    print(f"Input text: {test_case['text']}")
    print(f"\nExtracted skills ({result['extraction_count']}):")
    for skill in result['extracted_skills']:
        print(f"  - {skill['skill']} ({skill['category']}, {skill['level']})")
    
    if result['comparison']:
        comparison = result['comparison']
        print(f"\nComparison:")
        print(f"  Matches expected: {comparison['matches_expected']}")
        print(f"  Expected: {comparison['expected_count']} skills")
        print(f"  Extracted: {comparison['extracted_count']} skills")
        
        if comparison['matches']:
            print(f"  ✓ Matches: {', '.join(comparison['matches'])}")
        if comparison['missing_skills']:
            print(f"  ✗ Missing: {', '.join(comparison['missing_skills'])}")
        if comparison['unexpected_skills']:
            print(f"  ✗ Unexpected: {', '.join(comparison['unexpected_skills'])}")
    
    # Check for skills that should NOT be extracted
    if test_case.get('should_not_extract'):
        extracted_names = [s.lower() for s in result['extracted_skill_names']]
        false_positives = []
        for skill in test_case['should_not_extract']:
            if skill.lower() in extracted_names:
                false_positives.append(skill)
        
        if false_positives:
            print(f"\n  ⚠ FALSE POSITIVES DETECTED: {', '.join(false_positives)}")
            print(f"     These skills should NOT have been extracted!")
        else:
            print(f"\n  ✓ No false positives detected")
            print(f"     Correctly avoided: {', '.join(test_case['should_not_extract'])}")

def run_all_tests():
    """Run all test cases."""
    print("Running skill extraction tests...")
    print(f"API URL: {API_URL}")
    print("\nMake sure the FastAPI server is running on http://localhost:8000")
    
    passed = 0
    failed = 0
    
    for test_case in TEST_CASES:
        result = test_extraction(
            test_case['text'],
            test_case.get('expected_skills'),
            test_case.get('should_not_extract')
        )
        
        if result:
            print_test_result(test_case, result)
            
            # Check if test passed
            comparison = result.get('comparison')
            if comparison:
                if comparison['matches_expected']:
                    # Also check for false positives
                    if test_case.get('should_not_extract'):
                        extracted_names = [s.lower() for s in result['extracted_skill_names']]
                        false_positives = [s for s in test_case['should_not_extract'] if s.lower() in extracted_names]
                        if not false_positives:
                            passed += 1
                        else:
                            failed += 1
                    else:
                        passed += 1
                else:
                    failed += 1
            else:
                # No comparison, just check for false positives
                if test_case.get('should_not_extract'):
                    extracted_names = [s.lower() for s in result['extracted_skill_names']]
                    false_positives = [s for s in test_case['should_not_extract'] if s.lower() in extracted_names]
                    if not false_positives:
                        passed += 1
                    else:
                        failed += 1
                else:
                    passed += 1
        else:
            failed += 1
            print(f"\n✗ Test failed: {test_case['name']}")
    
    print(f"\n{'='*80}")
    print(f"Test Summary: {passed} passed, {failed} failed")
    print(f"{'='*80}")

def main():
    global API_URL
    
    parser = argparse.ArgumentParser(description='Test skill extraction endpoint')
    parser.add_argument('--text', type=str, help='Text to test')
    parser.add_argument('--expected', nargs='+', help='Expected skills (space-separated)')
    parser.add_argument('--url', type=str, default=API_URL, help='API URL')
    
    args = parser.parse_args()
    
    API_URL = args.url
    
    if args.text:
        # Test single case
        result = test_extraction(args.text, args.expected)
        if result:
            print_test_result({
                'name': 'Custom test',
                'text': args.text,
                'expected_skills': args.expected or [],
                'should_not_extract': []
            }, result)
    else:
        # Run all tests
        run_all_tests()

if __name__ == "__main__":
    main()

