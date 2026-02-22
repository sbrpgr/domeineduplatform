-- Domain Glossary Platform full bootstrap schema (PostgreSQL + pgvector)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  auth_provider VARCHAR(50) NOT NULL DEFAULT 'email',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(60) UNIQUE,
  display_name VARCHAR(120),
  avatar_url TEXT,
  bio TEXT,
  learning_goal VARCHAR(100),
  preferred_domains TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(80) UNIQUE NOT NULL,
  name_ko VARCHAR(120) NOT NULL,
  name_en VARCHAR(120) NOT NULL,
  priority VARCHAR(2) NOT NULL CHECK (priority IN ('P1', 'P2', 'P3')),
  target_term_count INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES categories(id),
  level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 3),
  slug VARCHAR(120) NOT NULL,
  name_ko VARCHAR(120) NOT NULL,
  name_en VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(domain_id, slug)
);

CREATE TABLE terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(160) UNIQUE NOT NULL,
  term_ko VARCHAR(200) NOT NULL,
  term_en VARCHAR(200),
  pronunciation VARCHAR(220),
  domain_id UUID NOT NULL REFERENCES domains(id),
  category_id UUID REFERENCES categories(id),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('novice', 'beginner', 'intermediate', 'advanced')),
  one_line_definition TEXT NOT NULL,
  image_description TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE term_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL CHECK (level IN ('novice', 'beginner', 'intermediate', 'advanced')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(term_id, level)
);

CREATE TABLE term_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  context TEXT NOT NULL,
  example TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE term_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_alt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE term_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  to_term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  relation VARCHAR(20) NOT NULL CHECK (relation IN ('parent', 'sibling', 'child', 'opposite')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_term_id, to_term_id, relation)
);

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term_id UUID REFERENCES terms(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES domains(id),
  question_type VARCHAR(40) NOT NULL,
  prompt TEXT NOT NULL,
  difficulty_beta NUMERIC(4,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  option_order INT NOT NULL
);

CREATE TABLE user_learning_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  attempts INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  dwell_time_ms BIGINT NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  sm2_repetitions INT NOT NULL DEFAULT 0,
  sm2_interval_days INT NOT NULL DEFAULT 1,
  sm2_easiness NUMERIC(4,2) NOT NULL DEFAULT 2.5,
  next_review_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, term_id)
);

CREATE TABLE user_level_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  previous_level VARCHAR(20),
  new_level VARCHAR(20) NOT NULL,
  changed_reason TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_bookmarks (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, term_id)
);

CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE custom_dictionaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
  slug VARCHAR(100) UNIQUE,
  color_theme VARCHAR(7),
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE custom_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dictionary_id UUID NOT NULL REFERENCES custom_dictionaries(id) ON DELETE CASCADE,
  term_ko VARCHAR(200) NOT NULL,
  term_en VARCHAR(200),
  one_line_definition TEXT,
  definitions JSONB,
  usage_examples JSONB,
  ai_prompt_example TEXT,
  related_platform_term_ids UUID[],
  related_custom_term_ids UUID[],
  difficulty VARCHAR(20),
  tags TEXT[],
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence JSONB,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE custom_dictionary_members (
  dictionary_id UUID NOT NULL REFERENCES custom_dictionaries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (dictionary_id, user_id)
);

CREATE TABLE community_contributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term_id UUID REFERENCES terms(id),
  custom_term_id UUID REFERENCES custom_terms(id),
  proposal JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE term_embeddings (
  term_id UUID PRIMARY KEY REFERENCES terms(id) ON DELETE CASCADE,
  embedding vector(3072) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
