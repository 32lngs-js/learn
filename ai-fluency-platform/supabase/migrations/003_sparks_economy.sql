-- Sparks Economy Schema
-- Parallel currency system (does not touch existing XP tables)

-- Transaction type enum
CREATE TYPE spark_tx_type AS ENUM (
  'lesson_completed',
  'quiz_completed',
  'streak_bonus',
  'weekly_milestone',
  'achievement_earned',
  'course_unlock',
  'cooldown_skip',
  'cosmetic_purchase',
  'giveaway_entry',
  'spark_purchase',
  'subscription_daily',
  'creator_revenue',
  'admin_adjustment'
);

-- ============================================================
-- spark_wallets
-- ============================================================
CREATE TABLE spark_wallets (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  is_subscriber BOOLEAN NOT NULL DEFAULT false,
  subscriber_since TIMESTAMPTZ,
  subscriber_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE spark_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON spark_wallets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON spark_wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON spark_wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- spark_transactions (append-only ledger)
-- ============================================================
CREATE TABLE spark_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tx_type spark_tx_type NOT NULL,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  idempotency_key TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, idempotency_key)
);

ALTER TABLE spark_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON spark_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON spark_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_spark_transactions_user ON spark_transactions(user_id);
CREATE INDEX idx_spark_transactions_created ON spark_transactions(user_id, created_at DESC);

-- ============================================================
-- spark_daily_caps
-- ============================================================
CREATE TABLE spark_daily_caps (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cap_date DATE NOT NULL,
  earned_today INTEGER NOT NULL DEFAULT 0,
  lessons_today INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, cap_date)
);

ALTER TABLE spark_daily_caps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily caps" ON spark_daily_caps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily caps" ON spark_daily_caps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily caps" ON spark_daily_caps
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- course_unlocks
-- ============================================================
CREATE TABLE course_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  unlock_method TEXT NOT NULL,
  spark_cost INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, course_id)
);

ALTER TABLE course_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own unlocks" ON course_unlocks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own unlocks" ON course_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- streak_state
-- ============================================================
CREATE TABLE streak_state (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  freezes_remaining INTEGER NOT NULL DEFAULT 0,
  grace_days_used INTEGER NOT NULL DEFAULT 0,
  streak_at_grace_start INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE streak_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own streak" ON streak_state
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON streak_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON streak_state
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- cooldown_state
-- ============================================================
CREATE TABLE cooldown_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  lessons_used_today INTEGER NOT NULL DEFAULT 0,
  next_lesson_available TIMESTAMPTZ,
  cooldown_date DATE NOT NULL,
  UNIQUE(user_id, course_id, cooldown_date)
);

ALTER TABLE cooldown_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cooldowns" ON cooldown_state
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cooldowns" ON cooldown_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cooldowns" ON cooldown_state
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- achievement_definitions (public read)
-- ============================================================
CREATE TABLE achievement_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  spark_reward INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON achievement_definitions
  FOR SELECT USING (true);

-- ============================================================
-- user_achievements
-- ============================================================
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievement_definitions(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- subscriptions
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  payment_provider TEXT,
  external_id TEXT
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ab_experiments
-- ============================================================
CREATE TABLE ab_experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parameter_key TEXT NOT NULL,
  variants JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed')) DEFAULT 'draft'
);

ALTER TABLE ab_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view experiments" ON ab_experiments
  FOR SELECT USING (true);

-- ============================================================
-- ab_assignments
-- ============================================================
CREATE TABLE ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  experiment_id TEXT NOT NULL REFERENCES ab_experiments(id),
  variant_id TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, experiment_id)
);

ALTER TABLE ab_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own assignments" ON ab_assignments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assignments" ON ab_assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- creator_courses
-- ============================================================
CREATE TABLE creator_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '{}',
  spark_price INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'published')) DEFAULT 'draft',
  review_notes TEXT,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_revenue INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE creator_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view published courses" ON creator_courses
  FOR SELECT USING (status = 'published' OR auth.uid() = creator_id);
CREATE POLICY "Users can insert own courses" ON creator_courses
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own courses" ON creator_courses
  FOR UPDATE USING (auth.uid() = creator_id);

-- ============================================================
-- creator_payouts
-- ============================================================
CREATE TABLE creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES creator_courses(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  total_sparks INTEGER NOT NULL,
  creator_share INTEGER NOT NULL,
  platform_share INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Creators can view own payouts" ON creator_payouts
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users can insert payouts" ON creator_payouts
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- ============================================================
-- Atomic DB functions
-- ============================================================

-- earn_sparks: atomic credit with idempotency + daily cap
CREATE OR REPLACE FUNCTION earn_sparks(
  p_user_id UUID,
  p_tx_type spark_tx_type,
  p_amount INTEGER,
  p_idempotency_key TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(awarded BOOLEAN, new_balance INTEGER, daily_total INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_balance INTEGER;
  v_is_subscriber BOOLEAN;
  v_multiplier INTEGER;
  v_daily_cap INTEGER;
  v_earned_today INTEGER;
  v_effective_amount INTEGER;
  v_new_balance INTEGER;
  v_new_daily INTEGER;
BEGIN
  -- Check idempotency
  IF EXISTS (
    SELECT 1 FROM spark_transactions
    WHERE spark_transactions.user_id = p_user_id
      AND spark_transactions.idempotency_key = p_idempotency_key
  ) THEN
    SELECT sw.balance INTO v_existing_balance
    FROM spark_wallets sw WHERE sw.user_id = p_user_id;
    SELECT sdc.earned_today INTO v_earned_today
    FROM spark_daily_caps sdc
    WHERE sdc.user_id = p_user_id AND sdc.cap_date = CURRENT_DATE;
    RETURN QUERY SELECT false, COALESCE(v_existing_balance, 0), COALESCE(v_earned_today, 0);
    RETURN;
  END IF;

  -- Ensure wallet exists
  INSERT INTO spark_wallets (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Check subscriber status
  SELECT sw.is_subscriber INTO v_is_subscriber
  FROM spark_wallets sw WHERE sw.user_id = p_user_id;

  v_multiplier := CASE WHEN v_is_subscriber THEN 2 ELSE 1 END;
  v_daily_cap := CASE WHEN v_is_subscriber THEN 1000 ELSE 500 END;

  -- Get/create daily cap record
  INSERT INTO spark_daily_caps (user_id, cap_date, earned_today, lessons_today)
  VALUES (p_user_id, CURRENT_DATE, 0, 0)
  ON CONFLICT (user_id, cap_date) DO NOTHING;

  SELECT sdc.earned_today INTO v_earned_today
  FROM spark_daily_caps sdc
  WHERE sdc.user_id = p_user_id AND sdc.cap_date = CURRENT_DATE;

  -- Calculate effective amount (capped)
  v_effective_amount := LEAST(p_amount * v_multiplier, v_daily_cap - v_earned_today);
  IF v_effective_amount <= 0 THEN
    SELECT sw.balance INTO v_existing_balance
    FROM spark_wallets sw WHERE sw.user_id = p_user_id;
    RETURN QUERY SELECT false, COALESCE(v_existing_balance, 0), v_earned_today;
    RETURN;
  END IF;

  -- Credit wallet
  UPDATE spark_wallets
  SET balance = balance + v_effective_amount,
      lifetime_earned = lifetime_earned + v_effective_amount,
      updated_at = now()
  WHERE spark_wallets.user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- Record transaction
  INSERT INTO spark_transactions (user_id, tx_type, amount, balance_after, idempotency_key, metadata)
  VALUES (p_user_id, p_tx_type, v_effective_amount, v_new_balance, p_idempotency_key, p_metadata);

  -- Update daily cap
  UPDATE spark_daily_caps
  SET earned_today = earned_today + v_effective_amount
  WHERE spark_daily_caps.user_id = p_user_id AND cap_date = CURRENT_DATE
  RETURNING earned_today INTO v_new_daily;

  RETURN QUERY SELECT true, v_new_balance, v_new_daily;
END;
$$;

-- spend_sparks: atomic debit with idempotency
CREATE OR REPLACE FUNCTION spend_sparks(
  p_user_id UUID,
  p_tx_type spark_tx_type,
  p_amount INTEGER,
  p_idempotency_key TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Check idempotency
  IF EXISTS (
    SELECT 1 FROM spark_transactions
    WHERE spark_transactions.user_id = p_user_id
      AND spark_transactions.idempotency_key = p_idempotency_key
  ) THEN
    SELECT sw.balance INTO v_existing_balance
    FROM spark_wallets sw WHERE sw.user_id = p_user_id;
    RETURN QUERY SELECT false, COALESCE(v_existing_balance, 0);
    RETURN;
  END IF;

  -- Attempt debit
  UPDATE spark_wallets
  SET balance = balance - p_amount,
      lifetime_spent = lifetime_spent + p_amount,
      updated_at = now()
  WHERE spark_wallets.user_id = p_user_id AND balance >= p_amount
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    SELECT sw.balance INTO v_existing_balance
    FROM spark_wallets sw WHERE sw.user_id = p_user_id;
    RETURN QUERY SELECT false, COALESCE(v_existing_balance, 0);
    RETURN;
  END IF;

  -- Record transaction
  INSERT INTO spark_transactions (user_id, tx_type, amount, balance_after, idempotency_key, metadata)
  VALUES (p_user_id, p_tx_type, -p_amount, v_new_balance, p_idempotency_key, p_metadata);

  RETURN QUERY SELECT true, v_new_balance;
END;
$$;

-- update_streak: graceful degradation
CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS TABLE(new_streak INTEGER, was_frozen BOOLEAN, is_degraded BOOLEAN, freezes_left INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_activity DATE;
  v_freezes INTEGER;
  v_days_missed INTEGER;
  v_was_frozen BOOLEAN := false;
  v_is_degraded BOOLEAN := false;
  v_new_streak INTEGER;
BEGIN
  -- Ensure streak record exists
  INSERT INTO streak_state (user_id, current_streak, longest_streak, last_activity_date, freezes_remaining)
  VALUES (p_user_id, 0, 0, NULL, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT ss.current_streak, ss.longest_streak, ss.last_activity_date, ss.freezes_remaining
  INTO v_current_streak, v_longest_streak, v_last_activity, v_freezes
  FROM streak_state ss WHERE ss.user_id = p_user_id;

  -- First activity ever
  IF v_last_activity IS NULL THEN
    v_new_streak := 1;
  -- Same day
  ELSIF v_last_activity = CURRENT_DATE THEN
    RETURN QUERY SELECT v_current_streak, false, false, v_freezes;
    RETURN;
  ELSE
    v_days_missed := (CURRENT_DATE - v_last_activity) - 1; -- days between, excluding today

    IF v_days_missed = 0 THEN
      -- Consecutive day
      v_new_streak := v_current_streak + 1;
    ELSIF v_days_missed = 1 AND v_freezes > 0 THEN
      -- 1-day gap with freeze available
      v_freezes := v_freezes - 1;
      v_was_frozen := true;
      v_new_streak := v_current_streak + 1;
    ELSIF v_days_missed BETWEEN 1 AND 3 THEN
      -- Graceful degradation: lose 1 per day missed, floor at 1
      v_new_streak := GREATEST(1, v_current_streak - v_days_missed);
      v_is_degraded := true;
    ELSE
      -- 4+ days missed: full reset
      v_new_streak := 1;
    END IF;
  END IF;

  -- Update longest
  IF v_new_streak > v_longest_streak THEN
    v_longest_streak := v_new_streak;
  END IF;

  UPDATE streak_state
  SET current_streak = v_new_streak,
      longest_streak = v_longest_streak,
      last_activity_date = CURRENT_DATE,
      freezes_remaining = v_freezes,
      grace_days_used = CASE WHEN v_is_degraded THEN grace_days_used + v_days_missed ELSE grace_days_used END,
      streak_at_grace_start = CASE WHEN v_is_degraded AND grace_days_used = 0 THEN v_current_streak ELSE streak_at_grace_start END,
      updated_at = now()
  WHERE streak_state.user_id = p_user_id;

  RETURN QUERY SELECT v_new_streak, v_was_frozen, v_is_degraded, v_freezes;
END;
$$;

-- ============================================================
-- Seed achievement definitions
-- ============================================================
INSERT INTO achievement_definitions (id, name, description, icon, spark_reward, category, criteria, sort_order) VALUES
  ('first_lesson', 'First Steps', 'Complete your first lesson', 'book-open', 10, 'learning', '{"type": "lessons_completed", "count": 1}', 1),
  ('lessons_10', 'Getting Started', 'Complete 10 lessons', 'books', 25, 'learning', '{"type": "lessons_completed", "count": 10}', 2),
  ('lessons_50', 'Dedicated Learner', 'Complete 50 lessons', 'graduation-cap', 50, 'learning', '{"type": "lessons_completed", "count": 50}', 3),
  ('lessons_100', 'Century Club', 'Complete 100 lessons', 'trophy', 100, 'learning', '{"type": "lessons_completed", "count": 100}', 4),
  ('streak_3', 'On a Roll', 'Reach a 3-day streak', 'flame', 15, 'streak', '{"type": "streak", "days": 3}', 5),
  ('streak_7', 'Week Warrior', 'Reach a 7-day streak', 'fire', 30, 'streak', '{"type": "streak", "days": 7}', 6),
  ('streak_14', 'Fortnight Focus', 'Reach a 14-day streak', 'zap', 50, 'streak', '{"type": "streak", "days": 14}', 7),
  ('streak_30', 'Monthly Master', 'Reach a 30-day streak', 'crown', 100, 'streak', '{"type": "streak", "days": 30}', 8),
  ('course_complete_1', 'Course Conqueror', 'Complete your first course', 'award', 50, 'courses', '{"type": "courses_completed", "count": 1}', 9),
  ('course_complete_3', 'Triple Threat', 'Complete 3 courses', 'medal', 100, 'courses', '{"type": "courses_completed", "count": 3}', 10),
  ('quiz_perfect', 'Perfect Score', 'Get a perfect score on a quiz', 'star', 20, 'quiz', '{"type": "quiz_perfect"}', 11),
  ('quiz_streak_7', 'Quiz Machine', 'Complete quizzes 7 days in a row', 'target', 40, 'quiz', '{"type": "quiz_streak", "days": 7}', 12),
  ('first_purchase', 'First Investment', 'Make your first Sparks purchase', 'shopping-bag', 10, 'economy', '{"type": "purchase"}', 13),
  ('creator_first', 'Course Creator', 'Publish your first community course', 'pen-tool', 75, 'creator', '{"type": "courses_created", "count": 1}', 14);
