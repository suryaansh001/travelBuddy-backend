-- ============================================================================
-- CUSTOM FUNCTIONS & TRIGGERS
-- ============================================================================

-- 1. Trust Score Update Trigger
CREATE OR REPLACE FUNCTION update_trust_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET trust_score = (
        SELECT COALESCE(AVG(overall_rating), 5.0)
        FROM reviews
        WHERE reviewed_user_id = NEW.reviewed_user_id
          AND type = 'companion'
          AND is_verified = TRUE
    )
    WHERE id = NEW.reviewed_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_trust_score
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW 
WHEN (NEW.type = 'companion' AND NEW.is_verified = TRUE)
EXECUTE FUNCTION update_trust_score();

-- ============================================================================
-- 2. Transaction-Safe Seat Booking
-- ============================================================================

CREATE OR REPLACE FUNCTION accept_match(
    p_match_id UUID,
    p_seats_to_confirm INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_trip_id UUID;
    v_available_seats INTEGER;
BEGIN
    -- Get trip ID
    SELECT trip_id INTO v_trip_id
    FROM matches
    WHERE id = p_match_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Match not found or already processed';
    END IF;
    
    -- Lock trip row and check seats
    SELECT available_seats INTO v_available_seats
    FROM trips
    WHERE id = v_trip_id
    FOR UPDATE;
    
    IF v_available_seats < p_seats_to_confirm THEN
        RAISE EXCEPTION 'Not enough seats available';
    END IF;
    
    -- Update match
    UPDATE matches
    SET status = 'accepted',
        seats_confirmed = p_seats_to_confirm,
        accepted_at = CURRENT_TIMESTAMP
    WHERE id = p_match_id;
    
    -- Update trip seats
    UPDATE trips
    SET available_seats = available_seats - p_seats_to_confirm,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_trip_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. Cancel Match (Return Seats)
-- ============================================================================

CREATE OR REPLACE FUNCTION cancel_match(p_match_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_trip_id UUID;
    v_seats_confirmed INTEGER;
BEGIN
    SELECT trip_id, seats_confirmed INTO v_trip_id, v_seats_confirmed
    FROM matches
    WHERE id = p_match_id AND status = 'accepted';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Match not found or not in accepted state';
    END IF;
    
    -- Lock and update
    UPDATE trips
    SET available_seats = available_seats + v_seats_confirmed
    WHERE id = v_trip_id;
    
    UPDATE matches
    SET status = 'cancelled',
        cancelled_at = CURRENT_TIMESTAMP
    WHERE id = p_match_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Materialized View for Trip Participants
-- ============================================================================

CREATE MATERIALIZED VIEW trip_participants AS
SELECT 
    m.trip_id,
    m.matched_user_id as user_id,
    m.seats_confirmed,
    m.accepted_at as joined_at,
    u.full_name,
    u.profile_photo_url,
    u.trust_score,
    'participant' as role
FROM matches m
JOIN users u ON u.id = m.matched_user_id
WHERE m.status = 'accepted'

UNION ALL

SELECT 
    t.id as trip_id,
    t.created_by as user_id,
    0 as seats_confirmed,
    t.created_at as joined_at,
    u.full_name,
    u.profile_photo_url,
    u.trust_score,
    'creator' as role
FROM trips t
JOIN users u ON u.id = t.created_by;

CREATE UNIQUE INDEX idx_trip_participants_pk ON trip_participants(trip_id, user_id);
CREATE INDEX idx_trip_participants_trip ON trip_participants(trip_id);
CREATE INDEX idx_trip_participants_user ON trip_participants(user_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_trip_participants()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY trip_participants;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_participants
AFTER INSERT OR UPDATE OR DELETE ON matches
FOR EACH STATEMENT EXECUTE FUNCTION refresh_trip_participants();

-- ============================================================================
-- 5. Cancellation Rate Function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_cancellation_rate(p_user_id UUID)
RETURNS DECIMAL(5,2) AS $$
    SELECT 
        CASE 
            WHEN (total_completed + total_cancelled) = 0 THEN 0
            ELSE ROUND((total_cancelled::DECIMAL / (total_completed + total_cancelled)) * 100, 2)
        END
    FROM (
        SELECT 
            COUNT(*) FILTER (WHERE t.status = 'completed') as total_completed,
            COUNT(*) FILTER (WHERE m.status = 'cancelled') as total_cancelled
        FROM matches m
        JOIN trips t ON t.id = m.trip_id
        WHERE m.matched_user_id = p_user_id OR m.trip_creator_id = p_user_id
    ) stats;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- 6. PostGIS Extensions (if using geographic queries)
-- Note: These extensions may not be available in all PostgreSQL instances.
-- Uncomment and run manually if your database supports them.
-- ============================================================================

-- CREATE EXTENSION IF NOT EXISTS cube;
-- CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Geo indexes (run after enabling extensions if supported)
-- CREATE INDEX idx_trips_origin_geo ON trips USING gist(ll_to_earth(origin_lat, origin_lng));
-- CREATE INDEX idx_trips_dest_geo ON trips USING gist(ll_to_earth(destination_lat, destination_lng));
