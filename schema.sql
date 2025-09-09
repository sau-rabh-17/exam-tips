-- ===========================
-- USERS TABLE (main account info)
-- ===========================
CREATE TABLE IF NOT EXISTS users (
    aadhar VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT,
    gender VARCHAR(10),
    college_address TEXT,
    branch VARCHAR(100),
    technical_skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- USER_INFO TABLE (profile / wall data)
-- ===========================
CREATE TABLE IF NOT EXISTS user_info (
    aadhar VARCHAR(20) PRIMARY KEY REFERENCES users(aadhar) ON DELETE CASCADE,
    name VARCHAR(100),
    skills TEXT,
    about TEXT DEFAULT '',
    contributions TEXT DEFAULT '',
    experiences TEXT DEFAULT '',
    repositories TEXT[] DEFAULT '{}'
);

-- ===========================
-- EREPO TABLE (repositories/projects)
-- ===========================
CREATE TABLE IF NOT EXISTS erepo (
    id SERIAL PRIMARY KEY,
    aadhar VARCHAR(20) REFERENCES users(aadhar) ON DELETE CASCADE,
    user_name VARCHAR(100),
    repo_name VARCHAR(150) NOT NULL,
    description TEXT,
    is_readme BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- POSTS TABLE (forum)
-- ===========================
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    aadhar VARCHAR(20) REFERENCES users(aadhar) ON DELETE CASCADE,
    name VARCHAR(100),
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- EXAM_QUESTIONS TABLE (exam bank)
-- ===========================
CREATE TABLE IF NOT EXISTS exam_questions (
    id SERIAL PRIMARY KEY,
    language VARCHAR(50) NOT NULL,         -- 'java', 'cpp', 'python'
    question TEXT NOT NULL,
    option1 TEXT NOT NULL,
    option2 TEXT NOT NULL,
    option3 TEXT NOT NULL,
    option4 TEXT NOT NULL,
    correct_answer INT NOT NULL CHECK (correct_answer BETWEEN 1 AND 4)
);

-- ===========================
-- EXAM_RESULTS TABLE (exam history)
-- ===========================
CREATE TABLE IF NOT EXISTS exam_results (
    id SERIAL PRIMARY KEY,
    aadhar VARCHAR(20) REFERENCES users(aadhar) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    percentage INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
